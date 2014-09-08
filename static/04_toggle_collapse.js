
// Headline template:  node buttons and stuff.  from: render_node

function headline_template() { 
  return "\
<div class='headline'> \
  <span style='display:none'>${node_id}</span> \
  <div class='ui-icon ui-icon-triangle-1-s collapse'></div> \
  <input class='text' value='${text}'> \
  <div title='Add child' class='ui-icon ui-icon-plusthick insert-child'></div> \
  <div title='Add under' class='ui-icon ui-icon-arrowthick-1-s insert-under'></div> \
  <div title='Delete' class='ui-icon ui-icon-closethick delete'></div> \
  %after_buttons \
</div> ".replace('%after_buttons', window.html_after_buttons())
}
function html_after_buttons(){ return '' }

// Toggle node collapse when the collapse button is clicked.

RemoteTree.prototype.after_bind_text = function() {
  var tree = this
  $(document).on('click', '.collapse', function() {
    tree.toggle_collapse(tree.get_local_node($(this)))
    return false
  })
  this.after_bind_collapse()
}

RemoteTree.prototype.after_bind_collapse = function() {}

RemoteTree.prototype.get_local_node = function(button) {
  return this.local_nodes[this.from(button, 'node_el').attr('node_id')]
}

RemoteTree.prototype.toggle_collapse = function(node) {
  this.set_expanded(node, !node.is_expanded)
}

RemoteTree.prototype.set_expanded = function(node, is_expanded) {

  // Add or remove child node elements as appropriate.  Redecorate tree.

  node.set('is_expanded', is_expanded)
  var node_el = select_node_el(node)
  if(is_expanded)
    this.render_ids(node.child_ids)
  else {
    var child_els = this.from(node_el, 'each_child_el')
    for(var i = 0; i < child_els.length; i++)
      child_els.remove()
  }
  this.decorate_ids(this.top_ids)
}

RemoteTree.prototype.decorate = function(node, is_red, prefix) {

  // Show or hide collapse button.  Point triangle correctly.  from: render_node

  var node_el = select_node_el(node)
  var collapse = this.from(node_el, 'collapse')
  var icon_classes = ['empty', 'triangle-1-s', 'triangle-1-e']
  for(var i = 0; i < icon_classes.length; i++)
    collapse.removeClass('ui-icon-' + icon_classes[i])
  if(node.child_ids && node.child_ids.length > 0)
    collapse.addClass(node.is_expanded ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-e')
  else  
    collapse.addClass('ui-icon-empty')

  // (nestedSortable kills empty ols on drop, so just add them back #note1)
  if($(node_el).find('> ol').length == 0)
    $(node_el).append('<ol></ol>')


  // Set el background color.

  var color1 = node.color1, color2 = node.color2
  if(!color1) {
    if(is_red) 
      color1 = 'eff', color2 = 'cff'
    else  
      color1 = 'cef', color2 = '9ef'
  }
  std.set_gradient(node_el, color1, color2)
  this.decorate_node_el(node)
}

RemoteTree.prototype.decorate_node_el = function(node){}







