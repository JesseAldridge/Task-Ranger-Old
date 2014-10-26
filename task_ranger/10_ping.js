
// Start pinging.

RemoteTree.prototype.after_bind_drag_drop = function() {
  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  var tree = this
  global_tree = tree

  $(document).on('focus', '.interval', function(e) {
    global_tree.set_current_interval(
      tree.local_nodes[$('.current_node').attr('node_id')], $(this))
  })

  this.init_notifications()
}

// Request permission and init notification vars.

RemoteTree.prototype.init_notifications = function() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  }
  else if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      console.log('permission:', permission)
      Notification.permission = permission;
    })

  this.last_input_date = null
  this.nagged = false
  this.notification = null

  var tree = this
  $(document).on('keydown', '.text', function(e) {
    tree.last_input_date = new Date()
  })

  this.after_init_notifications()
}

RemoteTree.prototype.after_init_notifications = function() {}


// Increment selected node interval, re-render timer, recalc cum time, loop.

// (not a method because it's called via setTimeout, so this == window)
function ping() {
  if(!global_tree.last_input_date)
    global_tree.last_input_date = new Date()
  var current_node = $('.current_node')
  if(current_node.length > 0 && !global_tree.paused) {
    var selected_node = global_tree.local_nodes[current_node.attr('node_id')]
    if(selected_node.just_selected) {
      selected_node.just_selected = false
      selected_node.new_interval()
    }
    selected_node.increment()
    global_tree.recalc_cum_time(selected_node)
    global_tree.nag()
    global_tree.decorate_ids(global_tree.top_ids)
  }
  global_tree.ping_timer = setTimeout(ping, global_tree.ping_secs * 1000)
  global_tree.after_ping()
}


// Create a notification every 10 minutes, unless the user ignored the last one.

RemoteTree.prototype.nag = function() {
  var nag_secs = 10 * 60
  // var nag_secs = 5
  if(this.last_input_date && new Date() - this.last_input_date > nag_secs * 1000) {
    if(!this.nagged) {
      this.nagged = true
      if (!("Notification" in window))
        return
      else if (Notification.permission === "granted")
        this.notification = new Notification(
          "It's been 10 minutes.", {icon:'static/clock.png'})
    }
  }
  else {
    if(this.nagged)
      this.nagged = false
    if(this.notification) {
      this.notification.close()
      this.notification = null
    }
  }
}

RemoteTree.prototype.after_delete2 = function() {
  this.last_inc_time = null
}

// Increase node's last interval by ms since last ping.

LocalNode.prototype.increment = function() {
  if($('.current_interval').length == 0)
    return

  var curr_time = Date.now()
  if(this.tree.last_inc_time) {
    var delta = curr_time - this.tree.last_inc_time
    var curr_interval = null
    this.modify_curr_interval_ms(function(interval) {
      curr_interval = interval
      return interval.ms + delta
    })
    set_time_el($('.interval_info .time_input'), curr_interval.ms)
  }
  this.tree.last_inc_time = curr_time
}

// Modify the interval object's ms.  Update backend and tree view.

LocalNode.prototype.modify_curr_interval_ms = function(ms_func) {
  var interval_el = $('.current_interval')
  var interval = this.get_interval_obj(interval_el)
  interval.ms = ms_func(interval)
  var ms_path = this.build_interval_path(interval_el) + '/ms'
  this.send(ms_path, interval.ms)
  this.tree.recalc_cum_time(this)
}

RemoteTree.prototype.after_ping = function() {}

RemoteTree.prototype.after_drop = function(node, old_parent) {
  this.recalc_cum_time(node)
  if(old_parent)
    this.recalc_cum_time(old_parent)
}


RemoteTree.prototype.html_after_times = function() {
  return "<span title='Value per hour' class='value_per_hour'></span>"
}


LocalNode.prototype.after_init = function() {
  if(!this.date_created)
    this.set('date_created', Date.now())
}


RemoteTree.prototype.set_current_interval = function(node, interval_el) {
  $('.current_interval').removeClass('current_interval')
  interval_el.addClass('current_interval')
  var intervals = node.node_intervals[node.get_curr_day_ms()]
      interval = intervals[$('.interval').index(interval_el)]
  set_time_el($('.interval_info .time_input'), interval.ms)

  $('.interval_info .text').text(interval_el.val())
  $('.interval_info .time_input').show()
}

RemoteTree.prototype.after_show_intervals = function(node) {
  this.set_current_interval(node, $('.interval:last'))
}

RemoteTree.prototype.after_set_current_node = function(node) {
  node.just_selected = true
}

RemoteTree.prototype.after_add_interval_el = function(node, input) {
  this.set_current_interval(node, input)
}

// Turn the seconds into a rendered date on the node.

RemoteTree.prototype.decorate_node = function(task_node) {
  var task_el = select_node_el(task_node)
  set_time_el($(task_el).find('.task_time:first'), task_node.calc_indiv_ms())
  set_time_el($(task_el).find('.cum_time:first'), task_node.cum_ms)
  task_el.find('.date_created:first').text(moment(task_node.date_created).format('MM/DD'))
  this.after_decorate_node(task_node)
}

RemoteTree.prototype.after_decorate_node = function(task_node) {}










