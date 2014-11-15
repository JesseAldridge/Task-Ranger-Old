
// Remove id from parent.child_ids or from top_ids.

RemoteTree.prototype.remove_id_from_parent = function (node) {
  var parent_node = scope.nodes[node.parent_id]
  if(parent_node) {
    std.delete_val(parent_node.child_ids, node.node_id)
    this.save_id_list(parent_node.node_id, parent_node.child_ids)
  }
  else {
    std.delete_val(scope.top_ids, node.node_id)
    this.root_ref.child('top_ids').set(scope.top_ids)
  }
}

module.directive('tree', function() {
  return {link: function(scope, element, attrs) {

    var tree = scope.tree

    $('#tree_section').nestedSortable({
      forcePlaceholderSize: true, handle: 'div', helper:  'clone',
      items: 'li', maxLevels: 0, opacity: .6, placeholder: 'placeholder',
      revert: 100, tabSize: 25, tolerance: 'pointer', toleranceElement: '> div',
      distance: 10, doNotClear: true,
      update: function(event, ui) {

        // Change node's parent and parent's children on drop.

        var moved_node = scope.nodes[ui.item.attr('node_id')]
        tree.remove_id_from_parent(moved_node)
        var new_parent_el = ui.item.parent().parent()
        if(new_parent_el.attr('node_id')) {
          var new_parent_node = scope.nodes[new_parent_el.attr('node_id')]
          moved_node.parent_id = new_parent_node.node_id
          var child_ids = new_parent_node.child_ids
          var index = $(new_parent_el).find('ol:first > [node_id]').index($(ui.item))
          child_ids.splice(index, 0, moved_node.node_id)
          tree.save_id_list(new_parent_node.node_id, child_ids)
        }

        // If no parent, add node to top level.

        else {
          var index = $('#tree_section > [node_id]').index($(ui.item))
          scope.top_ids.splice(index, 0, moved_node.node_id)
          console.log('spliced top ids:', scope.top_ids)
          moved_node.parent_id = null
          tree.root_ref.child('top_ids').set(scope.top_ids)
        }
        scope.$apply()
      }
    })
  }}
})



