
BaseTree.prototype.write_test_data = function() {
  this.write_root_json(this.get_test_json())
}

// Write a json object to the root

BaseTree.prototype.write_root_json = function(root_json) {
  var tree = this
  new Firebase(this.firebase_url() + 'test_tree').set(
    root_json, function() {
      tree.download_data()
    })
}

BaseTree.prototype.firebase_url = function() {
  return 'https://taskranger.firebaseio.com/'
}

BaseTree.prototype.get_user_root = function() {
  return 'test_tree'
}

BaseTree.prototype.download_data = function() {

  // Download data from firebase.

  this.root_ref = new Firebase(this.firebase_url() + this.get_user_root())
  var tree = this
  this.root_ref.once('value', function(snap) {
    var default_json = {
      "nodes" : {
        "0" : {
          "node_id" : "0",
          "cum_ms": 0,
          "text" : "Default Category",
          "create_ms" : Date.now()
        }
      },
      "top_ids" : [ "0" ]
    }

    var nodes = default_json.nodes,
        top_ids = default_json.top_ids
    if(!snap.val() || !snap.val().nodes || snap.val().nodes.length == 0 ||
       !snap.val().top_ids || snap.val().top_ids.length == 0)
      tree.root_ref.set(default_json)
    else {
      nodes = snap.val().nodes
      top_ids = snap.val().top_ids
    }

    var scope = tree.scope

    for(var id in nodes) {
      var node = nodes[id]
      node.child_ids = node.child_ids || []
      node.node_intervals = node.node_intervals || {}
    }
    scope.nodes = nodes
    scope.top_ids = top_ids
    tree.fixup_data()
    tree.regen_top5()
    tree.after_download_data()
    scope.$apply()
  })

  // Debounced save of a key/val pair for the passed node.

  this.scope.save_node_key = function(node, key, val, debounce) {
    var path = 'nodes/{id}/{key}'.replace('{id}', node.node_id).replace('{key}', key)
    set_func = function() {
      tree.root_ref.child(path).set(angular.copy(val))
    }
    if(debounce) {
      if(!tree.save_timers)
        tree.save_timers = {}
      clearTimeout(tree.save_timers[path])
      tree.save_timers[path] = setTimeout(set_func, 500)
    }
    else
      set_func()
  }
}

BaseTree.prototype.after_download_data = function() {}

// Special case saves for entire node and id list.

BaseTree.prototype.save_node = function(node) {
  var path = 'nodes/' + node.node_id
  this.root_ref.child(path).set(node)
}



// Save a key/value for the passed interval path.

BaseTree.prototype.save_interval = function(interval) {
  var scope = control.scope
  var daily_ms = scope.date_to_daily_ms(new Date(interval.create_ms))
  var day = scope.get_day(daily_ms)
  var index = scope.days[daily_ms].intervals.indexOf(interval)
  var path = 'days/' + daily_ms + '/intervals/' + index
  control.save_path(path, interval)
}




BaseTree.prototype.save_id_list = function(node_id, id_list) {
  var path = (
    node_id ? 'nodes/{0}/child_ids'.replace('{0}', node_id) : 'top_ids')
  this.root_ref.child(path).set(id_list)
}

BaseTree.prototype.after_request_data = function(){}

BaseTree.prototype.save_top_ids = function() {
  this.root_ref.child('top_ids').set(this.scope.top_ids)
}

BaseTree.prototype.delete_node_from_db = function() {
  this.root_ref.child('nodes/' + deleted_id).remove()
}

BaseTree.prototype.save_interval_list_to_db = function(node_id, daily_ms, interval_list) {
  var path = 'nodes/' + node_id + '/node_intervals/' + daily_ms + '/'
  this.root_ref.child(path).set(angular.copy(interval_list))
}

BaseTree.prototype.save_node_to_db = function(node) {
  this.root_ref.child('nodes/' + node.node_id).set(angular.copy(node))
}


