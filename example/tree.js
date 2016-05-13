module.exports = {
  module: 'react-ui-tree',
  type: 'root',
  children: [{
    module: 'dist',
    collapsed: true,
    type: 'folder',
    children: [{
      module: 'node.js',
      type: 'dashboard'
    }, {
      module: 'react-ui-tree.css',
      type: 'dashboard'
    }, {
      module: 'react-ui-tree.js',
      type: 'dashboard',
      children: [{
        module: 'tree.js',
        leaf: true,
        type: 'report',
      }]
    }]
  }, {
    type: 'folder',
    module: 'example',
    children: [{
      module: 'app.js',
      type: 'dashboard',
      children: [
        {module: 'app.less',
        type: 'report',
        leaf: true},
        {module: 'new module',
        type: 'report',
        leaf: true}
      ]
    }, 
    {
      module: 'index.html',
      type: "folder"
    }]
  }, {
    module: 'lib',
    type: 'dashboard',
    children: [{
      module: 'node.js',
      type: 'report',
      leaf: true
    }, {
      module: 'react-ui-tree.js',
      type: 'report',
      leaf: true
    }, {
      module: 'react-ui-tree.less',
      type: 'report',
      leaf: true
    }, {
      module: 'tree.js',
      type: 'report',
      leaf: true
    }]
  }, {
    module: '.gitiignore',
    leaf: true,
    type: 'report'
  }, {
    module: 'index.js',
    leaf: true,
    type: 'report'
  }, {
    module: 'LICENSE',
    leaf: true,
    type: 'report'
  }, {
    module: 'Makefile',
    leaf: true,
    type: 'report'
  }, {
    module: 'package.json',
    leaf: true,
    type: 'report'
  }, {
    module: 'README.md',
    leaf: true,
    type: 'report'
  }, {
    module: 'webpack.config.js',
    leaf: true,
    type: 'report'
  }]
}
