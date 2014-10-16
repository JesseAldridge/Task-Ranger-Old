

// requires
// https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js
// static/std.js
// https://cdn.firebase.com/js/client/1.0.21/firebase.js

// Init vars; connect to firebase; start copying from top.

function RemoteTree() {
  this.root_ref = new Firebase('https://taskranger.firebaseio.com/' + this.get_user_root())
  this.local_nodes = {}
  this.top_ids = []
  this.create_time = Date.now()

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
    }
    tree.top_ids = top_ids
    tree.after_load()
  })
}

RemoteTree.prototype.after_load = function() {}

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


// Copy attributes from snapshot.  Init undefined vars.


function LocalNode(node_snap, tree) {
  this.tree = tree
  this.props_to_ignore = {tree:true, props_to_ignore:true, former_index:true}
  for(var key in node_snap)
    this[key] = node_snap[key]
  this.text = '' + this.text
  var child_ids = []
  for(var id in this.child_ids)
    child_ids.push(this.child_ids[id])
  this.child_ids = child_ids
  if(!this.parent_id)
    this.parent_id = null
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
  RemoteTree.prototype.after_load = function() {
    this.walk_tree(this.top_ids, function(node) {
      console.log('setting node to current date')
      node.set('text', new Date().getTime())
    })
  }

  var tree = new RemoteTree()
}





