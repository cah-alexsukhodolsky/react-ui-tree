import cx  from 'classnames';
import React from 'react'
import keydown from 'react-keydown';

class Node extends React.Component {

  constructor(props) {
    super(props)
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
  }

  renderCollapse() {
    var index = this.props.index;

    if(index.children && index.children.length) {
      var collapsed = index.node.collapsed;

      return (
        <span
          className={cx('collapse', collapsed ? 'caret-right' : 'caret-down')}
          onMouseDown={function(e) {e.stopPropagation()}}
          onClick={this.handleCollapse}>
        </span>
      );
    }

    return null;
  }

  renderChildren() {
    var index = this.props.index;
    var tree = this.props.tree;
    var dragging = this.props.dragging;
    if(index.children && index.children.length) {
      var childrenStyles = {};
      if(index.node.collapsed) childrenStyles.display = 'none';
      
      childrenStyles['paddingLeft'] = this.props.index.left > this.props.startIndentationAt ? this.props.paddingLeft + 'px' : "0";
      
      return (
        <div className="children" style={childrenStyles}>
          {index.children.map((child) => {
            var childIndex = tree.getIndex(child);
            return (
              <Node
                tree={tree}
                index={childIndex}
                key={childIndex.id}
                dragging={dragging}
                dragParent={this.props.dragParent}
                paddingLeft={this.props.paddingLeft}
                startIndentationAt={this.props.startIndentationAt}
                canDropInPosition={this.props.canDropInPosition}
                onCollapse={this.props.onCollapse}
                onDragStart={this.props.onDragStart}
              />
            );
          })}
        </div>
      );
    }

    return null;
  }

  render() {
    var tree = this.props.tree;
    var index = this.props.index;
    var dragging = this.props.dragging;
    var node = index.node;
    var styles = {
      
    };

    if (this.props.dragParent == index.id) console.log(this.props)

    return (
      <div className={cx('m-node', {
        'placeholder': index.id === dragging,
        'drop-not-allowed': index.id === dragging && this.props.canDropInPosition !== true,
        'current-drag-parent': this.props.dragParent == index.id && this.props.canDropInPosition
      })} style={styles} draggable={false}>
        <div className="inner" ref="inner" onMouseDown={this.handleMouseDown} >
          {this.renderCollapse()}
          {tree.renderNode(node, dragging)}
        </div>
        {this.renderChildren()}
      </div>
    );
  }

  handleCollapse(e) {
    e.stopPropagation();
    var nodeId = this.props.index.id;
    var node = this.props.index.node;
    if(this.props.onCollapse) {
      this.props.onCollapse(nodeId, node);
    }
  }

  handleMouseDown(e) {
    var nodeId = this.props.index.id;
    var dom = this.refs.inner;

    if(this.props.index.node.draggable !== false && this.props.onDragStart) {
      this.props.onDragStart(nodeId, dom, e);
    }
  }

};

module.exports = Node;
