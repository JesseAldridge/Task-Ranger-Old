
RemoteTree.prototype.write_test_data = function() {

  // Write some test data to firebase.

  var test_json = {
    "nodes" : {
      "5005108148" : {
        "child_ids" : [ "9072973696" ],
        "is_collapsed" : false,
        "node_id" : "5005108148",
        "node_intervals" : {
          "1415952000000" : [ {
            "create_ms" : 1413407782790,
            "ms" : 3600000,
            "text" : "#foo interval text 58233205",
            'daily_time': 1415952000000
          }, {
            "create_ms" : 1413407782792,
            "ms" : 3600000,
            "text" : "#foo interval text 4848701092",
            'daily_time': 1415952000000
          } ]
        },
        "cum_ms": 14400000,
        "text" : "foo text 5005108148"
      },
      "5534964984" : {
        "node_id" : "5534964984",
        "parent_id" : "9072973696",
        "cum_ms": 0
      },
      "9072973696" : {
        "child_ids" : [ "5534964984" ],
        "is_collapsed" : false,
        "node_id" : "9072973696",
        "node_intervals" : {
          "1415952000000" : [ {
            "create_ms" : 1413407782793,
            "ms" : 3600000,
            "text" : "#bar interval text 9083590657"
          }, {
            "create_ms" : 1413407782793,
            "ms" : 3600000,
            "text" : "#bar interval text 5191242022"
          } ]
        },
        "cum_ms": 7200000,
        "parent_id" : "5005108148",
        "text" : "foo text 9072973696"
      }
    },
    "top_ids" : [ "5005108148" ]
  }

  this.write_root_json(test_json)
}

// Write a json object to the root
// (monkey patched by 02_local_db.js)
RemoteTree.prototype.write_root_json = function(root_json) {
  var tree = this
  new Firebase(this.firebase_url + 'test_tree').set(
    root_json, function() {
      this.download_data()
    })
}

RemoteTree.prototype.firebase_url = function() {
  return 'https://taskranger.firebaseio.com/'
}

RemoteTree.prototype.get_user_root = function() {
  return 'test_tree'
}

RemoteTree.prototype.download_data = function() {

  // Download data from firebase.

  this.root_ref = new Firebase(this.firebase_url() + this.get_user_root())
  var tree = this
  this.root_ref.once('value', function(snap) {
    if(!snap.val() || !snap.val().nodes || snap.val().nodes.length == 0 ||
       !snap.val().top_ids || snap.val().top_ids.length == 0) {
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

        tree.root_ref.set(default_json, function() { tree.download_data() })
        return
    }

    scope = tree.scope
    var nodes = snap.val().nodes
    for(var id in nodes) {
      var node = nodes[id]
      node.child_ids = node.child_ids || []
      node.node_intervals = node.node_intervals || {}
    }
    scope.top_ids = snap.val().top_ids
    scope.nodes = nodes
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

  this.after_request_data()
}

// Special case saves for entire node and id list.

RemoteTree.prototype.save_node = function(node) {
  var path = 'nodes/' + node.node_id
  this.root_ref.child(path).set(node)
}

RemoteTree.prototype.save_id_list = function(node_id, id_list) {
  var path = (
    node_id ? 'nodes/{0}/child_ids'.replace('{0}', node_id) : 'top_ids')
  this.root_ref.child(path).set(id_list)
}

RemoteTree.prototype.after_request_data = function(){}

RemoteTree.prototype.save_top_ids = function() {
  tree.root_ref.child('top_ids').set(this.scope.top_ids)
}



