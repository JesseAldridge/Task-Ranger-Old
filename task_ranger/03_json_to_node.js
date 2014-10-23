
RemoteTree.prototype.on_construction = function() {
  $('body').append('<div class="tree_section"><ol></ol></div>')
  this.after_tree_html()
}

RemoteTree.prototype.after_tree_html = function() {}

RemoteTree.prototype.write_json_to_node = function(obj, parent_id, index) {

  // Add some extra attributes to the object, save it and add to parent.

  var node_id = '' + Math.round(Math.random() * 100000000000)
  obj.node_id = node_id;
  obj.parent_id = parent_id || null;
  obj.child_ids = []
  this.decorate_node_json(obj)
  this.root_ref.child('nodes/' + node_id).set(obj)
  this.local_nodes[node_id] = new_node = new LocalNode(obj, this)
  this.add_id_to_parent(new_node.node_id, parent_id, index)
  this.render_node(new_node)
  this.decorate_ids(this.top_ids)

  return new_node
}

RemoteTree.prototype.decorate_node_json = function(json_obj) {
  json_obj.is_expanded = true
  return json_obj
}

RemoteTree.prototype.decorate_node_json2 = function() {}

RemoteTree.prototype.render_node = function(node) {
  console.log('render_node stub, node:', node)
}

RemoteTree.prototype.decorate = function(node) {
  console.log('decorate stub, node:', node)
}

// Redecorate to fix alternating colors after adding nodes.

RemoteTree.prototype.decorate_ids = function(node_ids, is_red) {
  this._decorate_ids(node_ids ? node_ids.slice(0) : [], is_red)
}
RemoteTree.prototype._decorate_ids = function(node_ids, is_red) {
  if(node_ids.length === 0)
    return
  var node = this.local_nodes[node_ids.shift()]
  this.decorate(node, is_red)
  if(node.is_expanded)
    node_ids = node.child_ids.concat(node_ids)
  this.decorate_ids(node_ids, !is_red)
}

RemoteTree.prototype.add_id_to_parent = function(node_id, parent_id, index) {

  // Add a child id to parent node's child_id list or to top level ids.

  var ids_list = parent_id ? this.local_nodes[parent_id].child_ids : this.top_ids
  if(!ids_list)
    ids_list = []
  if(index === undefined)
    ids_list.push(node_id)
  else
    ids_list.splice(index, 0, node_id)
  var path = (
    parent_id ? 'nodes/{0}/child_ids'.replace('{0}', parent_id) : 'top_level_ids')
  this.root_ref.child(path).set(ids_list)
}


function run_test() {
  var tree = new RemoteTree()
  RemoteTree.prototype.after_download_data = function() {
    var nodes = this.local_nodes
    this.write_json_to_node({text:'new node'}, nodes[Object.keys(nodes)[0]].node_id)
  }
  tree.write_test_data()
}















