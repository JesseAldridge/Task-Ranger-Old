
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

  this.scope.get_daily_string = function() {
    var date = date_key_to_date(scope.curr_day_key);
    date = moment(date);
    var day_of_week_int = date.day();
    var day_strs = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var day_of_week_str = day_strs[day_of_week_int];
    return '{}, {}'.replace(
      '{}', day_of_week_str).replace(
      '{}', date.format('MMMM Do YYYY'))
  }

  function date_key_to_date(date_key) {
    var split = date_key.split(' ')
    return new Date(
      parseInt(split[0]), parseInt(split[1]), parseInt(split[2]))
  }

  function adjust_day(amount) {
    var date = date_key_to_date(scope.curr_day_key)
    var next_day = moment(date).add(amount, 'days').toDate()
    scope.curr_day_key = control.date_to_daily_key(next_day)
  }

  this.scope.prev_day = function() {
    adjust_day(-1)
  }

  this.scope.next_day = function() {
    adjust_day(1)
  }

  this.after_setup_ping()
}

OuterController.prototype.after_setup_ping = function() {}

// Request permission and init notification vars.

OuterController.prototype.init_notifications = function() {
  if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      Notification.permission = permission;
    });

  this.nag_count = 0;
  this.notification = null;
  this.last_notification_time = new Date();

  this.nag_secs = 20 * 60;

  var control = this,
      scope = control.scope

  // Watch interval ms changes and save to firebase.

  this.scope.$watch(
    function(){ return scope.curr_interval ? control.scope.curr_interval.ms : null },
    function(newValue, oldValue) {
      var curr_interval = control.scope.curr_interval
      if(!curr_interval)
        return
      var intervals = scope.get_curr_intervals()
      var index = intervals.indexOf(curr_interval)
      if(index == -1) {
        return
      }
      scope.save_interval(curr_interval, true)
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

// Create a notification every 10 minutes.

OuterController.prototype.nag = function() {
  var curr_interval = this.scope.curr_interval
  if(curr_interval && curr_interval.text[0] != '*') {
    var curr_secs = curr_interval.ms / 1000
    var mod = curr_secs % this.nag_secs
    if(mod < 2 && curr_secs > 2 && (new Date() - this.last_notification_time) / 1000 > 2) {
      this.last_notification_time = new Date()
      if (Notification.permission === "granted") {
        this.notification && this.notification.close()
        this.notification = new Notification(
          "It's been " + (this.nag_secs / 60) + " minutes.", {icon:'static/clock.png'})
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
