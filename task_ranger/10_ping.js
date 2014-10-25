
LocalNode.prototype.new_interval = function() {
  var interval_obj = {start:new Date().getTime(), ms:0}
  if(!this.interval_list)
    this.interval_list = []
  this.interval_list.push(interval_obj)
  this.send('interval_list/' + (this.interval_list.length - 1), interval_obj)
}

RemoteTree.prototype.after_delete2 = function() {
  this.last_inc_time = null
}


// Increment selected node interval, re-render timer, recalc cum time, loop.

// (not a method because it's called via setTimeout, so this == window)
function ping() {
  var current = $('.current')
  if(current.length > 0 && !global_tree.paused) {
    var selected_node = global_tree.local_nodes[current.attr('node_id')]
    if(selected_node.just_selected) {
      selected_node.just_selected = false
      selected_node.new_interval()
    }
    selected_node.increment()
    global_tree.recalc_cum_time(selected_node)
    if(new Date() - global_tree.last_input_date > 10 * 60 * 1000) {
      if(!global_tree.nagged) {
        global_tree.nagged = true
        if (!("Notification" in window))
          return
        else if (Notification.permission === "granted")
          global_tree.notification = new Notification(
            "It's been 10 minutes.", {icon:'static/clock.png'})
      }
    }
    else {
      if(global_tree.nagged)
        global_tree.nagged = false
      if(global_tree.notification) {
        global_tree.notification.close()
        global_tree.notification = null
      }
    }
    global_tree.decorate_ids(global_tree.top_ids)
  }
  global_tree.ping_timer = setTimeout(ping, global_tree.ping_secs * 1000)
  global_tree.after_ping()
}

// Increase node's last interval by ms since last ping.

LocalNode.prototype.increment = function() {
  var curr_time = Date.now()
  if(this.tree.last_inc_time) {
    var interval_list = this.interval_list,
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


// Start pinging.

RemoteTree.prototype.after_bind_drag_drop = function() {
  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  var tree = this
  global_tree = tree

  $(document).on('click', '.headline', function(evt) {
    if(!evt.metaKey && !evt.altKey) {
      $('.current').removeClass('current')
      var node_el = $(this).closest('.node')
      node_el.addClass('current')
      var node = tree.local_nodes[node_el.attr('node_id')]
      node.new_interval()
    }
    return false
  })

  this.after_bind_ping()
}

RemoteTree.prototype.after_bind_ping = function() {}


RemoteTree.prototype.html_before_times = function() {
  return "<span title='Date created' class='date_created'></span>"
}
RemoteTree.prototype.html_after_times = function() {
  return "<span title='Value per hour' class='value_per_hour'></span>"
}



RemoteTree.after_bind_ping = function() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  }
  else if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      console.log('permission:', permission)
      Notification.permission = permission;
    })

  this.last_input_date = new Date()
  console.log('set last_input_date, this:', this)
  this.nagged = false
  this.notification = null

  $(document).on('keydown', '.text', function(e) {
    tree.last_input_date = new Date()
  })

  this.after_init_notification()
}

RemoteTree.after_init_notification = function() {}


LocalNode.prototype.after_init = function() {
  if(!this.date_created)
    this.set('date_created', Date.now())
}


RemoteTree.prototype.after_set_current = function(node) {
  node.just_selected = true
}

RemoteTree.prototype.after_undelete = function(root_node) {
  var parent_node = this.local_nodes[root_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}


// Turn the seconds into a rendered date on the node.

RemoteTree.prototype.decorate_node_el = function(task_node) {
  var task_el = select_node_el(task_node)
  set_time_el($(task_el).find('.task_time:first'), task_node.calc_indiv_ms())
  set_time_el($(task_el).find('.cum_time:first'), task_node.cum_ms)
  task_el.find('.date_created:first').text(moment(task_node.date_created).format('MM/DD'))

  var score = this.task_score(task_node)
  if(score)
    task_el.find('.value_per_hour:first').text(score.toFixed(3))
}

// Pull user's score out of node's text.

RemoteTree.prototype.task_score = function(node_) {
  var text = node_.text.trim()
  var match = text.match(/\(([0-9\.]+)\)?$/)
  if(match) {
    value = parseFloat(match[1])
    return (value / (node_.cum_ms / 1000)) * 60 * 60 * 10
  }
}
