
window.html_after_buttons = function() { return "\
<div class='ui-icon ui-icon-clock modify-times'></div> \
<div class='date'></div> \
<div class='cum_time time'>00:00:00</div> \
<input class='task_time time' value='00:00:00'> \
<span class='score'></span> \
"
}

RemoteTree.prototype.decorate_node_el = function(task_node) {
  var task_el = select_node_el(task_node)
  set_time_div(this.from(task_el, 'task_time'), task_node.indiv_ms)
  set_time_div(this.from(task_el, 'cum_time'), task_node.cum_ms)
  // var avg_date = get_avg_date(task_node)
  // task_node.avg_date = avg_date
  // from(task_el, 'date').text(
  //   '' + (avg_date.getMonth() + 1) + '/' + avg_date.getDate() + '/' +
  //   avg_date.getFullYear())
  // var score = task_score(task_node)
  // if(score)
  //   from(task_el, 'score').text(score.toFixed(3))
}
