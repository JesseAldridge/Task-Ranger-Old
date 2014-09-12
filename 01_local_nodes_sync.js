
// Init vars; connect to firebase; start copying from top.

function RemoteTree() {
  this.root_ref = new Firebase('https://taskranger.firebaseio.com/')
  this.local_nodes = {}
  this.top_ids = []

  this.create_time = Date.now()

  this.root_ref.child('top_level_ids').once('value', function(snap) {
    this.top_ids = snap.val()
    this.make_local_copies(top_ids, null, false)
  })

  this.num_to_load = 0
  this.num_loaded = 0
}

// Walk node tree, making local copies of all nodes.

RemoteTree.prototype.make_local_copies = function(node_ids, parent_id) {
  if(!node_ids)
    return
  this.num_to_load += node_ids.length
  for(var key in node_ids) {
    var node_id = node_ids[key];
    (function(node_id, parent_id) {
      var node_path = 'nodes/{0}'.replace('{0}', node_id)
      this.root_ref.child(node_path).once('value', function(snap) {
        if(!snap.val())
          throw 'node not found: ' + node_id + ' parent: ' + parent_id
        this.local_nodes[node_id] = new LocalNode(snap.val())
        this.make_local_copies(this.local_nodes[node_id].child_ids, node_id)
        this.num_to_load -= 1
        this.num_loaded += 1
        if(this.num_to_load == 0) {
          console.log('done loading, time:', Date.now() - this.create_time)
          console.log('  num loaded:', this.num_loaded);
          this.after_load()
        }
      })
    })(node_id, parent_id);
  }
}

// Copy attributes from snapshot.  Init undefined vars.

function LocalNode(node_snap) {
  for(var key in node_snap)
    this[key] = node_snap[key]
  var child_ids = []
  for(var key in this.child_ids)
    child_ids.push(this.child_ids[key])
  this.child_ids = child_ids
  if(!this.parent_id)
    this.parent_id = null
}

LocalNode.prototype.set = function(key, val) {
  this[key] = val
  nodes_to_sync[this.node_id] = true
}

// Sync nodes every 10 seconds.

var nodes_to_sync = {}
function sync_loop() {
  setTimeout(function() {
    for(var node_id in nodes_to_sync) {
      var node = this.local_nodes[node_id]
      clean_copy = {}
      for(var key in node) {
        if(node[key] != undefined && typeof(node[key]) != "function")
          clean_copy[key] = node[key]
      }
      this.root_ref.child('nodes/' + node.node_id).update(clean_copy)
    }
    nodes_to_sync = {}
    sync_loop()
  }, 10000)
}
sync_loop()

function walk_tree(node_ids, func, extra_args) {

  // Apply some function to every node.

  for(var i in node_ids) {
    var node = this.local_nodes[node_ids[i]]
    if(!node)
      throw 'node not found locally: ' + node_ids[i]
    if(!node.node_id) {
      console.log('node:', node)
      throw 'node has no id' 
    }
    func(node, extra_args)
    walk_tree(node.child_ids, func, extra_args)
  }
}
