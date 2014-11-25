
// Include descendants' times.  Display new time and recurse upward.

BaseTree.prototype.recalc_cum_time = function(task_node) {
  var cum_ms = this.calc_indiv_ms(task_node)
  var child_ids = task_node.child_ids
  for(var i = 0; i < child_ids.length; i++)
    cum_ms += this.scope.nodes[child_ids[i]].cum_ms || 0
  task_node.cum_ms = cum_ms
  this.scope.save_node_key(task_node, 'cum_ms', cum_ms)

  var parent_node = this.scope.nodes[task_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}

// Sum each interval for each day.

BaseTree.prototype.calc_indiv_ms = function(node) {
  var ms = 0
  for(var date in node.node_intervals) {
    var interval_list = node.node_intervals[date]
    for(var i = 0; i < interval_list.length; i++)
      ms += interval_list[i].ms
  }
  return ms
}

BaseTree.prototype.after_delete = function(node) {
  var parent_node = this.scope.nodes[node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
  this.after_delete2()
}

BaseTree.prototype.after_delete2 = function(){}

BaseTree.prototype.after_undelete = function(root_node) {
  var parent_node = this.scope.nodes[root_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}






