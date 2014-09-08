// Find input widget.

append_widget("<input class='find'></input>")
function do_find(e) {
  var find_str = $('.find').val()
  if(!find_str || find_str.length < 3)
    return
  find_str = find_str.toLowerCase()
  var result_str = ''
  var matches = []
  recurse_nodes(get('top_level_ids'), function(node) {
    if(node.text.toLowerCase().indexOf(find_str) != -1) {
      matches.push(node)
    }
  })

  // Rebind next button every search.  Recollapse temporarily expanded nodes.

  var expanded_for_search = []
  var match_i = 0
  $('#find_panel > #next').die('click')
  $('#find_panel > #next').live('click', function() {
    while(expanded_for_search.length > 0) {
      set_expanded(expanded_for_search.pop(), false)
    }
    if(matches.length == 0)
      return
    if(match_i >= matches.length)
      match_i = 0
    function expand_parents(node) {
      if(!node.is_expanded)
        expanded_for_search.push(node)
      node.set('is_expanded', true)
      var parent = node.parent
      if(parent)
        expand_parents(parent)
      else
        render_recurse(get('top_level_ids'), false)
    }
    expand_parents(matches[match_i])
    from(select_node_el(matches[match_i]), 'text').focus()
    match_i += 1
  })
}
$('.find').change(do_find)
