
function RemoteTree(scope, filter) {
  this.scope = scope
  this.filter = filter
  scope.tree = this

  // Add a child node at the passed index.

  var tree = this
  scope.new_node = function(parent_id, index) {
    var node_id = '' + Math.round(Math.random() * Math.pow(10, 10))
    var new_node = {
      node_id:node_id, child_ids:[], parent_id:parent_id || null, node_intervals:{},
      date_created:Date.now()}
    scope.nodes[node_id] = new_node
    tree.save_node(new_node)
    tree.add_id_to_parent(node_id, parent_id, index)
    tree.set_current_node(new_node)
  }
}

RemoteTree.prototype.init = function() {
  this.write_test_data()
}

RemoteTree.prototype.add_id_to_parent = function(node_id, parent_id, index) {

  // Add a child id to parent node's child_id list or to top level ids.

  var scope = this.scope,
      ids_list = parent_id ? scope.nodes[parent_id].child_ids : scope.top_ids
  if(index === undefined)
    ids_list.push(node_id)
  else
    ids_list.splice(index, 0, node_id)
  this.save_id_list(parent_id, ids_list)
}

RemoteTree.prototype.save_node = function(node) {}
RemoteTree.prototype.save_id_list = function(parent_id, ids_list) {}
RemoteTree.prototype.set_current_node = function(node) {}

RemoteTree.prototype.write_test_data = function() {
  var scope = this.scope
  scope.nodes = {
    "5005108148" : {
      "child_ids" : [ "9072973696" ],
      "node_id" : "5005108148"
    },
    "9072973696" : {
      "child_ids" : [],
      "node_id" : "9072973696",
      "parent_id" : "5005108148",
    }
  }
  scope.top_ids = [ "5005108148" ]
}

var module = angular.module('treeApp', ['ui.bootstrap'])

module.controller('TreeController', ['$scope', '$filter',
  function($scope, $filter) {
    var tree = new RemoteTree($scope, $filter)
    tree.init()
  }])




