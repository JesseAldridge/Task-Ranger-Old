
// Html node template:  (li (headline (input))(ol))

var node_el_template = function() { 
  // (see #note1 in 04_toggle_collapse.js)
  return '<outer> \
  <li class="node" node_id="${node_id}"> \
    <div> \
      {headline} \
    </div> \
    <ol></ol> \
  </li> \
  </outer> '.replace("{headline}", headline_template())
}

function headline_template() { 
  // overridden by 4_toggle_collapse.js
  // (showing node_id can by handy for debugging)
  return '\
  <div class="headline"> \
  <span style="display:none">${node_id}</span><input class="text" value="${text}"> \
  </div>'
}

// Recursively insert html elements for all local nodes after they are loaded.

RemoteTree.prototype.after_load = function() {
  this.render_ids(this.top_ids)
  this.after_initial_render()
}
RemoteTree.prototype.after_initial_render = function() {}

RemoteTree.prototype.render_ids = function(node_ids, is_red) {
  this._render_ids(node_ids.slice(0), is_red)
}
RemoteTree.prototype._render_ids = function(node_ids, is_red) {
  if(node_ids.length == 0)
    return
  var node = this.local_nodes[node_ids.shift()]
  this.render_node(node, is_red)
  if(node.is_expanded !== false)
    node_ids = node.child_ids.concat(node_ids)
  this._render_ids(node_ids, !is_red)
}

// Add the node to the DOM.

RemoteTree.prototype.render_node = function(snap_or_node, is_red) {
  var node = snap_or_node.val ? snap_or_node.val() : snap_or_node
  var parent_id = node.parent_id
  if(parent_id) {
    var parent_el = select_node_el(parent_id)
    var parent = this.local_nodes[parent_id]
    this.add_node_el(parent.child_ids, $(parent_el).find('ol').first(), node, is_red)      
    if(parent.is_expanded === false) {
      var node_el = select_node_el(node)
      node_el.hide()
    }
  }
  else
    this.add_node_el(this.top_ids, $('#node_container'), node, is_red)
}

// Dom manipulation helpers.  Get and add node elements.

function select_node_el(node_id) {
  if(node_id instanceof Object)
    node_id = node_id.node_id
  return $('.node[node_id="%id"]'.replace('%id', node_id))
}

// (overridden by 5_add_nodes.js)
RemoteTree.prototype.add_node_el = function(sibling_ids, ol, node, is_red) {
  var new_html = $(window.node_el_template()).tmpl(node)
  $(ol).append(new_html)
  this.decorate(node, is_red)
}

// (overridden by 4_toggle_collapse.js)
RemoteTree.prototype.decorate = function(node, is_red) {
  var node_el = select_node_el(node)
  $(node_el).css({'background':is_red ? '0af' : 'aff'})
}





