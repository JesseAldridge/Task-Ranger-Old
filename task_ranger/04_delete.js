
// Delete button.  Undelete button.

RemoteTree.prototype.after_bind_intervals = function() {
  var tree = this
  this.scope.delete_node = function(node) {
    delete scope.nodes[node.node_id]
    tree.root_ref.child('nodes/' + node.node_id).remove()
  }

  // Store deleted nodes.

  this.deleted_batches = []
  this.scope.delete_node = function(node) {
    var deleted_nodes = [],
        deleted_root = tree.scope.nodes[node.node_id]
    deleted_nodes.push(deleted_root)
    tree.walk_tree(deleted_root.child_ids, function(desc_node) {
      deleted_nodes.push(desc_node)
    })
    for(var i = 0; i < deleted_nodes.length; i++) {
      var deleted_id = deleted_nodes[i].node_id
      delete scope.nodes[deleted_id]
      tree.root_ref.child('nodes/' + deleted_id).remove()
    }
    tree.deleted_batches.push(deleted_nodes)
    tree.remove_id_from_parent(deleted_root)
    tree.after_delete(deleted_root)
  }

  // Add the last deleted batch of nodes back to the tree.

  this.scope.undelete = function() {
    var nodes = tree.deleted_batches.pop()
    if(!nodes)
      return
    var root_node = nodes[0],
        parent_id = root_node.parent_id,
        parent_node = tree.scope.nodes[parent_id]
    tree.add_id_to_parent(root_node.node_id, parent_id, root_node.former_index)
    for(var i = 0; i < nodes.length; i++)
      tree.restore_node(nodes[i])
    tree.after_undelete(root_node)
  }

  this.after_bind_delete()
}

RemoteTree.prototype.after_delete = function(){}
RemoteTree.prototype.after_undelete = function(root_node){}

// Add node back to local_nodes and firebase.

RemoteTree.prototype.restore_node = function(node) {
  var node_id = node.node_id
  this.scope.nodes[node_id] = node
  this.root_ref.child('nodes/' + node_id).set(angular.copy(node))
}

RemoteTree.prototype.after_bind_delete = function() {}

RemoteTree.prototype.walk_tree = function(top_ids, func) {
  for(var i = 0; i < top_ids.length; i++) {
    var node = this.scope.nodes[top_ids[i]]
    func(node)
    this.walk_tree(node.child_ids, func)
  }
}

RemoteTree.prototype.after_delete = function() {}













