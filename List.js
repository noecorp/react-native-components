import React, { cloneElement, PropTypes } from 'react';
import { Image, ListView, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import AbstractComponent from './AbstractComponent';
import right from './images/right.png';

const padding = 15;

// noinspection JSSuspiciousNameCombination
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  rowContainer: {
    backgroundColor: '#b3b3b3'
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    height: 45,
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: padding
  },
  header: {
    marginRight: padding
  },
  body: {
    flex: 1
  },
  bodyTextStyle: {
    color: '#1a1a1a',
    fontSize: 14
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerTextStyle: {
    color: '#b3b3b3'
  },
  separator: {
    height: StyleSheet.hairlineWidth
  },
  right: {
    width: 18,
    height: 18,
    resizeMode: Image.resizeMode.contain
  }
});


export const Row = {
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  footer: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  displayRightArrow: PropTypes.bool
};

/**
 * @author 田尘殇Sean(sean.snow@live.com)
 * @date 16/5/25
 */
class List extends AbstractComponent {

  static propTypes = {
    bodyTextStyle: Text.propTypes.style,
    cellStyle: View.propTypes.style,
    footerTextStyle: Text.propTypes.style,
    items: PropTypes.array,
    separatorColor: PropTypes.string,
    onItemPress: PropTypes.func
  };

  static defaultProps = {
    alwaysBounceVertical: false,
    rowHasChanged: (r1, r2) => r1 !== r2,
    separatorColor: '#bbbbbb'
  };

  state = {};

  constructor(props) {
    super(props);
    const {items, rowHasChanged} = props;
    const ds = new ListView.DataSource({rowHasChanged});
    this.state = {
      dataSource: ds.cloneWithRows(items)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.items !== nextProps.items) {
      this.setState({dataSource: this.state.dataSource.cloneWithRows(nextProps.items)});
    }
  }

  renderHeader(header) {
    return header && cloneElement(header, {
        style: styles.header
      });
  }

  renderBody(body) {
    const {bodyTextStyle} = this.props;
    if (!body || typeof body === 'string') {
      return (
        <Text style={[styles.body, styles.bodyTextStyle, bodyTextStyle]}>{body || ''}</Text>
      );
    }
    return cloneElement(body, {
      style: styles.body
    });
  }

  renderFooter(footer, displayRightArrow = true) {
    const {footerTextStyle} = this.props;
    return (
      <View style={styles.footer}>
        {typeof footer === 'string' ? (
          <Text style={[styles.footerTextStyle, footerTextStyle]}>{footer}</Text>
        ) : footer}
        {displayRightArrow && (
          <Image source={right}
                 style={styles.right}
          />
        )}
      </View>
    );
  }

  renderRow(row: Row, sectionID, rowID) {
    const {header, body, footer, displayRightArrow} = row;
    const {onItemPress, cellStyle} = this.props;
    return (
      <TouchableHighlight key={rowID}
                          onPress={() => onItemPress && onItemPress(row, sectionID, rowID)}
                          style={styles.rowContainer}
      >
        <View style={[styles.row, cellStyle]}>
          {this.renderHeader(header)}
          {this.renderBody(body)}
          {this.renderFooter(footer, displayRightArrow)}
        </View>
      </TouchableHighlight>
    );
  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    const {separatorColor, items} = this.props;
    if (rowID === `${items.length - 1}`) {
      return null;
    }
    const style = {
      backgroundColor: adjacentRowHighlighted ? '#FFF' : separatorColor
    };
    return (
      <View key={`${sectionID}-${rowID}`}
            style={{backgroundColor: '#FFF'}}
      >
        <View style={[{marginLeft: padding}, styles.separator, style]}/>
      </View>
    );
  }

  render() {
    const {style, separatorColor, ...other} = this.props;
    return (
      <View style={[styles.container, {borderColor: separatorColor}, style]}>
        <ListView {...other}
                  dataSource={this.state.dataSource}
                  renderRow={this.renderRow}
                  renderSeparator={this.renderSeparator}
        />
      </View>
    );
  }

}

export default List;
