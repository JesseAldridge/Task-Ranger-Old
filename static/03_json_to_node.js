
RemoteTree.prototype.after_initial_render = function() {
  if(this.top_ids.length === 0)
    this.write_json_to_node(
      {text:"Type what you're doing. #study...  Use ellipses to separate chunks of time...  #foo Use hashtags to categorize"})

  var tree = this

  $(document).on('keydown', '.text', function() {
    clearTimeout(window.save_timer)
    function make_setter(clicked) {
      return function() { tree.from(clicked, 'node').set('text', clicked.val()) }
    }
    window.save_timer = setTimeout(make_setter($(this)), 500)
  })

  this.after_bind_text()
}

RemoteTree.prototype.after_bind_text = function(){}

RemoteTree.prototype.write_json_to_node = function(obj, parent_id, index) {

  // Add some extra attributes to the object, save it and add to parent.

  var node_id = '' + Math.round(Math.random() * 100000000000)
  obj.node_id = node_id;  
  obj.parent_id = parent_id || null;
  obj.is_expanded = true
  obj.child_ids = []
  this.root_ref.child('nodes/' + node_id).set(obj)
  this.local_nodes[node_id] = new_node = new LocalNode(obj, this)
  this.add_id_to_parent(new_node.node_id, parent_id, index)
  this.render_node(new_node)
  this.decorate_ids(this.top_ids)
  return new_node
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

RemoteTree.prototype.from = function(start, end) {

  // Access one particular element from another.

  start = $(start)
  if(start.parent().hasClass('headline') || start.hasClass('headline')) {
    var node_el = start.closest('.node')
    if(end == 'node_el')  
      return node_el
    else if(end == 'node_id')
      return node_el.attr('node_id')
    else if(end == 'node')
      return this.local_nodes[node_el.attr('node_id')]
    start = node_el
  }
  var res = _from_node_el(start, end)
  if(res)
    return res
  if(end.indexOf('.') !== 0)
    end = '.' + end
  if(start.hasClass('headline'))  
    return $(start.children(end))
  return start.find('.headline:first > ' + end)
}

function _from_node_el(node_el, end) {

  // Access stuff starting from a nodel element.

  if(end == 'headline')  
    return node_el.find('.headline:first')
  if(end == 'children')  
    return node_el.find('ol:first')
  if(end == 'each_child_el')  
    return node_el.find('ol:first > .node')
  if(end == 'parent')  
    return node_el.parents('.node')
}




