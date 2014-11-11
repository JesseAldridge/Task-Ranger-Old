
RemoteTree.prototype.init_scope = function() {
  console.log('02 init_scope')
  this.write_test_data()
}

RemoteTree.prototype.write_test_data = function() {

  function random_id() {
    return '' + Math.round(Math.random() * Math.pow(10, 10))
  }

  // Generate a couple of intervals for a node.  Store in global map, ref'd from node.

  function generate_fake_intervals() {
    var date = new Date(),
        daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    node_intervals = {}
    node_intervals[daily_time] = []
    for(var _ = 0; _ < 2; _++) {
      node_intervals[daily_time].push({
        create_ms:moment().subtract(30, 'days').valueOf(),
        ms:1000 * 60 * 60,  // 1 hour
        text:'#default interval text ' + random_id()
      })
    }
    return node_intervals
  }

  // Create some fake data.

  var id_a = random_id(), id_b = random_id()

  var nodes_json = {}
  nodes_json[id_a] = {
    node_id:id_a,
    node_intervals:generate_fake_intervals(),
    child_ids:[id_b]
  }
  nodes_json[id_b] = {
    node_id:id_b,
    node_intervals:generate_fake_intervals(),
    parent_id:id_a
  }
  for(var key in nodes_json) {
    nodes_json[key].text = 'foo text ' + key
    this.decorate_node_json(nodes_json[key])
  }

  var tree = this
  new Firebase('https://taskranger.firebaseio.com/test_tree').set(
    {nodes:nodes_json, top_ids:[id_a]}, function() {
      $('body').append('<a href="https://taskranger.firebaseio.com/test_tree">View Data</a>')
      tree.after_write_test_data()
    })
}

RemoteTree.prototype.after_write_test_data = function() {
  this.root_ref = new Firebase('https://taskranger.firebaseio.com/test_tree')
  var tree = this
  this.root_ref.once('value', function(snap) {
    scope = tree.scope
    scope.top_ids = snap.val().top_ids || []
    scope.nodes = snap.val().nodes || []
    this.after_download_data()
    scope.$apply()
  })
}

RemoteTree.prototype.after_download_data = function() {
  // scope.$watch('name', function(newValue, oldValue) {
  //   scope.counter = scope.counter + 1;
  // });
}


RemoteTree.prototype.decorate_node_json = function(json_obj) {}


