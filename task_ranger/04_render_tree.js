// requires:
// static/jquery.tmpl.min.js
// http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// static/smoothness/jquery-ui-1.8.12.custom.css
// static/tree.css
// static/tr.css

// Html node template:  (li (headline (input))(ol))


RemoteTree.prototype.after_construction = function() {
  $('body').append('<div class="tree_section"><ol></ol></div>')
  this.after_tree_html()
}

RemoteTree.prototype.after_tree_html = function() {}


RemoteTree.prototype.node_el_template = function() {
  return '<outer> \
  <li class="node" node_id="${node_id}"> \
    <div> \
      {headline} \
    </div> \
    <ol></ol> \
  </li> \
  </outer> '.replace("{headline}", this.headline_template())
}

RemoteTree.prototype.headline_template = function() {
  // (showing node_id can by handy for debugging)
  return '\
  <div class="headline"> \
  <span style="display:none">${node_id}</span><input class="text" value="${text}"> \
  </div>'
}

// Recursively insert html elements for all local nodes after they are loaded.

RemoteTree.prototype.after_initial_render = function() {
  if(this.top_ids.length === 0)
    this.write_json_to_node({text:"Default Node"})

  var tree = this

  $(document).on('keydown', '.text', function() {
    clearTimeout(window.save_timer)
    function make_setter(text_el) {
      return function() {
        var node_id = text_el.closest('.node').attr('node_id')
        tree.local_nodes[node_id].set('text', text_el.val())
      }
    }
    window.save_timer = setTimeout(make_setter($(this)), 500)
  })

  this.after_bind_text()
}

RemoteTree.prototype.after_bind_text = function(){}

RemoteTree.prototype.render_ids = function(node_ids, is_red) {
  this._render_ids(node_ids.slice(0), is_red)
}
RemoteTree.prototype._render_ids = function(node_ids, is_red) {
  if(node_ids.length === 0)
    return
  var node = this.local_nodes[node_ids.shift()]
  this.render_node(node, is_red)
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
  }
  else
    this.add_node_el(this.top_ids, $('.tree_section > ol:first'), node, is_red)
}

// Dom manipulation helpers.  Get and add node elements.

function select_node_el(node_id) {
  if(node_id instanceof Object)
    node_id = node_id.node_id
  return $('.node[node_id="%id"]'.replace('%id', node_id))
}

// (overridden by 06_add_nodes.js)
RemoteTree.prototype.add_node_el = function(sibling_ids, ol, node, is_red) {
  var node_el = $(this.node_el_template()).tmpl(node)
  $(ol).append(node_el)
  this.decorate_node(node, is_red)
}

function run_test() {
  var tree = new RemoteTree()
  tree.write_test_data()
}

















