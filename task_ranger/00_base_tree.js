
function BaseTree(scope, filter) {
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
  scope.nodes = {
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
  }
  scope.top_ids = [ "5005108148" ]
  this.after_write_test_data()
}

BaseTree.prototype.after_write_test_data = function() {}

var module = angular.module('treeApp', [])

module.controller('TreeController', ['$scope', '$filter',
  function($scope, $filter) {
    new BaseTree($scope, $filter)
  }])
