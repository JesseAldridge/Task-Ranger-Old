
// Init node's timer vars.

LocalNode.prototype.after_init = function() {
  if(!this.cum_ms)
    this.set('cum_ms', 0)
  this.after_init_cum_ms()
}

LocalNode.prototype.after_init_cum_ms = function() {}

RemoteTree.prototype.html_after_buttons = function() {
  return (this.html_before_times() + "\n" +
  "<div title='Cumulative time' class='cum_time time'>00:00:00</div>\n" +
  this.html_after_times())
}

RemoteTree.prototype.html_before_times = function() { return "" }
RemoteTree.prototype.html_after_times = function() { return "" }

// Include descendants' times.  Display new time and recurse upward.

RemoteTree.prototype.recalc_cum_time = function(task_node) {
  var cum_ms = task_node.calc_indiv_ms()
  var child_ids = task_node.child_ids
  for(var i = 0; i < child_ids.length; i++)
    cum_ms += this.local_nodes[child_ids[i]].cum_ms

  var task_el = select_node_el(task_node)
  var cum_time_dom = $(task_el).find('.cum_time:first')
  set_time_el(cum_time_dom, cum_ms)
  task_node.set('cum_ms', cum_ms)
  var parent_node = this.local_nodes[task_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}

// Sum each interval for each day.

LocalNode.prototype.calc_indiv_ms = function() {
  var ms = 0
  for(var date in this.node_intervals) {
    var interval_list = this.node_intervals[date]
    for(var i = 0; i < interval_list.length; i++)
      ms += interval_list[i].ms
  }
  return ms
}

RemoteTree.prototype.after_delete = function(node) {
  var parent_node = this.local_nodes[node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
  this.after_delete2()
}

RemoteTree.prototype.after_delete2 = function(){}


// Set hours:mins:secs for passed element.

function set_time_el(time_dom, ms) {
  if(!ms)
    ms = 0
  var secs = ms / 1000
  var time_str = build_time_str(secs)
  if($(time_dom).is('input'))
    time_dom.val(time_str)
  else
    time_dom.text(time_str)
  return time_str
}

// Integer seconds to hours:mins:seconds string.

function build_time_str(all_secs) {
  var hms = break_up_secs(all_secs)
  var hours = hms[0], mins = hms[1], secs = hms[2]
  if(secs < 10)  secs = '0' + secs
  if(mins < 10)  mins = '0' + mins
  if(hours < 10)  hours = '0' + hours
  var t_str = '%h:%m:%s'.replace('%h', hours).replace('%m', mins)
  t_str = t_str.replace('%s', secs)
  return t_str
}

// Seconds to hours, mins, secs

function break_up_secs(secs) {
  var mins = Math.floor(secs / 60)
  secs %= 60
  var hours = Math.floor(mins / 60)
  mins %= 60
  secs = Math.round(secs)
  return [hours, mins, secs]
}

RemoteTree.prototype.after_undelete = function(root_node) {
  var parent_node = this.local_nodes[root_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}


function run_test() {
  RemoteTree.prototype.after_bind_drag_drop2 = function() {
    for(var key in this.local_nodes) {
      var node = this.local_nodes[key]
      if(node.child_ids.length == 0)
        this.recalc_cum_time(node)
    }
  }
  var tree = new RemoteTree()
  tree.write_test_data()
}









