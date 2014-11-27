
// Start pinging.

BaseTree.prototype.after_bind_delete = function() {
  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  var tree = global_tree = this
  this.init_notifications()

  this.scope.toggle_pause = function() {
    tree.scope.paused = !tree.scope.paused
  }

  this.scope.pause = function() {
    if(!tree.scope.paused)
      tree.last_inc_time = Date.now()
    tree.scope.paused = true
  }

  this.scope.unpause = function() {
    tree.scope.paused = false
  }

  this.after_setup_ping()
}

BaseTree.prototype.after_setup_ping = function() {}

// Request permission and init notification vars.

BaseTree.prototype.init_notifications = function() {
  if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      Notification.permission = permission;
    })

  this.nag_count = 0
  this.notification = null
  
  this.nag_secs = 10 * 60
  // this.nag_secs = 5

  var tree = this

  // Watch interval ms changes and save to firebase.

  this.scope.$watch(
    function(){ return tree.scope.curr_interval ? tree.scope.curr_interval.ms : null },
    function(newValue, oldValue) {
      var curr_node = tree.scope.curr_node, curr_interval = tree.scope.curr_interval
      if(!curr_interval || !curr_node)
        return
      var daily_time = tree.date_to_daily_ms(new Date()),
          node_intervals = curr_node.node_intervals || {},
          index = (node_intervals[daily_time] || []).indexOf(curr_interval)
      if(index == -1)
        return
      tree.scope.save_interval(curr_node, tree.get_daily_date(), index, 'ms', curr_interval.ms)
      tree.recalc_cum_time(curr_node)
    }, true);

  this.after_init_notifications()
}

BaseTree.prototype.after_init_notifications = function() {}

// Increment selected node interval, re-render timer, recalc cum time, loop.

// (not a method because it's called via setTimeout, so this == window)
function ping() {
  var curr_node = global_tree.scope.curr_node
  if(curr_node && !global_tree.scope.paused) {
    if(curr_node.just_selected) {
      curr_node.just_selected = false
      curr_node.new_interval()
    }
    global_tree.increment_node(curr_node)
    global_tree.recalc_cum_time(curr_node)
    global_tree.nag()
    global_tree.after_ping()
    global_tree.scope.$apply()
  }
  global_tree.ping_timer = setTimeout(ping, global_tree.ping_secs * 1000)
}


// Create a notification every 10 minutes, unless the user ignored the last one.

BaseTree.prototype.nag = function() {
  if(this.scope.curr_interval) {
    var curr_secs = this.scope.curr_interval.ms / 1000
    if(curr_secs > this.nag_secs * (this.nag_count + 1)) {
      this.nag_count = Math.floor(curr_secs / this.nag_secs)
      if (Notification.permission === "granted")
        this.notification = new Notification(
          "It's been 10 minutes.", {icon:'static/clock.png'})
    }
    return
  }
  this.nag_count = 0
  this.notification && this.notification.close()
}

BaseTree.prototype.after_delete2 = function() {
  this.last_inc_time = null
}

// Increase node's last interval by ms since last ping.

BaseTree.prototype.increment_node = function(node) {
  var curr_time = Date.now()
  if(this.last_inc_time) {
    var delta = curr_time - this.last_inc_time
    if(this.scope.curr_interval) {
      this.scope.curr_interval.ms += delta
      this.nag()
    }
  }
  this.last_inc_time = curr_time
}

BaseTree.prototype.after_ping = function() {}

BaseTree.prototype.after_drop = function(node, old_parent) {
  this.recalc_cum_time(node)
  if(old_parent)
    this.recalc_cum_time(old_parent)
}

BaseTree.prototype.after_set_current_node = function(node) {
  node.just_selected = true
}









