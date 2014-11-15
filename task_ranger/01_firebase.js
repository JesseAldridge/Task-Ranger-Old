
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
            "text" : "#default interval text 58233205"
          }, {
            "create_ms" : 1413407782792,
            "ms" : 3600000,
            "text" : "#default interval text 4848701092"
          } ]
        },
        "text" : "foo text 5005108148"
      },
      "5534964984" : {
        "node_id" : "5534964984",
        "parent_id" : "9072973696"
      },
      "9072973696" : {
        "child_ids" : [ "5534964984" ],
        "is_collapsed" : false,
        "node_id" : "9072973696",
        "node_intervals" : {
          "1415952000000" : [ {
            "create_ms" : 1413407782793,
            "ms" : 3600000,
            "text" : "#default interval text 9083590657"
          }, {
            "create_ms" : 1413407782793,
            "ms" : 3600000,
            "text" : "#default interval text 5191242022"
          } ]
        },
        "parent_id" : "5005108148",
        "text" : "foo text 9072973696"
      }
    },
    "top_ids" : [ "5005108148" ]
  }

  var tree = this
  new Firebase('https://taskranger.firebaseio.com/test_tree').set(
    test_json, function() {
      $('body').append('<a href="https://taskranger.firebaseio.com/test_tree">View Data</a>')
      tree.after_write_test_data()
    })
}

// Download data from firebase.

RemoteTree.prototype.after_write_test_data = function() {
  this.root_ref = new Firebase('https://taskranger.firebaseio.com/test_tree')
  var tree = this
  this.root_ref.once('value', function(snap) {
    scope = tree.scope
    var nodes = snap.val().nodes || []
    for(var id in nodes) {
      var node = nodes[id]
      node.child_ids = node.child_ids || []
      node.node_intervals = node.node_intervals || {}
    }
    scope.top_ids = snap.val().top_ids || []
    scope.nodes = nodes
    scope.$apply()
  })

  // Debounced save of a key/val pair for the passed node.

  this.scope.save_node_key = function(node, key, val) {
    clearTimeout(tree.save_timer)
    tree.save_timer = setTimeout(function() {
      var path = 'nodes/{id}/{key}'.replace('{id}', node.node_id).replace('{key}', key)
      tree.root_ref.child(path).set(angular.copy(val))
    }, 500)
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





