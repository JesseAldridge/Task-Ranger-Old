
// Insert child, insert under buttons.

RemoteTree.prototype.after_bind_collapse = function() {
  var tree = this

  $(document).on('click', '.insert-child', function() {
    var node = tree.local_nodes[tree.from($(this), 'node_el').attr('node_id')]
    tree.add_index(node, 0)
    return false
  })

  $(document).on('click', '.insert-under', function() {
    tree.add_under($(this))
    return false
  })

  $(document).on('keydown', '.text', function(e) {
    var node = tree.local_nodes[$(this).closest('.node').attr('node_id')]
    if(e.keyCode == 13) // return
      tree.add_under($(this))
    else if(e.keyCode == 40) { // down
      var next_node = function(node, start_index) {
        var next_id = null
        if(node.child_ids.length > 0 && node.is_expanded) {
          if(start_index) {
            if(start_index < node.child_ids.length)
              next_id = node.child_ids[start_index]
          }
          else
            next_id = node.child_ids[0]
          if(next_id)
            return tree.local_nodes[next_id]
        }
        if(node.parent_id) {
          var parent = tree.local_nodes[node.parent_id]
          return next_node(parent, parent.child_ids.indexOf(node.node_id) + 1)
        }
        var index = tree.top_ids.indexOf(node.node_id) + 1
        if(index < tree.top_ids.length)
          return tree.local_nodes[tree.top_ids[index]]
      }
      tree.set_current(next_node(node))
    }
    else if(e.keyCode == 38) { // up
      var prev_node = function() {
        var parent = node.parent_id ? tree.local_nodes[node.parent_id] : null,
            prev_sibling = tree.get_prev_sibling(node)
        if(prev_sibling) {
          if(prev_sibling.is_expanded) {
            descend_to_leaf = function(node) {
              if(node.child_ids.length === 0 || !node.is_expanded)
                return node
              return descend_to_leaf(tree.local_nodes[node.child_ids[node.child_ids.length - 1]])
            }
            return descend_to_leaf(prev_sibling)
          }
          return prev_sibling
        }
        return parent
      }
      tree.set_current(prev_node())
    }
    else if(e.keyCode == 9) { // tab
      if(event.shiftKey)
        tree.dedent(node)
      else
        tree.indent(node)
      tree.decorate_ids(tree.top_ids)
    }
    else
      return true
    e.preventDefault()
    return false
  })

  this.after_bind_insert()
}


RemoteTree.prototype.dedent = function(node) {
  if(!node.parent_id)
    return
  var parent = this.local_nodes[node.parent_id],
      grandparent = parent.parent_id ? this.local_nodes[parent.parent_id] : null,
      gp_id_list = grandparent ? grandparent.child_ids : this.top_ids
  gp_id_list.splice(gp_id_list.indexOf(parent.node_id) + 1, 0, node.node_id)
  if(grandparent)
    grandparent.set('child_ids', gp_id_list)
  else
    this.root_ref.child('top_level_ids').set(gp_id_list)
  std.delete_val(parent.child_ids, node.node_id)
  parent.set('child_ids', parent.child_ids)
  node.set('parent_id', grandparent ? grandparent.node_id : null)
  var ol = grandparent ? this.get_el(grandparent).find('ol:first') : $('#node_container')
  ol.find(this.get_el(parent).after(this.get_el(node)))
  this.get_el(node).find('.text:first').focus()
}

RemoteTree.prototype.get_el = function(node) {
  return $('.node[node_id="{}"]'.replace('{}', node.node_id))
}

// Append the current node to the previous sibling.

RemoteTree.prototype.indent = function(node) {
  var parent = node.parent_id ? this.local_nodes[node.parent_id] : null,
      prev_sibling = this.get_prev_sibling(node)
  if(!prev_sibling)
    return
  this.remove_id_from_parent(node)
  prev_sibling.child_ids.push(node.node_id)
  prev_sibling.set('child_ids', prev_sibling.child_ids)
  node.set('parent_id', prev_sibling.node_id)
  var node_el = $('.node[node_id="{}"]'.replace('{}', node.node_id))
  $('.node[node_id="{}"]'.replace('{}', prev_sibling.node_id)).find('ol:first').append(node_el)
  if(!prev_sibling.is_expanded)
    this.toggle_collapse(prev_sibling)
  node_el.find('.text:first').focus()
}


RemoteTree.prototype.remove_id_from_parent = function(node) {

  // Remove id from parent node or top level.  Remove el and render.

  var parent_node = this.local_nodes[node.parent_id]
  if(parent_node) {
    var child_ids = parent_node.child_ids
    node.former_index = child_ids.indexOf(node.node_id)
    std.delete_val(child_ids, node.node_id)
    parent_node.set('child_ids', child_ids)
  }
  else {
    node.former_index = this.top_ids.indexOf(node.node_id)
    std.delete_val(this.top_ids, node.node_id)
    this.root_ref.child('top_level_ids').set(this.top_ids)
  }
}

RemoteTree.prototype.get_parent_id_list = function(node) {
  var parent = node.parent_id ? this.local_nodes[node.parent_id] : null
  return parent ? parent.child_ids : this.top_ids
}


RemoteTree.prototype.get_prev_sibling = function(node) {
  var id_list = this.get_parent_id_list(node),
      prev_index = id_list.indexOf(node.node_id) - 1
  return prev_index >= 0 ? this.local_nodes[id_list[prev_index]] : null
}

RemoteTree.prototype.add_under = function(node_sub_el) {
  var node_el = node_sub_el.closest('.node')
  var parent_el = node_el.parent().closest('.node')
  var index = parent_el.find('ol:first > .node').index(node_el)
  if(parent_el.length === 0)
    index = this.top_ids.indexOf(node_el.attr('node_id'))
  this.add_index(this.local_nodes[parent_el.attr('node_id')], index + 1)
}

RemoteTree.prototype.after_bind_insert = function() {}

RemoteTree.prototype.add_index = function(parent_node, index) {

  // Add a new node to the passed parent el.  from: bind_events -> insert

  var parent_id = parent_node ? parent_node.node_id : null
  new_node = this.write_json_to_node(new_node_json(), parent_id, index)
  this.after_add_node(this.local_nodes[parent_id], new_node)
}

function new_node_json() { return {'text':'New Node'} }

RemoteTree.prototype.after_add_node = function(parent_node, new_node) {

  // Toggle collapse, set current, etc.  from: add_index and undelete

  if(parent_node && !parent_node.is_expanded)
    this.toggle_collapse(parent_node)
  this.set_current(new_node)
}

RemoteTree.prototype.set_current = function(node) {
  if(!node)
    return
  var node_el = select_node_el(node)
  $('.current').removeClass('current')
  node_el.addClass('current')
  var input = this.from(node_el, 'text')
  input.focus()
  input.select()
  this.after_set_current(node)
}

RemoteTree.prototype.after_set_current = function(node) {}

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
  input.autoGrowInput({comfortZone: 5})
  input.blur()
  this.decorate(node, is_red, prefix)
  return node_el
}

function run_test() {
  $('body').append('<div><ol id="node_container"></ol></div>')
  var tree = new RemoteTree()
}
