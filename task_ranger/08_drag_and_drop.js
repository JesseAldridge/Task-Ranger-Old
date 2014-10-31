// requires:
// static/jquery.ui.nestedSortable.js

RemoteTree.prototype.after_bind_delete = function() {

  // Called from html.  Drag and drop nodes.

  var tree = this

  $('.tree_section > ol').nestedSortable({
    forcePlaceholderSize: true, handle: 'div', helper:  'clone',
    items: 'li', maxLevels: 0, opacity: 0.6, placeholder: 'placeholder',
    revert: 250, tabSize: 25, tolerance: 'pointer', toleranceElement: '> div',
    distance: 20, doNotClear: true,
    update: function(event, ui) {

      // Change node's parent and parent's children on drop.

      var moved_node = tree.local_nodes[ui.item.attr('node_id')]
      var old_parent = tree.local_nodes[moved_node.parent_id]
      tree.remove_id_from_parent(moved_node)
      var new_parent_el = ui.item.parent().parent()
      if(new_parent_el.hasClass('node')) {
        var new_parent_node = tree.local_nodes[new_parent_el.attr('node_id')]
        moved_node.set('parent_id', new_parent_node.node_id)
        var child_ids = new_parent_node.child_ids
        var index = $(new_parent_el).find('ol:first > .node').index($(ui.item))
        child_ids.splice(index, 0, moved_node.node_id)
        new_parent_node.set('child_ids', child_ids)
      }

      // If no parent, add node to top level.

      else {
        var index = $('#tree_section > .node').index($(ui.item))
        tree.top_ids.splice(index, 0, moved_node.node_id)
        tree.root_ref.child('top_ids').set(tree.top_ids)
        moved_node.set('parent_id', null)
      }
      tree.decorate_ids(tree.top_ids)
      tree.after_drop(moved_node, old_parent)
    }
  })

  this.after_bind_drag_drop()
  this.after_bind_drag_drop2()
}

RemoteTree.prototype.after_drop = function(node, old_parent) {}
RemoteTree.prototype.after_bind_drag_drop = function() {}
RemoteTree.prototype.after_bind_drag_drop2 = function() {}




