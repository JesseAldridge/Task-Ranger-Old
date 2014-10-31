
RemoteTree.prototype.after_write_test_data = function() {
  this.download_data()
}

RemoteTree.prototype.download_data = function() {

  // Connect to firebase.  Prepare data containers.

  this.root_ref = new Firebase('https://taskranger.firebaseio.com/' + this.get_user_root())
  this.local_nodes = {}
  this.top_ids = []
  this.create_ms = Date.now()

  // Copy top ids from root.  Create LocalNodes and Intervals.

  var tree = this
  this.root_ref.once('value', function(snap) {
    var top_ids = []
    if(snap.val()) {
      top_ids = snap.val().top_ids
      if(!top_ids || top_ids.length === 0)
        top_ids = []

      var node_snaps = snap.val().nodes
      for(var node_id in node_snaps)
        tree.local_nodes[node_id] = new LocalNode(node_snaps[node_id], tree)
    }
    tree.top_ids = top_ids
    tree.after_download_data()
  })
}

RemoteTree.prototype.get_user_root = function() { return 'test_tree' }

RemoteTree.prototype.after_download_data = function() {}

RemoteTree.prototype.after_top_ids = function(){}

// Apply some function to every node.

RemoteTree.prototype.walk_tree = function(node_ids, func, extra_args) {
  this._walk_tree(node_ids ? node_ids.slice(0) : [], func, extra_args)
}

RemoteTree.prototype._walk_tree = function(node_ids, func, extra_args) {
  if(node_ids.length == 0)
    return
  var node_id = node_ids.shift(),
      node = this.local_nodes[node_id]
  if(node) {
    if(!node.node_id)
      node.node_id = node_id
    func(node, extra_args)
    node_ids = node.child_ids.concat(node_ids)
  }
  else
    console.log('node not found locally: ' + node_id)

  this.walk_tree(node_ids, func, extra_args)
}

// Copy attributes from snapshot.  Init undefined vars.

function LocalNode(node_snap, tree) {
  this.tree = tree
  this.props_to_ignore = {tree:true, props_to_ignore:true, former_index:true}
  for(var key in node_snap)
    this[key] = node_snap[key]
  this.text = '' + this.text
  this.child_ids = this.child_ids || []
  this.parent_id = this.parent_id || null
  this.node_intervals = this.node_intervals || {}
  this.after_init()
}

LocalNode.prototype.after_init = function() {}

LocalNode.prototype.set = function(key, val) {
  this.send(key, val)
  this[key] = val
}

LocalNode.prototype.send = function(key, val) {
  var path = 'nodes/{id}/{key}'.replace('{id}', this.node_id).replace('{key}', key)
  if(val === undefined)
    val = this[key]
  this.tree.root_ref.child(path).set(val)
}


function run_test() {
  RemoteTree.prototype.after_download_data = function() {

    // Walk the tree, check total time and set text for each node.

    var tree = this
    this.walk_tree(this.top_ids, function(node) {
      var node_intervals = node.node_intervals
      var total_time = 0
      for(var timestamp in node_intervals) {
        var daily_intervals = node_intervals[timestamp]
        for(var i = 0; i < daily_intervals.length; i++)
          total_time += daily_intervals[i].ms
      }
      console.log('node time:', total_time)
      if(total_time <= 0)
        throw "test failed"
      node.set('text', new Date().getTime())
    })
  }

  var tree = new RemoteTree()
  tree.write_test_data()
}








