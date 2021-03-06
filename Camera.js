import React from 'react';
import PropTypes from 'prop-types';
import Component from './AbstractComponent';
import { NativeEventEmitter, NativeModules, Platform, requireNativeComponent, UIManager, ViewPropTypes } from 'react-native';

type OrientationType = {
  auto: Number,
  landscapeLeft: Number,
  landscapeRight: Number,
  portrait: Number,
  portraitUpsideDown: Number
};

type QualityType = {
  high: String,
  medium: String,
  low: String,
  vga: String,
  hd720: String,
  hd1080: String,
  photo: String
};

let CameraManager = NativeModules.SitbCameraView || NativeModules.SitbCamera2Module;
let RCTCamera;
if (UIManager.SitbCameraView) {
  RCTCamera = requireNativeComponent('SitbCameraView', Camera);
} else if (UIManager.SitbCamera2Module) {
  RCTCamera = requireNativeComponent('SitbCamera2View', Camera);
}
let constants = (UIManager.SitbCameraView || UIManager.SitbCamera2View).Constants;

let CameraFacing = constants.CameraFacing;
let Orientation: OrientationType = constants.Orientation;
let Quality: QualityType = constants.Quality;

let event = new NativeEventEmitter(CameraManager);

/**
 * 安卓相机版本
 * 4 使用
 * 5 安卓5.0相机
 * 设置安卓相机版本
 * @param cameraVersion 版本
 */
export function setCameraVersion(cameraVersion) {
  if (cameraVersion === 4) {
    CameraManager = NativeModules.SitbCameraView;
    constants = UIManager.SitbCameraView.Constants;
    RCTCamera = requireNativeComponent('SitbCameraView', Camera);
  } else if (cameraVersion === 5) {
    CameraManager = NativeModules.SitbCamera2View;
    constants = UIManager.SitbCamera2View.Constants;
    RCTCamera = requireNativeComponent('SitbCamera2View', Camera);
  }
  CameraFacing = constants.CameraFacin;
  Orientation = constants.Orientation;
  Quality = constants.Quality;
  event = new NativeEventEmitter(CameraManager);
}

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 16/6/22
 */
class Camera extends Component {

  static propTypes = {
    ...ViewPropTypes,
    /**
     * 前置相机还是后置相机
     * CameraFacing.back
     * CameraFacing.front
     */
    cameraFacing: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /**
     * Android 需要，该值不需要传递，如果传递了onCaptureOutputBuffer则该值为true
     */
    needCaptureOutputBuffer: PropTypes.bool,

    /**
     * 相机方向
     * Orientation.auto
     * Orientation.landscapeLeft
     * Orientation.landscapeRight
     * Orientation.portrait
     * Orientation.portraitUpsideDown
     */
    orientation: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * 质量设置
     */
    quality: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * 一个回调函数
     * 当需要实时获取预览的图片数据
     */
    onCaptureOutputBuffer: PropTypes.func
  };

  static defaultProps = {
    cameraFacing: CameraFacing.back,
    orientation: Orientation.auto,
    quality: Quality.high
  };

  componentDidMount() {
    if (Platform.OS === 'android') {
      event.addListener('captureOutputBuffer', this.handleCaptureOutputBuffer);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      event.removeListener('captureOutputBuffer', this.handleCaptureOutputBuffer);
    }
  }

  capture(option) {
    // return capture(option);
  }


  handleCaptureOutputBuffer(event) {
    this.props.onCaptureOutputBuffer && this.props.onCaptureOutputBuffer(event.nativeEvent.buffer);
  }

  render() {
    const {onCaptureOutputBuffer, ...other} = this.props;
    return (
      <RCTCamera {...other}
                 needCaptureOutputBuffer={!!onCaptureOutputBuffer}
                 onCaptureOutputBuffer={onCaptureOutputBuffer ? this.handleCaptureOutputBuffer : null}
      />
    );
  }

}

if (Platform.OS === 'ios') {
  /**
   * 检查是否有相机权限
   * ios only
   */
  Camera.checkVideoAuthorizationStatus = CameraManager.checkVideoAuthorizationStatus;

  /**
   * 检查是否有麦克风权限
   * ios only
   */
  Camera.checkAudioAuthorizationStatus = CameraManager.checkAudioAuthorizationStatus;
}

export {
  Camera as default,
  Orientation,
  CameraFacing,
  Quality
};
