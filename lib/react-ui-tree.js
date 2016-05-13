var Tree = require('./tree');

import React from 'react'
import Node from './node'
import keydown from 'react-keydown';

class FullTree extends React.Component {

  constructor(props) {

    super(props)
    this.state = this.init(props)

    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.dragStart = this.dragStart.bind(this);
    
    this.drag = this.drag.bind(this); // we have to bind this twice, both before AND after the debounce
    this.drag = debounce(this.drag, 10);
    this.drag = this.drag.bind(this);

    this.dragEnd = this.dragEnd.bind(this);
    this.canDropInPosition = this.canDropInPosition.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(!this._updated) this.setState(this.init(nextProps));
    else this._updated = false;
  }

  init(props) {
    
    var tree = new Tree(props.tree);
    tree.isNodeCollapsed = props.isNodeCollapsed;
    tree.renderNode = props.renderNode;
    tree.changeNodeCollapsed = props.changeNodeCollapsed;
    tree.updateNodesPosition();

    return {
      tree: tree,
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null,
      }
    };
  }

  //////////////
  //
  //  Drag & Drop permissions. 
  //
  //  If a callback is supplied then use that to evaluate whether or not the node can be attached to the current parent. 
  //  If none is supplied, anything is allowed
  //
  canDropInPosition(node, parentNode) {
    if (!this.props.canDropInPosition) return true;
    return this.props.canDropInPosition(node, parentNode);
  }

  //////////////
  //
  // DOM for the hovering copy of the node being dragged
  //
  getDraggingDom() {

    var tree = this.state.tree;
    var dragging = this.state.dragging;

    if(dragging && dragging.id) {
      var draggingIndex = tree.getIndex(dragging.id);
      var draggingStyles = {
        top: dragging.y,
        left: dragging.x,
        width: dragging.w
      };

      return (
        <div className="m-draggable" style={draggingStyles}>
          <Node
            tree={tree}
            startIndentationAt={this.props.startIndentationAt}
            index={draggingIndex}
            paddingLeft={this.props.paddingLeft}
            dragging={true}

          />
        </div>
      );
    }

    return null;
  }

  /////////////
  //
  // Render everything
  //
  //
  render() {
    var tree = this.state.tree;
    var dragging = this.state.dragging;
    var draggingDom = this.getDraggingDom();
    return (
      <div className={`m-tree ${this.state.currentlyDragging ? "currently-dragging" : ""}`}>
        {draggingDom}
        <Node
          tree={tree}
          index={tree.getIndex(1)}
          key={1}
          paddingLeft={this.props.paddingLeft}
          startIndentationAt={this.props.startIndentationAt}
          onDragStart={this.dragStart}
          // onDragEnd = {this.dragEnd}
          canDropInPosition={this.state.canDropInPosition}
          onCollapse={this.toggleCollapse}
          dragging={dragging && dragging.id}
        />
      </div>
    );
  }

  dragStart(id, dom, e) {
    // set a state object with the current nodex index, 
    // so that if we perform an illegal move, we can rever.
    //
    this.setState({
      indexBeforeDrag: this.state.tree.getIndex(id)
    });
    

    // wat are we dragging
    this.dragging = {
      id: id,
      w: dom.offsetWidth,
      h: dom.offsetHeight,
      x: dom.offsetLeft,
      y: dom.offsetTop
    };

    // where are we dragging it
    this._startX = dom.offsetLeft;
    this._startY = dom.offsetTop;
    this._offsetX = e.clientX;
    this._offsetY = e.clientY;
    this._start = true;

    // listen for mouse events 
    // TODO: disable native HTML drag/drop, which sometimes intercepts these mouse events and causes weird behaviour. 
    window.addEventListener('mousemove', this.drag);
    window.addEventListener('mouseup', this.dragEnd);
  }

  drag (e) {
    // if we aren't dragging anything, abort abort!
    if (!this.dragging) return;

    // what if we're starting
    if(this._start) {
      this.setState({
        dragging: this.dragging,
        currentlyDragging: true
      });
      this._start = false;

    }

    var tree = this.state.tree;
    var dragging = this.state.dragging;
    
    var paddingLeft = this.props.paddingLeft;
    var newIndex = null;
    var index = tree.getIndex(dragging.id);
    if (!index) return;
    var collapsed = index.node.collapsed;

    var _startX = this._startX;
    var _startY = this._startY;
    var _offsetX = this._offsetX;
    var _offsetY = this._offsetY;

    var pos = {
      x: _startX + e.clientX - _offsetX,
      y: _startY + e.clientY - _offsetY
    };

    dragging.x = pos.x;
    dragging.y = pos.y;

    var diffX = dragging.x - paddingLeft/2 - (index.left-2) * paddingLeft;
    var diffY = dragging.y - dragging.h/2 - (index.top-2) * dragging.h;

    if(diffX < 0) { // left
      if(index.parent && !index.next) {
        newIndex = tree.move(index.id, index.parent, 'after');
      }
    } else if(diffX > paddingLeft) { // right
      if(index.prev) {
        var prevNode = tree.getIndex(index.prev).node;
        if(!prevNode.collapsed && !prevNode.leaf) {
          newIndex = tree.move(index.id, index.prev, 'append');
        }
      }
    }

    if(newIndex) {
      index = newIndex;
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }

    if(diffY < 0) { // up

      while (diffY < 0) {
        let i = index.top - 1
        var above = tree.getNodeByTop(i);
        if (above) {
          newIndex = tree.move(index.id, above.id, 'before');
          if (newIndex) {
            index = newIndex
            diffY = dragging.y - dragging.h/2 - (newIndex.top-2) * dragging.h;
          }
        }
        if (!newIndex) break;
      }

    } else if(diffY > dragging.h) { // down
      
      while (diffY > dragging.h) {
        if (!index) break;
        if(index.next) {
          var below = tree.getIndex(index.next);
          if(below.children && below.children.length && !below.node.collapsed) {
            newIndex = tree.move(index.id, index.next, 'prepend');
          } else {
            newIndex = tree.move(index.id, index.next, 'after');
          }
        } else {
          var below = tree.getNodeByTop(index.top+index.height);
          if (below && below.parent !== index.id) {
            if(below.children && below.children.length) {
              newIndex = tree.move(index.id, below.id, 'prepend');
            } else {
              newIndex = tree.move(index.id, below.id, 'after');
            }
          }
        }
        
        let prevDiffY = diffY;
        diffY = dragging.y - dragging.h/2 - (index.top-1) * dragging.h;
        if (diffY == prevDiffY) break;
        if (newIndex) index = newIndex;
        
      }
    }

    if(newIndex) {
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }



    if(!this._newIndex)
      this._newIndex = newIndex ? true : false;

    this.setState({
      currentDragIndex: index,
      tree: tree,
      dragging: dragging,
      canDropInPosition: this.canDropInPosition(index.node, index.parent ? tree.getIndex(index.parent).node : null)
    });
    
  }


  dragEnd() {

    let tree = this.state.tree;
    let index = tree.getIndex(this.state.dragging.id);

    this.setState({
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      },
      currentlyDragging: false
    });

    window.removeEventListener('mousemove', this.drag);
    window.removeEventListener('mouseup', this.dragEnd);

    if (index) {

      let node = index.node;

      let parent = index.parent ? tree.getIndex(index.parent).node : null 
      let prev = index.prev ? tree.getIndex(index.prev).node : null
      let next = index.next ? tree.getIndex(index.next).node : null

      // are we allowed to perform this drag/drop
      //
      if (this.canDropInPosition(node, parent)) {
        this.change(this.state.tree, node, parent, prev, next);
      } else {
        let indexBeforeDrag = this.state.indexBeforeDrag;
        // if nothing moved, we're done!
        if (indexBeforeDrag == index)  return;

        // if the old Index had a previous node, use that to inset
        if (indexBeforeDrag.prev) {
          tree.move(index.id, indexBeforeDrag.prev, 'after')
          
          // or if it has a next, use that
        } else if (indexBeforeDrag.next) {
          tree.move(index.id, indexBeforeDrag.next, 'before')
          
          // or it must be the sole child of it's parent, so use the parent
        } else {
          tree.move(index.id, indexBeforeDrag.parent, 'append')

        }
        this.setState({
          needsUpdate: Math.random()
        }) 
      }
    }
  }

  change(tree, node, parent, prev, next) {

    if(this.props.onChange && this._newIndex){
      this.props.onChange(tree.obj, node, parent, prev, next);
    }
    
    this._newIndex = false;
    this._updated = true;
  }

  toggleCollapse(nodeId) {
    var tree = this.state.tree;
    var index = tree.getIndex(nodeId);
    var node = index.node;
    node.collapsed = !node.collapsed;
    tree.updateNodesPosition();

    this.setState({
      tree: tree
    });

    this.change(tree, index.node);
    if (this.props.onToggleCollapse) {
      this.props.onToggleCollapse(tree.obj, index.node);
    }
  }
}

FullTree.propTypes = {
  tree: React.PropTypes.object.isRequired,
  paddingLeft: React.PropTypes.number,
  startIndentationAt: React.PropTypes.number,
  renderNode: React.PropTypes.func.isRequired
};

FullTree.defaultProps = {
  paddingLeft: 20,
  startIndentationAt: 0
};

/* 
  David Walsh's debounce function
  https://davidwalsh.name/javascript-debounce-function
  based on the underscore debounce function
*/


function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

module.exports = FullTree;
