import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppRegistry, StyleSheet, View } from 'react-native';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import StaticContainer from 'static-container';

let rootId = 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative'
  },
  offStream: {
    position: 'absolute'
  }
});

const CREATE_EVENT = 'ROOT_ELEMENT_CREATE';

const UPDATE_EVENT = 'ROOT_ELEMENT_UPDATE';

let emitter = AppRegistry.rootSiblingsEmitter;

if (!(emitter instanceof EventEmitter)) {
  emitter = new EventEmitter();
  // inject modals into app entry component
  const originRegister = AppRegistry.registerComponent;

  AppRegistry.registerComponent = (appKey, getAppComponent) => {
    const siblings = new Map();
    const updates = new Set();

    return originRegister(appKey, () => {
      const OriginAppComponent = getAppComponent();

      return class extends Component {

        static displayName = `Root(${appKey})`;

        constructor(props) {
          super(props);
          this.update = this.update.bind(this);
          ['update', 'create'].forEach(f => this[f] = this[f].bind(this));
          emitter.addListener(CREATE_EVENT, this.create);
          emitter.addListener(UPDATE_EVENT, this.update);
        }

        componentWillUnmount() {
          emitter.removeListener(CREATE_EVENT, this.create);
          emitter.removeListener(UPDATE_EVENT, this.update);
          siblings.clear();
          updates.clear();
        }

        create({id, SiblingComponent, props, callback}) {
          if (siblings.has(id) && !SiblingComponent) {
            siblings.delete(id);
          } else if (SiblingComponent) {
            siblings.set(id, {
              SiblingComponent,
              props
            });
            updates.add(id);
          }
          this.forceUpdate(callback);
        }

        update({id, props, callback}) {
          if (siblings.has(id)) {
            const sibling = siblings.get(id);
            sibling.props = props;
            siblings.set(id, sibling);
          }
          updates.add(id);
          this.forceUpdate(callback);
        }

        render() {
          const elements = [];
          siblings.forEach(({SiblingComponent, props}, id) => {
            elements.push(
              <StaticContainer
                key={`root-sibling-${id}`}
                shouldUpdate={updates.has(id)}
              >
                <SiblingComponent {...props}/>
              </StaticContainer>
            );
          });
          updates.clear();

          return (
            <View style={styles.container}>
              <StaticContainer shouldUpdate={false}>
                <OriginAppComponent {...this.props} />
              </StaticContainer>
              {elements}
            </View>
          );
        }
      };
    });
  };

  AppRegistry.rootSiblingsEmitter = emitter;
}

class RootManager {

  _id = null;
  props;
  component;

  constructor(ElementComponent, props) {
    Object.defineProperty(this, '_id', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: rootId++
    });
    this.component = ElementComponent;
    this.props = props;
    const manager = this;
    emitter.emit(CREATE_EVENT, {
      id: this._id,
      SiblingComponent: class SiblingComponent extends Component {
        static childContextTypes = {
          manager: PropTypes.object
        };

        getChildContext() {
          return {
            manager
          };
        }

        componentWillUnmount() {
          manager.destroy();
        }

        render() {
          return <ElementComponent {...this.props}/>;
        }
      },
      props
    });
  }

  update(props, callback) {
    this.props = props;
    emitter.emit(UPDATE_EVENT, {
      id: this._id,
      props,
      callback
    });
  }

  destroy(callback) {
    emitter.emit(CREATE_EVENT, {
      id: this._id,
      callback
    });
  }

}

export function createRootView(RootView, props) {
  return new RootManager(RootView, props);
}

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 16/8/11
 */
export default function createRootNode(RootView) {

  return class extends Component {

    manager;

    componentWillMount() {
      this.manager = new RootManager(RootView, this.props);
    }

    componentWillUpdate(nextProps) {
      this.manager.update(nextProps);
    }

    componentWillUnmount() {
      this.manager.destroy();
    }

    render() {
      return <View/>;
    }
  };
}
