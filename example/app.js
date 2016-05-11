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
          <Tree
            paddingLeft={20}
            tree={this.state.tree}
            onChange={this.handleChange}
            isNodeCollapsed={this.isNodeCollapsed}
            onToggleCollapse={this.handleCollapse}
            renderNode={this.renderNode}
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
