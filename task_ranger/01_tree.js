
function RemoteTree(scope) {
  scope.nodes = {
    1:{node_id:1, text:'foo text', parent_id:null, child_ids:[2,3]},
    2:{node_id:2, text:'bar text', parent_id:1, child_ids:[]},
    3:{node_id:3, text:'red text', parent_id:1, child_ids:[]}
  }
  scope.top_ids = [1]
}

angular.module('treeApp', [])

.controller('TreeController', ['$scope', '$timeout', function($scope, $timeout) {

  new RemoteTree($scope)

  function remove_id_from_parent(node) {
    var parent_node = $scope.nodes[node.parent_id]
    if(parent_node)
      std.delete_val(parent_node.child_ids, node.node_id)
    else
      std.delete_val($scope.top_ids, node.node_id)
  }

  function setup_nestedSortable() {
    $('#tree_section').nestedSortable({
      forcePlaceholderSize: true, handle: 'div', helper:  'clone',
      items: 'li', maxLevels: 0, opacity: .6, placeholder: 'placeholder',
      revert: 100, tabSize: 25, tolerance: 'pointer', toleranceElement: '> div',
      distance: 10, doNotClear: true,
      update: function(event, ui) {

        // Change node's parent and parent's children on drop.

        var moved_node = $scope.nodes[ui.item.attr('node_id')]
        var old_parent = $scope.nodes[moved_node.parent_id]
        remove_id_from_parent(moved_node)
        var new_parent_el = ui.item.parent().parent()
        if(new_parent_el.attr('node_id')) {
          var new_parent_node = $scope.nodes[new_parent_el.attr('node_id')]
          moved_node.parent_id = new_parent_node.node_id
          var child_ids = new_parent_node.child_ids
          var index = $(new_parent_el).find('ol:first > [node_id]').index($(ui.item))
          child_ids.splice(index, 0, moved_node.node_id)
        }

        // If no parent, add node to top level.

        else {
          var index = $('#tree_section > [node_id]').index($(ui.item))
          $scope.top_ids.splice(index, 0, moved_node.node_id)
          moved_node.parent_id = null
        }

        $scope.show_tree = false
        $scope.$apply()
        $scope.show_tree = true
        $scope.$apply()
        setup_nestedSortable()
      }
    })
  }
  $scope.show_tree = true
  $timeout(setup_nestedSortable, 100)
}])

