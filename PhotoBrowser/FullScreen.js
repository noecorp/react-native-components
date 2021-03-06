import React, { PropTypes } from 'react';
import {
  Dimensions,
  StyleSheet,
  DeviceEventEmitter
} from 'react-native';
import Component from '../AbstractComponent';
import GridView from '../GridView';
import Button from '../bootstrap/Button';
import Image from './Image';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  fullImage: {
    borderRadius: 0,
    flex: 1
  },
  image: {
    width,
    height
  }
});

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 16/6/13
 */
class FullScreen extends Component {

  static propTypes = {
    // 跳转到startIndex 时,是否有动画效果
    animation: PropTypes.bool,
    mediaList: PropTypes.array.isRequired,
    startIndex: PropTypes.number
  };

  static defaultProps = {
    animation: false,
    startIndex: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      headerAnimation: 'fadeInDown',
      startIndex: props.startIndex || 0
    };
  }

  state = {};

  componentDidMount() {
    DeviceEventEmitter.addListener('didUpdateDimensions', () => {
      this.photos.forEach(p => p && p.forceUpdate());
      this.openPage(this.state.startIndex, false);
    });
    this.openPage(this.state.startIndex, false);
  }


  // refs
  fullScreen;
  photos = [];

  openPage(index, animated) {
    if (!this.fullScreen) {
      return;
    }

    this.fullScreen.listView.scrollTo({
      x: index * width,
      animated
    });

    this.startLoadImage(index);
  }

  startLoadImage(index) {
    const photo = this.photos[index];
    if (photo) {
      photo.startLoad();
    } else {
      setTimeout(()=>this.startLoadImage(index), 200);
    }
  }

  handleScroll(e) {
    const event = e.nativeEvent;
    const layoutWidth = event.layoutMeasurement.width;
    const newIndex = Math.floor((event.contentOffset.x + 0.5 * layoutWidth) / layoutWidth);
    if (newIndex !== this.state.startIndex) {
      this.startLoadImage(newIndex);
    }
  }


  fullImagePress() {
    const headerAnimation = this.state.headerAnimation === 'fadeInDown' ? 'fadeOutUp' : 'fadeInDown';
    this.setState({
      headerAnimation
    });
  }

  renderFullCell(source, sectionID:Number, rowID:Numbern) {
    return (
      <Button activeOpacity={1}
              onPress={this.fullImagePress}
              style={[styles.fullImage, styles.image]}
      >
        <Image ref={ref => this.photos[rowID] = ref}
               source={source}
               style={{width, height, resizeMode: 'contain'}}
        />
      </Button>
    );
  }

  render() {

    const {mediaList, ...other} = this.props;

    return (
      <GridView {...other}
        bouncesZoom
        cells={mediaList}
        cols={1}
        directionalLockEnabled
        horizontal
        initialListSize={1}
        onScroll={this.handleScroll}
        pageSzie={5}
        pagingEnabled
        ref={fullScreen => this.fullScreen = fullScreen}
        renderCell={this.renderFullCell}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  }

}

export default FullScreen;
