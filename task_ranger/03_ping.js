
// Start pinging.

OuterController.prototype.after_bind_intervals = function() {
  var control = global_control = this

  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  this.init_notifications()

  var scope = this.scope

  this.scope.toggle_pause = function() {
    scope.paused ? scope.unpause() : scope.pause()
  }

  this.scope.pause = function() {
    scope.paused = true
  }

  this.scope.unpause = function() {
    control.last_inc_time = Date.now()
    scope.paused = false
  }

  this.scope.prev_day = function() {
    var yesterday = moment(scope.date_info.curr_daily_date).subtract(1, 'days').toDate()
    scope.date_info.curr_daily_date = new Date(control.date_to_daily_ms(yesterday))
  }

  this.scope.next_day = function() {
    var next_day = moment(scope.date_info.curr_daily_date).add(1, 'days').toDate()
    scope.date_info.curr_daily_date = new Date(control.date_to_daily_ms(next_day))
  }

  this.after_setup_ping()
}

OuterController.prototype.after_setup_ping = function() {}

// Request permission and init notification vars.

OuterController.prototype.init_notifications = function() {
  if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      Notification.permission = permission;
    })

  this.nag_count = 0
  this.notification = null

  this.nag_secs = 10 * 60
  // this.nag_secs = 5

  var control = this

  // Watch interval ms changes and save to firebase.

  this.scope.$watch(
    function(){ return control.scope.curr_interval ? control.scope.curr_interval.ms : null },
    function(newValue, oldValue) {
      var curr_interval = control.scope.curr_interval
      if(!curr_interval)
        return
      var daily_time = control.date_to_daily_ms(new Date()),
          intervals = control.scope.get_curr_intervals(),
          index = intervals.indexOf(curr_interval)
      if(index == -1)
        return
      control.scope.save_interval(curr_interval, true)
    }, true);

  this.after_init_notifications()
}

OuterController.prototype.after_init_notifications = function() {}

// Increment selected node interval, re-render timer, recalc cum time, loop.

// (not a method because it's called via setTimeout, so this == window)
function ping() {
  var curr_interval = global_control.scope.curr_interval
  if(curr_interval && !global_control.scope.paused) {
    global_control.increment_interval()
    global_control.after_ping()
    global_control.scope.$apply()
  }
  global_control.ping_timer = setTimeout(ping, global_control.ping_secs * 1000)
}

// Increase node's last interval by ms since last ping.

OuterController.prototype.increment_interval = function() {
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

// Create a notification every 10 minutes, unless the user ignored the last one.

OuterController.prototype.nag = function() {
  if(this.scope.curr_interval) {
    var curr_secs = this.scope.curr_interval.ms / 1000
    if(curr_secs % this.nag_secs < 1) {
      if (Notification.permission === "granted") {
        this.notification && this.notification.close()
        this.notification = new Notification(
          "It's been 10 minutes.", {icon:'static/clock.png'})
        this.notification.onclick = function(x) {
          window.focus()
          this.close()
        }
      }
      return
    }
  }
}

OuterController.prototype.after_delete = function() {
  this.last_inc_time = null
}

OuterController.prototype.after_ping = function() {}






