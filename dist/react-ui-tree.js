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

    _this.drag = _this.drag.bind(_this);
    _this.dragEnd = _this.dragEnd.bind(_this);

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
          h: null

        }
      };
    }
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
            index: draggingIndex,
            paddingLeft: this.props.paddingLeft
          })
        );
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var tree = this.state.tree;
      var dragging = this.state.dragging;
      var draggingDom = this.getDraggingDom();

      return _react2.default.createElement(
        'div',
        { className: 'm-tree' },
        draggingDom,
        _react2.default.createElement(_node2.default, {
          tree: tree,
          index: tree.getIndex(1),
          key: 1,
          paddingLeft: this.props.paddingLeft,
          onDragStart: this.dragStart,
          onCollapse: this.toggleCollapse,
          dragging: dragging && dragging.id
        })
      );
    }
  }, {
    key: 'dragStart',
    value: function dragStart(id, dom, e) {
      this.dragging = {
        id: id,
        w: dom.offsetWidth,
        h: dom.offsetHeight,
        x: dom.offsetLeft,
        y: dom.offsetTop
      };

      this._startX = dom.offsetLeft;
      this._startY = dom.offsetTop;
      this._offsetX = e.clientX;
      this._offsetY = e.clientY;
      this._start = true;

      window.addEventListener('mousemove', this.drag);
      window.addEventListener('mouseup', this.dragEnd);
    }

    // oh

  }, {
    key: 'drag',
    value: function drag(e) {
      if (this._start) {
        this.setState({
          dragging: this.dragging
        });
        this._start = false;
      }

      var tree = this.state.tree;
      var dragging = this.state.dragging;
      var paddingLeft = this.props.paddingLeft;
      var newIndex = null;
      var index = tree.getIndex(dragging.id);
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
        var above = tree.getNodeByTop(index.top - 1);
        newIndex = tree.move(index.id, above.id, 'before');
      } else if (diffY > dragging.h) {
        // down
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
      }

      if (newIndex) {
        newIndex.node.collapsed = collapsed;
        dragging.id = newIndex.id;
      }

      this.setState({
        tree: tree,
        dragging: dragging
      });
    }
  }, {
    key: 'dragEnd',
    value: function dragEnd() {
      this.setState({
        dragging: {
          id: null,
          x: null,
          y: null,
          w: null,
          h: null
        }
      });

      this.change(this.state.tree);
      window.removeEventListener('mousemove', this.drag);
      window.removeEventListener('mouseup', this.dragEnd);
    }
  }, {
    key: 'change',
    value: function change(tree) {
      this._updated = true;
      if (this.props.onChange) this.props.onChange(tree.obj);
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

      this.change(tree);
    }
  }]);

  return FullTree;
}(_react2.default.Component);

FullTree.propTypes = {
  tree: _react2.default.PropTypes.object.isRequired,
  paddingLeft: _react2.default.PropTypes.number,
  renderNode: _react2.default.PropTypes.func.isRequired
};

FullTree.defaultProps = {
  paddingLeft: 20
};

module.exports = FullTree;