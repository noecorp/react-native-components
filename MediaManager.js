import { NativeModules } from 'react-native';

const {
  SitbRCTMediaManager: {
    sourceType,
    mediaType,
    cameraType,
    launchImageLibrary,
    launchCamera
  }
} = NativeModules;


type Options = {
  sourceType: Number,
  mediaType: String,
  allowsEditing: Boolean
};

const DEFAULT_LIBRARY_OPTIONS = {
  sourceType: sourceType.savedPhotosAlbum,
  mediaType: mediaType.Image,
  allowsEditing: false
};

const DEFAULT_CAMERA_OPTIONS = {
  sourceType: sourceType.camera,
  cameraType: cameraType.back
};

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 16/6/29
 */
class MediaBrowser {

  static launchImageLibrary(options:Options = DEFAULT_LIBRARY_OPTIONS) {
    return launchImageLibrary(options);
  }

  static launchCamera(options = DEFAULT_CAMERA_OPTIONS) {
    return launchCamera(options);
  }

}


export {
  MediaBrowser as default,
  sourceType,
  mediaType
};
