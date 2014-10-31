// requires:
// https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js
// https://cdn.firebase.com/js/client/1.0.21/firebase.js
// https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.3/moment.min.js


function RemoteTree() {
  this.after_construction()
}

RemoteTree.prototype.after_construction = function() {}

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
      tree.after_write_test_data()
    })
}

RemoteTree.prototype.decorate_node_json = function(json_obj) {}
RemoteTree.prototype.after_write_test_data = function() {}

RemoteTree.prototype.write_json_to_node = function(node, parent_id, index) {

  // Add some extra attributes to the node, save it and add to parent.

  var node_id = node.node_id = '' + Math.round(Math.random() * 100000000000)
  node.parent_id = parent_id || null;
  node.child_ids = []
  this.decorate_node_json(node)
  this.root_ref.child('nodes/' + node_id).set(node)
  this.nodes[node_id] = node
  this.add_id_to_parent(node.node_id, parent_id, index)
  return node
}

RemoteTree.prototype.add_id_to_parent = function(node_id, parent_id, index) {

  // Add a child id to parent node's child_id list or to top level ids.

  var ids_list = parent_id ? this.nodes[parent_id].child_ids : this.top_ids
  ids_list = ids_list || []
  if(index === undefined)
    ids_list.push(node_id)
  else
    ids_list.splice(index, 0, node_id)
  var path = (
    parent_id ? 'nodes/{0}/child_ids'.replace('{0}', parent_id) : 'top_ids')
  this.root_ref.child(path).set(ids_list)
}




















