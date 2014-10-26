
// Delete button.  Undelete button.

RemoteTree.prototype.after_bind_insert = function() {
  var tree = this

  $(document).on('click', '.delete', function() {
    var id = $(this).closest('.node').attr('node_id')
    tree.delete_(id)
    return false
  })

  append_widget("<button class='undelete'>Undelete</button>")
  // $('button').button()
  undelete = function() {
    var nodes = window.deleted_batches.pop()
    if(!nodes)
      return
    var root_node = nodes[0],
        parent_id = root_node.parent_id,
        parent_node = tree.local_nodes[parent_id]
    tree.add_id_to_parent(root_node.node_id, parent_id, root_node.former_index)
    for(var i = 0; i < nodes.length; i++)
      tree.restore_node(nodes[i])
    tree.after_undelete(root_node)
    tree.decorate_ids(tree.top_ids)
  }
  $(document).on('click', '.undelete', undelete)

  this.after_bind_delete()
}

RemoteTree.prototype.after_delete = function(){}
RemoteTree.prototype.after_undelete = function(root_node){}

// Add node back to local_nodes and firebase.

RemoteTree.prototype.restore_node = function(node) {
  var node_id = node.node_id
  this.local_nodes[node_id] = node
  var db_node = {}

  for (var key in node) {
    if(!node.hasOwnProperty(key) || node.props_to_ignore[key])
      continue
    db_node[key] = node[key]
  }

  this.root_ref.child('nodes/' + node_id).set(db_node)
  this.render_node(node)
}

RemoteTree.prototype.after_bind_delete = function() {}

// Store deleted nodes.  from: bind_events

window.deleted_batches = []
RemoteTree.prototype.delete_ = function(id_to_del) {
  var deleted_nodes = [],
      deleted_root = this.local_nodes[id_to_del]
  deleted_nodes.push(deleted_root)
  this.walk_tree(deleted_root.child_ids, function(desc_node) {
    deleted_nodes.push(desc_node)
  })
  for(var i = 0; i < deleted_nodes.length; i++) {
    var deleted_id = deleted_nodes[i].node_id
    delete this.local_nodes[deleted_id]
    this.root_ref.child('nodes/' + deleted_id).remove()
  }
  window.deleted_batches.push(deleted_nodes)
  this.remove_id_from_parent(deleted_root)
  select_node_el(deleted_root).remove()
  this.after_delete(deleted_root)
  this.decorate_ids(this.top_ids)
}

function append_widget(html) { $('.buttons').append(html) }

RemoteTree.prototype.after_delete = function() {}

RemoteTree.prototype.after_interval_html = function() {
  $('body').prepend('<div class="buttons"></div>')
  this.after_buttons_html()
}

RemoteTree.prototype.after_buttons_html = function() {}













