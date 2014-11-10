
function RemoteTree(scope) {
  scope.nodes = {
    1:{node_id:1, text:'foo text', parent_id:null, child_ids:[2,3]},
    2:{node_id:2, text:'bar text', parent_id:1, child_ids:[]},
    3:{node_id:3, text:'red text', parent_id:1, child_ids:[]}
  }
  scope.top_ids = [1]
}
