// requires:
// https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js
// https://cdn.firebase.com/js/client/1.0.21/firebase.js
// https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js


function RemoteTree() {
  this.on_construction()
}

RemoteTree.prototype.on_construction = function() {}

RemoteTree.prototype.write_test_data = function() {

  function random_id() {
    return '' + Math.round(Math.random() * Math.pow(10, 10))
  }

  // Generate a couple of chunks for a node.  Store in global map, ref'd from node.

  var global_chunks_json = {}
  function generate_fake_chunks() {
    var date = new Date(),
        daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    node_chunks = {}
    node_chunks[daily_time] = []
    for(var _ = 0; _ < 2; _++) {
      var chunk_id = random_id()
      global_chunks_json[chunk_id] = {
        chunk_id:chunk_id,
        create_time:moment().subtract(30, 'days').valueOf(),
        interval_time:1000 * 60 * 60 * 60,  // 1 hour
        text:'default chunk text ' + chunk_id
      }
      node_chunks[daily_time].push(chunk_id)
    }
    return node_chunks
  }

  // Create some fake data.

  var id_a = random_id(), id_b = random_id()

  var nodes_json = {}
  nodes_json[id_a] = {
    node_id:id_a,
    node_chunks:generate_fake_chunks(),
    child_ids:[id_b]
  }
  nodes_json[id_b] = {
    node_id:id_b,
    node_chunks:generate_fake_chunks(),
    parent_id:id_a
  }
  for(var key in nodes_json) {
    nodes_json[key].text = 'foo text ' + key
    this.decorate_node_json(nodes_json[key])
  }

  var tree = this
  new Firebase('https://taskranger.firebaseio.com/test_tree').set(
    {nodes:nodes_json, chunks:global_chunks_json, top_level_ids:[id_a]}, function() {
      $('body').append('<a href="https://taskranger.firebaseio.com/test_tree">View Data</a>')
      tree.after_write_test_data()
    })
}

RemoteTree.prototype.decorate_node_json = function(json_obj) {}
RemoteTree.prototype.after_write_test_data = function() {}

function run_test() {
  var tree = new RemoteTree()
  tree.write_test_data()
}











