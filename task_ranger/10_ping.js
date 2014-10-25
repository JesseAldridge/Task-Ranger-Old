
// Start pinging.

RemoteTree.prototype.after_bind_drag_drop = function() {
  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  var tree = this
  global_tree = tree

  $(document).on('click', '.headline', function(evt) {
    if(!evt.metaKey && !evt.altKey) {
      $('.current_node').removeClass('current_node')
      var node_el = $(this).closest('.node')
      node_el.addClass('current_node')
      var node = tree.local_nodes[node_el.attr('node_id')]
      node.new_interval()
    }
    return false
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

// Create a new interval -- in local node, in db, and render view.

LocalNode.prototype.new_interval = function() {
  var interval_obj = {create_ms:new Date().getTime(), ms:0, text:'new interval'}
  if(!this.node_intervals)
    this.node_intervals = {}
  var curr_day_ms = this.get_curr_day_ms()
  var intervals = this.node_intervals[curr_day_ms]
  intervals.push(interval_obj)
  this.send('node_intervals/' + curr_day_ms + '/' + (intervals.length - 1), interval_obj)
  this.tree.add_interval_el(interval_obj.text)
}

LocalNode.prototype.get_curr_day_ms = function() {
  var date = $('#datetimepicker').data("DateTimePicker").getDate().toDate()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

RemoteTree.prototype.after_delete2 = function() {
  this.last_inc_time = null
}

// Increase node's last interval by ms since last ping.

LocalNode.prototype.increment = function() {
  var curr_time = Date.now()
  if(this.tree.last_inc_time) {
    var curr_day_ms = this.get_curr_day_ms(),
        interval_list = this.node_intervals[curr_day_ms],
        delta = curr_time - this.tree.last_inc_time
    interval_list[interval_list.length - 1].ms += delta
    this.send('interval_list/' + (interval_list.length - 1) + '/ms',
      interval_list[interval_list.length - 1].ms)
  }
  this.tree.last_inc_time = curr_time
}

RemoteTree.prototype.after_ping = function() {}

RemoteTree.prototype.after_drop = function(node, old_parent) {
  this.recalc_cum_time(node)
  if(old_parent)
    this.recalc_cum_time(old_parent)
}


RemoteTree.prototype.html_before_times = function() {
  return "<span title='Date created' class='date_created'></span>"
}
RemoteTree.prototype.html_after_times = function() {
  return "<span title='Value per hour' class='value_per_hour'></span>"
}


LocalNode.prototype.after_init = function() {
  if(!this.date_created)
    this.set('date_created', Date.now())
}

RemoteTree.prototype.after_intervals_shown = function() {
  this.set_current_interval($('.interval:last'))

}

RemoteTree.prototype.set_current_interval = function(el) {
  $('.current_interval').removeClass('current_interval')
  el.addClass('current_interval')
}

RemoteTree.prototype.after_add_interval_el = function(input) {
  this.set_current_interval(input)
}

RemoteTree.prototype.after_set_current_node = function(node) {
  node.just_selected = true
}


// Turn the seconds into a rendered date on the node.

RemoteTree.prototype.decorate_node_el = function(task_node) {
  var task_el = select_node_el(task_node)
  set_time_el($(task_el).find('.task_time:first'), task_node.calc_indiv_ms())
  set_time_el($(task_el).find('.cum_time:first'), task_node.cum_ms)
  task_el.find('.date_created:first').text(moment(task_node.date_created).format('MM/DD'))
  this.after_decorate_node(task_node)
}

RemoteTree.prototype.after_decorate_node = function(task_node) {}










