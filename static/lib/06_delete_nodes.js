
// Delete button.  Undelete button.

RemoteTree.prototype.after_bind_insert = function() {
  var tree = this

  console.log('after_bind_insert')

  $(document).on('click', '.delete', function() {
    var id = tree.from($(this), 'node_el').attr('node_id')
    tree.delete_(id)
    return false
  })

  append_widget("<button class='undelete'>Undelete</button>")
  // $('button').button()
  undelete = function() {
    var node_id = window.deleted.pop()
    if(node_id) {
      var node = tree.local_nodes[node_id]
      var parent_id = node.parent_id
      function restore_node(node_id) {
        var node = tree.local_nodes[node_id]
        var parent_id = node.parent_id
        var db_node = {}
        for(var i = 0; i < node.db_keys.length; i++) {
          var key = node.db_keys[i]
          db_node[key] = node[key]
        }
        console.log('db_node:', db_node)
        tree.root_ref.child('nodes/' + node_id).set(db_node)
        tree.render_node(node)
        for(var i in node.child_ids)
          restore_node(node.child_ids[i])
      }
      tree.add_id_to_parent(node_id, parent_id, node.former_index)
      restore_node(node_id)
      tree.after_add_node(tree.local_nodes[parent_id], node)
      tree.decorate_ids(tree.top_ids)
    }
  }
  $(document).on('click', '.undelete', undelete)

  this.after_bind_delete()
}

RemoteTree.prototype.after_bind_delete = function() {}

// Store deleted nodes.  from: bind_events

window.deleted = []
RemoteTree.prototype.delete_ = function(id_to_del) {
  var node = this.local_nodes[id_to_del]
  window.deleted.push(id_to_del)
  var parent_id = node.parent_id
  var parent_node = this.local_nodes[parent_id]

  // Remove id from parent node or top level.  Remove el and render.

  if(parent_node) {
    var child_ids = parent_node.child_ids
    node.former_index = child_ids.indexOf(node.node_id)
    std.delete_val(child_ids, node.node_id)
    parent_node.set('child_ids', child_ids)
  }
  else {
    node.former_index = this.top_ids.indexOf(node.node_id)
    std.delete_val(this.top_ids, node.node_id)
    this.root_ref.child('top_level_ids').set(this.top_ids)
  }
  select_node_el(node).remove()
  var tree = this
  function delete_firebase(node_id) {
    console.log('node_id:', node_id)
    for(var i in tree.local_nodes[node_id].child_ids || [])
      delete_firebase(tree.local_nodes[node_id].child_ids[i])
    tree.root_ref.child('nodes/' + node_id).remove()
  }
  delete_firebase(node.node_id)
  this.after_delete(node)
  this.decorate_ids(this.top_ids)
}

function append_widget(html) { $('.buttons').append(html) }

RemoteTree.prototype.after_delete = function() {}






