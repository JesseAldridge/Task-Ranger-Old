
// Insert child, insert under buttons.

RemoteTree.prototype.after_bind_collapse = function() {
  var tree = this

  $(document).on('click', '.insert-child', function() {
    tree.add_index(tree.from($(this), 'node_el'), 0)
    return false
  })

  $(document).on('click', '.insert-under', function() {
    var node_el = tree.from($(this), 'node_el')
    var parent_el = node_el.parent().closest('.node')
    var index = parent_el.find('ol:first > .node').index(node_el)
    if(parent_el.length == 0)
      index = tree.top_ids.indexOf(node_el.attr('node_id'))
    tree.add_index(parent_el, index + 1)
    return false
  })

  this.after_bind_insert()
}

RemoteTree.prototype.after_bind_insert = function() {}

RemoteTree.prototype.add_index = function(parent_el, index) {

  // Add a new node to the passed parent el.  from: bind_events -> insert

  var parent_node = this.local_nodes[parent_el.attr('node_id')]
  var parent_id = parent_node ? parent_node.node_id : null
  new_node = this.write_json_to_node(new_node_json(), parent_id, index)
  this.after_add_node(this.local_nodes[parent_id], new_node)
}

function new_node_json() { return {'text':'New Node'} }

RemoteTree.prototype.after_add_node = function(parent_node, new_node) {

  // Toggle collapse, set current, etc.  from: add_index and undelete

  if(parent_node && !parent_node.is_expanded)
    this.toggle_collapse(parent_node)
  var node_el = select_node_el(new_node)
  $('.current').removeClass('current')
  node_el.addClass('current')
  var input = this.from(node_el, 'text')
  input.focus()
  input.select()
  new_node.new_interval()
  return node_el
}


LocalNode.prototype.new_interval = function() {
  var interval_obj = {start:new Date().getTime(), ms:0}
  if(!this.interval_list)
    this.interval_list = []
  this.interval_list.push(interval_obj)
  this.send('interval_list/' + (this.interval_list.length - 1), interval_obj)
}


RemoteTree.prototype.add_node_el = function(sibling_ids, ol, node, is_red, prefix) {

  // Insert a new node el into ol at the appropriate index.  from: render_node

  var new_html = $(window.node_el_template()).tmpl(node)
  var index = sibling_ids ? sibling_ids.indexOf(node.node_id) : -1
  if(index == -1 || index >= $(ol).children('li').length)
    $(ol).append(new_html)
  else {
    var selector = '> li:nth-child(' + (index + 1) + ')'
    $(ol).find(selector).before(new_html)
  }
  var node_el = select_node_el(node)
  var input = this.from(node_el, 'text')
  input.autoGrowInput({comfortZone: 45})
  input.blur()
  this.decorate(node, is_red, prefix)
  return node_el
}
