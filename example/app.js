var cx = require('classnames');
var React = require('react');
var ReactDOM = require('react-dom');
var Tree = require('../lib/react-ui-tree.js');
var tree = require('./tree.js');

require('../lib/react-ui-tree.less');
require('./theme.less');
require('./app.less');

var App = React.createClass({
  getInitialState() {
    return {
      active: null,
      tree: tree
    };
  },

  canDropItem(node, parentNode) {
    if (!parentNode) return false
    if (parentNode.type == "folder" && node.type == "dashboard") return true
    if (parentNode.type == "folder" && node.type == "folder") return true
    if (parentNode.type == "dashboard" && node.type == "report") return true
    if (parentNode.type == "root" && node.type == "folder") return true
    if (parentNode.type == "root" && node.type == "dashboard") return true
    return false
  },

  renderNode(node, dragging) {
    return (
      <span 
        className={cx('node', {
        'is-active': node === this.state.active
        })} 
        onClick={this.onClickNode.bind(null, node)}
        draggable={false}

      >
        {!dragging ? <a href="/">{node.module}</a> : <span>{node.module}</span>}
        <small>{node.type}</small>
        {!dragging ? <button style={{"float":"right"}}> button </button> : null}
        
      </span>
    );
  },

  onClickNode(node) {
    this.setState({
      active: node
    });
  },

  render() {
    return (
      <div className="app">
        <div className="tree">
          <div className="spacer">
            <input type="text" placeholder="🔍 search" />
          </div>
          <Tree
            paddingLeft={20}
            startIndentationAt={1}
            tree={this.state.tree}
            onChange={this.handleChange}
            locked = {true}
            isNodeCollapsed={this.isNodeCollapsed}
            onToggleCollapse={this.handleCollapse}
            renderNode={this.renderNode}
            canDropInPosition={this.canDropItem}
          />
        </div>
        <div className="inspector">
          <button onClick={this.updateTree}>update tree</button>
          <pre>
          {JSON.stringify(this.state.tree, null, '  ')}
          </pre>
         </div>
      </div>
    );
  },

  handleChange(tree, node, parent, prev, next) {
    console.log("tree changed");
    console.log(tree, node, parent, prev, next)
    this.setState({
      tree: tree
    });
  },

  handleCollapse(nodeId, node) {
    console.log("collapsed!")
    console.log(nodeId, node)
  },

  updateTree() {
    var tree = this.state.tree;
    tree.children.push({module: 'test'});
    this.setState({
      tree: tree
    });
  }
});

ReactDOM.render(<App/>, document.getElementById('app'));
