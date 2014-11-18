
// Start pinging.

RemoteTree.prototype.after_bind_delete = function() {
  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  global_tree = this
  this.init_notifications()
  this.after_setup_ping()
}

RemoteTree.prototype.after_setup_ping = function() {}

// Request permission and init notification vars.

RemoteTree.prototype.init_notifications = function() {
  if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      console.log('permission:', permission)
      Notification.permission = permission;
    })

  this.last_input_date = null
  this.nagged = false
  this.notification = null

  var tree = this
  this.scope.set_last_input_date = function() {
    tree.last_input_date = new Date()
  }

  // Modify the interval object's ms.  Update backend and tree view.

  this.scope.$watch(
    function(){ return tree.scope.curr_interval ? tree.scope.curr_interval.ms : null },
    function(newValue, oldValue) {
      var curr_node = tree.scope.curr_node, curr_interval = tree.scope.curr_interval
      if(!curr_interval)
        return
      var daily_time = tree.date_to_daily_ms(new Date())
      var index = curr_node.node_intervals[daily_time].indexOf(curr_interval)
      tree.scope.save_interval(curr_node, tree.scope.curr_date, index, 'ms', curr_interval.ms)
      tree.recalc_cum_time(curr_node)
    }, true);

  this.after_init_notifications()
}

RemoteTree.prototype.after_init_notifications = function() {}

// Increment selected node interval, re-render timer, recalc cum time, loop.

// (not a method because it's called via setTimeout, so this == window)
function ping() {
  if(!global_tree.last_input_date)
    global_tree.last_input_date = new Date()
  var curr_node = global_tree.scope.curr_node
  if(curr_node && !global_tree.paused) {
    if(curr_node.just_selected) {
      curr_node.just_selected = false
      curr_node.new_interval()
    }
    global_tree.increment_node(curr_node)
    global_tree.recalc_cum_time(curr_node)
    global_tree.nag()
  }
  global_tree.ping_timer = setTimeout(ping, global_tree.ping_secs * 1000)
  global_tree.after_ping()
  global_tree.scope.$apply()
}


// Create a notification every 10 minutes, unless the user ignored the last one.

RemoteTree.prototype.nag = function() {
  var nag_secs = 10 * 60
  // var nag_secs = 5
  if(this.last_input_date && new Date() - this.last_input_date > nag_secs * 1000) {
    if(!this.nagged) {
      this.nagged = true
      if (Notification.permission === "granted")
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

RemoteTree.prototype.increment_node = function(node) {
  var curr_time = Date.now()
  if(this.last_inc_time) {
    var delta = curr_time - this.last_inc_time
    if(this.scope.curr_interval)
      this.scope.curr_interval.ms += delta
  }
  this.last_inc_time = curr_time
}

RemoteTree.prototype.after_ping = function() {}

RemoteTree.prototype.after_drop = function(node, old_parent) {
  this.recalc_cum_time(node)
  if(old_parent)
    this.recalc_cum_time(old_parent)
}

RemoteTree.prototype.after_set_current_node = function(node) {
  node.just_selected = true
}








