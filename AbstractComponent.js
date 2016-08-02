import { Component } from 'react';

const excludeFunc = [
  'constructor',
  'render',
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount'
];

/**
 * 1、实现自动绑定
 *
 * @author Sean sean.snow@live.com
 */
class Container extends Component {

  constructor(props) {
    super(props);
    // noinspection Eslint
    let propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    propertyNames.forEach(func => {
      if (excludeFunc.indexOf(func) === -1 && typeof this[func] === 'function') {
        this[func] = this[func].bind(this);
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props !== nextProps || this.state !== nextState;
  }


}

export default Container;
