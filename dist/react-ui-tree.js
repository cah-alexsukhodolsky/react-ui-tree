'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _reactKeydown = require('react-keydown');

var _reactKeydown2 = _interopRequireDefault(_reactKeydown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tree = require('./tree');

var FullTree = function (_React$Component) {
  _inherits(FullTree, _React$Component);

  function FullTree(props) {
    _classCallCheck(this, FullTree);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FullTree).call(this, props));

    _this.state = _this.init(props);

    _this.toggleCollapse = _this.toggleCollapse.bind(_this);
    _this.dragStart = _this.dragStart.bind(_this);

    _this.drag = _this.drag.bind(_this); // we have to bind this twice, both before AND after the debounce
    _this.drag = debounce(_this.drag, 10);
    _this.drag = _this.drag.bind(_this);

    _this.dragEnd = _this.dragEnd.bind(_this);
    _this.canDropInPosition = _this.canDropInPosition.bind(_this);
    return _this;
  }

  _createClass(FullTree, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this._updated) this.setState(this.init(nextProps));else this._updated = false;
    }
  }, {
    key: 'init',
    value: function init(props) {

      var treeObj = Object.assign({}, props.tree);

      if (props.searchTerm && props.searchKey) {
        treeObj = this.recursiveFilter(treeObj, props.searchTerm, props.searchKey);
      }

      var tree = new Tree(treeObj);

      // console.log(tree);

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
          h: null
        }
      };
    }
  }, {
    key: 'recursiveFilter',
    value: function recursiveFilter(obj, searchTerm, searchKey) {
      function filterChildren(node) {
        var newNode = Object.assign({}, node);
        var expanded = false;
        if (!newNode[searchKey]) return false;
        if (newNode.children) {

          newNode.children = newNode.children.map(function (child) {
            return filterChildren(child);
          }).filter(function (child) {
            return child != false;
          });
        }

        if (newNode.children && newNode.children.length > 0) {
          // console.log('new node has children', newNode)
          expanded = true;
        }
        if (!newNode[searchKey] || newNode[searchKey].toLowerCase().indexOf(searchTerm.toLowerCase()) != -1) {
          // console.log("search term matched: ", newNode[searchKey])
          expanded = true;
        }

        // if (newNode.module == "app.js") {
        //   console.log("app,js");
        //   console.log(expanded)
        //   console.log(newNode);
        // }

        if (expanded == true) {
          newNode.collapsed = false;
          // console.log('newNode allowed', newNode[searchKey]);
          return newNode;
        } else {
          return false;
        }
      }

      if (!obj.children) return obj;
      if (!searchTerm || searchTerm == "") return obj;
      if (!searchKey || searchKey == "") return obj;
      obj = filterChildren(obj);
      return obj;
    }

    //////////////
    //
    //  Drag & Drop permissions.
    //
    //  If a callback is supplied then use that to evaluate whether or not the node can be attached to the current parent.
    //  If none is supplied, anything is allowed
    //

  }, {
    key: 'canDropInPosition',
    value: function canDropInPosition(node, parentNode) {
      if (!this.props.canDropInPosition) return true;
      return this.props.canDropInPosition(node, parentNode);
    }

    //////////////
    //
    // DOM for the hovering copy of the node being dragged
    //

  }, {
    key: 'getDraggingDom',
    value: function getDraggingDom() {

      var tree = this.state.tree;
      var dragging = this.state.dragging;

      if (dragging && dragging.id) {
        var draggingIndex = tree.getIndex(dragging.id);
        var draggingStyles = {
          top: dragging.y,
          left: dragging.x,
          width: dragging.w
        };

        return _react2.default.createElement(
          'div',
          { className: 'm-draggable', style: draggingStyles },
          _react2.default.createElement(_node2.default, {
            tree: tree,
            startIndentationAt: this.props.startIndentationAt,
            index: draggingIndex,
            paddingLeft: this.props.paddingLeft,
            dragging: true

          })
        );
      }

      return null;
    }

    /////////////
    //
    // Render everything
    //
    //

  }, {
    key: 'render',
    value: function render() {
      var tree = this.state.tree;
      var dragging = this.state.dragging;
      var draggingDom = this.getDraggingDom();
      return _react2.default.createElement(
        'div',
        { className: 'm-tree ' + (this.state.currentlyDragging ? "currently-dragging" : "") },
        draggingDom,
        _react2.default.createElement(_node2.default, {
          tree: tree,
          index: tree.getIndex(1),
          key: 1,
          paddingLeft: this.props.paddingLeft,
          startIndentationAt: this.props.startIndentationAt,
          onDragStart: this.dragStart
          // onDragEnd = {this.dragEnd}
          , canDropInPosition: this.state.canDropInPosition,
          onCollapse: this.toggleCollapse,
          dragging: dragging && dragging.id
        })
      );
    }
  }, {
    key: 'dragStart',
    value: function dragStart(id, dom, e) {
      // if the tree is locked, return — no dragging for you
      if (this.props.locked === true) return;
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
  }, {
    key: 'drag',
    value: function drag(e) {
      // if we aren't dragging anything, abort abort!
      if (!this.dragging) return;

      // what if we're starting
      if (this._start) {
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

      var diffX = dragging.x - paddingLeft / 2 - (index.left - 2) * paddingLeft;
      var diffY = dragging.y - dragging.h / 2 - (index.top - 2) * dragging.h;

      if (diffX < 0) {
        // left
        if (index.parent && !index.next) {
          newIndex = tree.move(index.id, index.parent, 'after');
        }
      } else if (diffX > paddingLeft) {
        // right
        if (index.prev) {
          var prevNode = tree.getIndex(index.prev).node;
          if (!prevNode.collapsed && !prevNode.leaf) {
            newIndex = tree.move(index.id, index.prev, 'append');
          }
        }
      }

      if (newIndex) {
        index = newIndex;
        newIndex.node.collapsed = collapsed;
        dragging.id = newIndex.id;
      }

      if (diffY < 0) {
        // up

        while (diffY < 0) {
          var i = index.top - 1;
          var above = tree.getNodeByTop(i);
          if (above) {
            newIndex = tree.move(index.id, above.id, 'before');
            if (newIndex) {
              index = newIndex;
              diffY = dragging.y - dragging.h / 2 - (newIndex.top - 2) * dragging.h;
            }
          }
          if (!newIndex) break;
        }
      } else if (diffY > dragging.h) {
        // down

        while (diffY > dragging.h) {
          if (!index) break;
          if (index.next) {
            var below = tree.getIndex(index.next);
            if (below.children && below.children.length && !below.node.collapsed) {
              newIndex = tree.move(index.id, index.next, 'prepend');
            } else {
              newIndex = tree.move(index.id, index.next, 'after');
            }
          } else {
            var below = tree.getNodeByTop(index.top + index.height);
            if (below && below.parent !== index.id) {
              if (below.children && below.children.length) {
                newIndex = tree.move(index.id, below.id, 'prepend');
              } else {
                newIndex = tree.move(index.id, below.id, 'after');
              }
            }
          }

          var prevDiffY = diffY;
          diffY = dragging.y - dragging.h / 2 - (index.top - 1) * dragging.h;
          if (diffY == prevDiffY) break;
          if (newIndex) index = newIndex;
        }
      }

      if (newIndex) {
        newIndex.node.collapsed = collapsed;
        dragging.id = newIndex.id;
      }

      if (!this._newIndex) this._newIndex = newIndex ? true : false;

      this.setState({
        currentDragIndex: index,
        tree: tree,
        dragging: dragging,
        canDropInPosition: this.canDropInPosition(index.node, index.parent ? tree.getIndex(index.parent).node : null)
      });
    }
  }, {
    key: 'dragEnd',
    value: function dragEnd() {

      var tree = this.state.tree;
      var index = tree.getIndex(this.state.dragging.id);

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

        var node = index.node;
        var indexBeforeDrag = this.state.indexBeforeDrag;
        var oldParent = indexBeforeDrag.parent ? tree.getIndex(indexBeforeDrag.parent).node : null;
        var parent = index.parent ? tree.getIndex(index.parent).node : null;
        var prev = index.prev ? tree.getIndex(index.prev).node : null;
        var next = index.next ? tree.getIndex(index.next).node : null;

        // are we allowed to perform this drag/drop
        //
        if (this.canDropInPosition(node, parent)) {

          // node, oldContainer, newContainer, index;
          var i = parent.children.indexOf(node);
          this.change(this.state.tree, node, oldParent, parent, i);
        } else {

          // if nothing moved, we're done!
          if (indexBeforeDrag == index) return;

          // if the old Index had a previous node, use that to inset
          if (indexBeforeDrag.prev) {
            tree.move(index.id, indexBeforeDrag.prev, 'after');

            // or if it has a next, use that
          } else if (indexBeforeDrag.next) {
              tree.move(index.id, indexBeforeDrag.next, 'before');

              // or it must be the sole child of it's parent, so use the parent
            } else {
                tree.move(index.id, indexBeforeDrag.parent, 'append');
              }
          this.setState({
            needsUpdate: Math.random()
          });
        }
      }
    }
  }, {
    key: 'change',
    value: function change(tree, node, oldParent, parent, index) {

      if (this.props.onChange && this._newIndex) {
        this.props.onChange(tree.obj, node, oldParent, parent, index);
      }

      this._newIndex = false;
      this._updated = true;
    }
  }, {
    key: 'toggleCollapse',
    value: function toggleCollapse(nodeId) {
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
  }]);

  return FullTree;
}(_react2.default.Component);

FullTree.propTypes = {
  tree: _react2.default.PropTypes.object.isRequired,
  paddingLeft: _react2.default.PropTypes.number,
  startIndentationAt: _react2.default.PropTypes.number,
  renderNode: _react2.default.PropTypes.func.isRequired
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
  return function () {
    var context = this,
        args = arguments;
    var later = function later() {
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