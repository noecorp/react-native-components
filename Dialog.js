import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, BackHandler, StatusBar, StyleSheet, Text, TouchableOpacity, View, ViewPropTypes } from 'react-native';
import Component from './AbstractComponent';
import { View as AnimatableView } from 'react-native-animatable';
import createRootNode from './createRootNode';
import commonStyles from './styles';

const styles = StyleSheet.create({
  container: {
    ...commonStyles.fullScreenAbsolute
  },
  loadingStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.4)'
  },
  content: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  text: {
    marginTop: 5,
    color: '#FFF'
  }
});

function handleAndroidBackPress() {
  return true;
}

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 16/5/24
 */
export class AbstractDialog extends Component {

  static propTypes = {
    autoDisableAndroidBackPress: PropTypes.bool,
    hideAnimation: PropTypes.object,
    loadingDialog: PropTypes.bool,
    loadingProps: PropTypes.object,
    showAnimation: PropTypes.object,
    statusBarAutoHidden: PropTypes.bool,
    style: ViewPropTypes.style,
    visible: PropTypes.bool,
    onPress: PropTypes.func
  };

  static defaultProps = {
    autoDisableAndroidBackPress: true,
    activeOpacity: 1,
    visible: false,
    statusBarAutoHidden: true
  };

  state = {
    animating: false,
    visible: false
  };

  mounted = true;

  componentWillMount() {
    this.handleHardwareBackPress();
  }

  componentWillReceiveProps() {
    this.handleHardwareBackPress();
  }

  shounldComponentUpdate() {
    return !this.state.animating;
  }

  componentWillUnmount() {
    if (this.statusBarHidden) {
      StatusBar.setHidden(false);
    }
    this.mounted = false;
  }

  handleHardwareBackPress() {
    if (this.state.visible) {
      BackHandler.addEventListener('hardwareBackPress', handleAndroidBackPress);
    } else {
      BackHandler.removeEventListener('hardwareBackPress', handleAndroidBackPress);
    }
  }

  handlePress() {
    let {onPress} = this.props;
    onPress && onPress();
  }

  handleAnimationBegin() {
    this.setState({animating: true});
  }

  handleAnimationEnd() {
    if (!this.mounted) {
      return;
    }
    let {
      visible,
      statusBarAutoHidden
    } = this.props;

    if (visible) {
      if (statusBarAutoHidden) {
        this.statusBarHidden = true;
        StatusBar.setHidden(true);
      }
    } else if (this.statusBarHidden) {
      this.statusBarHidden = false;
      StatusBar.setHidden(false);
    }

    this.setState({
      visible,
      animating: false
    });

  }

  renderLoading({children, loadingProps}) {
    let child;
    if (typeof children === 'string') {
      child = <Text style={styles.text}>{children}</Text>;
    } else if (Array.isArray(children) && typeof children[0] === 'string') {
      child = <Text style={styles.text}>{children}</Text>;
    } else {
      child = children;
    }
    return (
      <View style={styles.content}>
        <ActivityIndicator {...loadingProps}/>
        {child}
      </View>
    );
  }


  render() {

    let {
      children,
      activeOpacity,
      visible,
      style,
      showAnimation,
      hideAnimation,
      loadingDialog,
      loadingProps
    } = this.props;

    if (!visible && !this.state.visible) {
      return <View/>;
    }

    let animation = visible ? showAnimation : hideAnimation;

    let tmp = loadingDialog ? styles.loadingStyle : null;

    return (
      <AnimatableView {...animation}
                      onAnimationBegin={this.handleAnimationBegin}
                      onAnimationEnd={this.handleAnimationEnd}
                      style={[styles.container, tmp, style]}
      >
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={this.handlePress}
          style={styles.container}
        />
        {loadingDialog ? this.renderLoading({
          children,
          loadingProps
        }) : children}
      </AnimatableView>
    );
  }
}

// noinspection Eslint
export default createRootNode(AbstractDialog);
