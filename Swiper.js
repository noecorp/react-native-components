import React, { Children } from 'react';
import Component from './AbstractComponent';
import PropTypes from 'prop-types';
import { StyleSheet, View, ViewPropTypes } from 'react-native';
import { TabViewAnimated } from 'react-native-tab-view';

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  dotContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    zIndex: 9999
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,.2)',
    marginHorizontal: 3
  },
  activeDot: {
    backgroundColor: '#007aff'
  }
});

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 2017/10/18
 */
export default class Swiper extends Component {

  static propTypes = {
    autoPlay: PropTypes.bool,
    containerStyle: ViewPropTypes.style,
    duration: PropTypes.number
  };

  static defaultProps = {
    autoPlay: false,
    duration: 2500,
    horizontal: true
  };

  state = {
    index: 0,
    routes: []
  };

  autoPlayTask;

  componentWillMount() {
    const {children} = this.props;
    this.updateRoute(children);
    this.autoPlay();
  }

  componentWillReceiveProps({children}) {
    this.updateRoute(children);
  }

  componentWillUnmount() {
    this.autoPlayTask && clearInterval(this.autoPlayTask);
  }

  updateRoute(children) {
    this.setState({
      index: 0,
      routes: Children.toArray(children).map((child, index) => ({
        key: `${index}`
      }))
    });
  }

  autoPlay() {
    const {autoPlay, duration} = this.props;
    if (autoPlay) {
      this.autoPlayTask = setInterval(() => {
        const {index, routes} = this.state;
        let next = index + 1;
        if (!routes[next]) {
          next = 0;
        }
        this.setState({index: next});
      }, duration);
    } else {
      this.autoPlayTask && clearInterval(this.autoPlayTask);
    }
  }

  handleIndexChange(index) {
    this.setState({index});
  }

  renderScene({route}) {
    const {children} = this.props;
    const {key} = route;
    return Children.toArray(children)[key];
  }

  renderPagination() {
    const {index, routes} = this.state;
    return (
      <View style={styles.dotContainer}>
        {routes.map(({key}) => (
          <View key={key}
                style={[styles.dot, `${index}` === key ? styles.activeDot : null]}
          />
        ))}
      </View>
    );
  }

  render() {
    const {containerStyle, style} = this.props;
    return (
      <View style={[styles.container, containerStyle]}>
        <TabViewAnimated navigationState={this.state}
                         onIndexChange={this.handleIndexChange}
                         renderHeader={this.renderPagination}
                         renderScene={this.renderScene}
                         style={style}
        />
      </View>
    );
  }

}
