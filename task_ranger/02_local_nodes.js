
RemoteTree.prototype.after_write_test_data = function() {
  this.download_data()
}

RemoteTree.prototype.download_data = function() {

  // Connect to firebase.  Prepare data containers.

  this.root_ref = new Firebase('https://taskranger.firebaseio.com/' + this.get_user_root())
  this.local_nodes = {}
  this.local_chunks = {}
  this.top_ids = []
  this.create_time = Date.now()

  // Copy top ids from root.  Create LocalNodes and WorkChunks.

  var tree = this
  this.root_ref.once('value', function(snap) {
    var top_ids = []
    if(snap.val()) {
      top_ids = snap.val().top_level_ids
      if(!top_ids || top_ids.length === 0)
        top_ids = []

      var node_snaps = snap.val().nodes
      for(var node_id in node_snaps)
        tree.local_nodes[node_id] = new LocalNode(node_snaps[node_id], tree)

      var chunk_snaps = snap.val().chunks
      for(var chunk_id in chunk_snaps)
        tree.local_chunks[chunk_id] = new WorkChunk(chunk_snaps[chunk_id], tree)
    }
    tree.top_ids = top_ids
    tree.after_download_data()
  })
}

RemoteTree.prototype.after_download_data = function() {}

RemoteTree.prototype.get_user_root = function(){ return 'test_tree' }

RemoteTree.prototype.after_top_ids = function(){}

// Apply some function to every node.

RemoteTree.prototype.walk_tree = function(node_ids, func, extra_args) {
  for(var i in node_ids) {
    var node = this.local_nodes[node_ids[i]]
    if(!node)
      throw 'node not found locally: ' + node_ids[i]
    if(!node.node_id) {
      console.log('node:', node)
      throw 'node has no id'
    }
    func(node, extra_args)
    this.walk_tree(node.child_ids, func, extra_args)
  }
}

function WorkChunk(chunk_snap) {
  for(var key in chunk_snap)
    this[key] = chunk_snap[key]
  this.parent_id = this.parent_id || null
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
  this.node_chunks = this.node_chunks || {}
  this.after_init()
}

LocalNode.prototype.after_init = function() {}

LocalNode.prototype.set = function(key, val) {
  this.send(key, val)
  this[key] = val
}

LocalNode.prototype.send = function(key, val) {
  this.tree.root_ref.child('nodes/{id}/{key}'.replace(
    '{id}', this.node_id).replace('{key}', key)).set(val)
}


function run_test() {
  RemoteTree.prototype.after_download_data = function() {

    // Walk the tree, check total time and set text for each node.

    var tree = this
    this.walk_tree(this.top_ids, function(node) {
      var node_chunks = node.node_chunks
      var total_time = 0
      for(var timestamp in node_chunks) {
        var daily_chunks = node_chunks[timestamp]
        for(var i = 0; i < daily_chunks.length; i++)
          total_time += tree.local_chunks[daily_chunks[i]].interval_time
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







