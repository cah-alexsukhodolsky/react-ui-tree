'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactKeydown = require('react-keydown');

var _reactKeydown2 = _interopRequireDefault(_reactKeydown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Node = function (_React$Component) {
  _inherits(Node, _React$Component);

  function Node(props) {
    _classCallCheck(this, Node);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Node).call(this, props));

    _this.handleMouseDown = _this.handleMouseDown.bind(_this);
    _this.handleCollapse = _this.handleCollapse.bind(_this);
    return _this;
  }

  _createClass(Node, [{
    key: 'renderCollapse',
    value: function renderCollapse() {
      var index = this.props.index;

      if (index.children && index.children.length) {
        var collapsed = index.node.collapsed;

        return _react2.default.createElement('span', {
          className: (0, _classnames2.default)('collapse', collapsed ? 'caret-right' : 'caret-down'),
          onMouseDown: function onMouseDown(e) {
            e.stopPropagation();
          },
          onClick: this.handleCollapse });
      }

      return null;
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _this2 = this;

      var index = this.props.index;
      var tree = this.props.tree;
      var dragging = this.props.dragging;

      if (index.children && index.children.length) {
        var childrenStyles = {};
        if (index.node.collapsed) childrenStyles.display = 'none';
        childrenStyles['paddingLeft'] = this.props.paddingLeft + 'px';

        return _react2.default.createElement(
          'div',
          { className: 'children', style: childrenStyles },
          index.children.map(function (child) {
            var childIndex = tree.getIndex(child);
            return _react2.default.createElement(Node, {
              tree: tree,
              index: childIndex,
              key: childIndex.id,
              dragging: dragging,
              paddingLeft: _this2.props.paddingLeft,
              onCollapse: _this2.props.onCollapse,
              onDragStart: _this2.props.onDragStart
            });
          })
        );
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var tree = this.props.tree;
      var index = this.props.index;
      var dragging = this.props.dragging;
      var node = index.node;
      var styles = {};

      return _react2.default.createElement(
        'div',
        { className: (0, _classnames2.default)('m-node', {
            'placeholder': index.id === dragging
          }), style: styles },
        _react2.default.createElement(
          'div',
          { className: 'inner', ref: 'inner', onMouseDown: this.handleMouseDown },
          this.renderCollapse(),
          tree.renderNode(node)
        ),
        this.renderChildren()
      );
    }
  }, {
    key: 'handleCollapse',
    value: function handleCollapse(e) {
      e.stopPropagation();
      var nodeId = this.props.index.id;
      if (this.props.onCollapse) this.props.onCollapse(nodeId);
    }
  }, {
    key: 'handleMouseDown',
    value: function handleMouseDown(e) {
      var nodeId = this.props.index.id;
      var dom = this.refs.inner;

      if (this.props.index.node.draggable !== false && this.props.onDragStart) {
        this.props.onDragStart(nodeId, dom, e);
      }
    }
  }]);

  return Node;
}(_react2.default.Component);

;

module.exports = Node;