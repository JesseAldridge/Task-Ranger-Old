
// Delete button.  Undelete button.

RemoteTree.prototype.after_bind_intervals = function() {
  var tree = this
  this.scope.delete_node = function(node) {
    delete scope.nodes[node.node_id]
    tree.root_ref.child('nodes/' + node.node_id).remove()
  }

  this.scope.collapse_icon = function(node) {
    if(!node.child_ids || node.child_ids.length == 0)
      return 'ui-icon-blank'
    return node.is_collapsed ? 'ui-icon-triangle-1-e' : 'ui-icon-triangle-1-s'
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
    if(tree.scope.curr_node == node)
      tree.scope.curr_node = null
    tree.after_delete(deleted_root)
  }

  // Delete the current interval.

  this.scope.delete_interval = function(node, interval) {
    var node_intervals = tree.scope.nodes[node.node_id].node_intervals,
        daily_ms = tree.date_to_daily_ms(new Date(interval.create_ms))
    var interval_list = node_intervals[daily_ms],
        index = interval_list.indexOf(interval)
    interval_list.splice(index, 1)
    if(interval == tree.scope.curr_interval)
      tree.scope.curr_interval = null
    var path = 'nodes/' + node.node_id + '/node_intervals/' + daily_ms + '/'
    tree.root_ref.child(path).set(angular.copy(interval_list))
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

  this.scope.task_score = function(node) {
    if(!node.text)
      return
    var text = node.text.trim()
    var match = text.match(/\(([0-9\.]+)\)?$/)
    if(match) {
      value = parseFloat(match[1])
      return (value / (node.cum_ms / 1000)) * 60 * 60 * 10
    }
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

RemoteTree.prototype.walk_tree = function(top_ids, func, extra_args) {
  for(var i = 0; i < top_ids.length; i++) {
    var node = this.scope.nodes[top_ids[i]]
    func(node, extra_args)
    this.walk_tree(node.child_ids, func, extra_args)
  }
}

RemoteTree.prototype.after_delete = function() {}













