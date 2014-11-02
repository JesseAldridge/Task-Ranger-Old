// requires:
// https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js
// https://cdn.firebase.com/js/client/1.0.21/firebase.js
// https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js


function RemoteTree() {
  this.after_construction()
}

RemoteTree.prototype.after_construction = function() {}

RemoteTree.prototype.random_id = function() {
  return '' + Math.round(Math.random() * Math.pow(10, 10))
}

RemoteTree.prototype.write_test_data = function() {

  // Generate a couple of intervals for a node.  Store in global map, ref'd from node.

  var tree = this
  function generate_fake_intervals() {
    var date = new Date(),
        daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(),
        intervals = {}
    intervals[daily_time] = []
    for(var _ = 0; _ < 2; _++) {
      intervals[daily_time].push({
        create_ms:moment().subtract(30, 'days').valueOf(),
        ms:1000 * 60 * 60,  // 1 hour
        text:'#default interval text ' + tree.random_id()
      })
    }
    return intervals
  }

  // Create some fake data.

  var id_a = this.random_id(), id_b = this.random_id()

  var nodes = [{
    node_id: id_a,
    intervals: generate_fake_intervals(),
    nodes: [{
      node_id: id_b,
      intervals: generate_fake_intervals(),
      parent_id: id_a
    }]
  }]
  this.walk_tree(function(node) {
    node.text = 'foo text ' + node.node_id
  }, nodes)

  var tree = this
  new Firebase('https://taskranger.firebaseio.com/test_tree').set(
    {nodes:nodes}, function() {
      tree.after_write_test_data()
    })
}

RemoteTree.prototype.walk_tree = function(func, nodes) {
  for(var i = 0; i < nodes.length; i++) {
    func(nodes[i])
    if(!nodes[i].nodes)
      nodes[i].nodes = []
    this.walk_tree(func, nodes[i].nodes)
  }
}

RemoteTree.prototype.after_write_test_data = function() {}

angular.module("treeApp", ['ui.tree', 'firebase'])
.controller('treeController', ['$scope', '$firebase', function($scope, $firebase) {

  RemoteTree.prototype.after_write_test_data = function() {
    console.log('wrote test data')
    var ref = this.root_ref = new Firebase('https://taskranger.firebaseio.com/test_tree/nodes');
    $scope.nodes = $firebase(ref).$asArray();
    var tree = this
    $scope.nodes.$loaded(function() {
      tree.walk_tree(function(){}, $scope.nodes)
    })
  }

  var tree = new RemoteTree()
  tree.write_test_data()
}]);















