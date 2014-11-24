
RemoteTree.prototype.init_db = function() {

  // Open the DB.  Create the data store if necessary.

  var tree = this
  var version = 3
  var request = indexedDB.open("tr_db", version);

  request.onupgradeneeded = function(e) {
    console.log('onupgradeneeded')
    var db = e.target.result;
    if(db.objectStoreNames.contains("tr_store"))
      db.deleteObjectStore("tr_store");
      db.createObjectStore("tr_store");
  }

  // Write test data.

  request.onsuccess = function(e) {
    tree.db = e.target.result;
    tree.after_init_db()
  }
}

// Write the test data

RemoteTree.prototype.after_init_db = function() {
  this.write_root_json({
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
        "cum_ms": 0,
        "child_ids": [],
        "node_intervals": {}
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
  })
}

// Write test data to db.

RemoteTree.prototype.write_root_json = function(test_json) {
  var trans = this.db.transaction(["tr_store"], "readwrite")
  var store = trans.objectStore("tr_store")
  var nodes = test_json.nodes
  for(var node_id in nodes)
    store.put(nodes[node_id], 'node' + node_id)
  store.put(test_json.top_ids, 'top_ids')
  var tree = this
  trans.oncomplete = function(e) {
    tree.load_data()
  }
}


RemoteTree.prototype.load_data = function() {

  // Load data from IndexedDB.

  var trans = this.db.transaction(["tr_store"], "readwrite");
  var store = trans.objectStore("tr_store");

  scope = this.scope
  scope.nodes = {}
  scope.top_ids = []
  var tree = this
  store.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      if(cursor.key == 'top_ids')
        scope.top_ids = cursor.value
      else
        scope.nodes[cursor.key.substr('node'.length)] = cursor.value
      cursor.continue()
    }
    else {
      tree.after_data_loaded()
    }
  }
  this.after_request_data()
}

RemoteTree.prototype.after_data_loaded = function() {
  var tree = this,
      scope = tree.scope

  // Add some default data if the user has deleted all their nodes.

  if(!scope.nodes || scope.nodes.length == 0 ||
     !scope.top_ids || scope.top_ids.length == 0) {
    var default_json = {
      "nodes" : {
        "0" : {
          "node_id" : "0",
          "cum_ms": 0,
          "text" : "Default Category",
          "create_ms" : Date.now(),
          "child_ids": []
        }
      },
      "top_ids" : [ "0" ]
    }

    tree.write_root_json(default_json)
    return
  }

  scope.$apply()

  // We just save the whole node whenever we want to save a key.

  scope.save_node_key = function(node, key, val, debounce) {
    tree.save_node(node)
  }
}

RemoteTree.prototype.save_key_val = function(key, val) {
  var trans = this.db.transaction(["tr_store"], "readwrite");
  var store = trans.objectStore("tr_store");
  store.put(val, key);
}

// Special case saves for entire node and id list.

RemoteTree.prototype.save_node = function(node) {
  this.save_key_val('node' + node.node_id, node);
}

RemoteTree.prototype.save_id_list = function(node_id, id_list) {
  if(node_id)
    this.save_node(this.scope.nodes[node_id])
  else
    this.save_key_val('top_ids', id_list)
}

RemoteTree.prototype.after_request_data = function(){}

// (this file isn't as long as it looks -- 50 lines are the test data)



