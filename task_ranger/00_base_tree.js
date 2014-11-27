
function BaseTree(scope, filter) {

  // Bind node creation buttons.

  this.scope = scope
  this.filter = filter
  scope.tree = this

  var tree = this
  scope.add_under = function(node) {
    var scope = tree.scope
    var top_ids = node.parent_id ? scope.nodes[node.parent_id].child_ids : scope.top_ids
    scope.new_node(node.parent_id, top_ids.indexOf(node.node_id) + 1)
  }
  scope.new_node = function(parent_id, index) {
    console.log('new_node stub:', parent_id, index)
  }

  this.after_construction()
  this.ready_to_download()
}

BaseTree.prototype.after_construction = function() {}

BaseTree.prototype.ready_to_download = function() {
  this.write_test_data()
}

BaseTree.prototype.write_test_data = function() {
  var scope = this.scope
  var test_json = this.get_test_json()
  scope.nodes = test_json.nodes
  scope.top_ids = test_json.top_ids
}

BaseTree.prototype.get_test_json = function() {
  return this.decorate_test_json({
    'nodes':{
      "5005108148" : {
        "child_ids" : [ "9072973696" ],
        "node_id" : "5005108148",
        "text": "node 5005108148"
      },
      "9072973696" : {
        "child_ids" : [],
        "node_id" : "9072973696",
        "parent_id" : "5005108148",
        "text": "node 9072973696"
      }
    },
    'top_ids': [ "5005108148" ]
  })
}

BaseTree.prototype.decorate_test_json = function(json) {
  return json
}

var module = angular.module('treeApp', ['ui.bootstrap'])

module.controller('TreeController', ['$scope', '$filter',
  function($scope, $filter) {
    new BaseTree($scope, $filter)
  }])
