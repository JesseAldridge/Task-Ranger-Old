
// '10:00:00' <-> 36000000  (hours, minutes, seconds string to milliseconds int)

module.directive('timeInput', ['$filter', function($filter) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(str) {
        if(!str.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/))
          return ngModelController.$modelValue
        var hms = str.split(':', 3)
        for(var i = 0; i < hms.length; i++) {
          if(hms[i][0] == '0')  hms[i] = hms[i].substr(1)
          hms[i] = parseInt(hms[i])
        }
        return (hms[0] * 60 * 60 + hms[1] * 60 + hms[2]) * 1000
      });

      ngModelController.$formatters.push(function(ms) {
        var str = $filter('secs_to_hms')(ms / 1000)
        return str
      });
    }
  }
}])

.directive('autoselect', ['$timeout', function($timeout) {
  return {
    link: function (scope, element) {
      var select_timeout = scope.control.select_timeout
      $timeout.cancel(scope.control.select_timeout)
      scope.control.select_timeout = $timeout(function() {
        element[0].select();
      }, 100)
    }
  }
}])


// Integer seconds to hours:mins:seconds string.

module.filter('secs_to_hms', function() {
  return function(all_secs) {
    all_secs = all_secs || 0
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
})

OuterController.prototype.after_construction = function() {
  var control = this,
      scope = control.scope

  // Create a new interval for the current day.

  this.scope.new_interval = function() {
    var scope = control.scope
    var curr_day_ms = control.date_to_daily_ms(scope.get_daily_date())
    var interval = {
      create_ms:new Date().getTime(), ms:0, text:'new interval #foo'}
    var day = scope.get_day(curr_day_ms)
    day.intervals.push(interval)
    scope.save_interval(interval)
    scope.set_curr_interval(interval)
    setTimeout(function() {
      $('.curr_interval .interval-text').focus()
    }, 100)
  }

  // Create a new interval on return.

  this.scope.interval_keydown = function(interval, e) {
    control.notification && control.notification.close()
    if(e.which == 13) // return
      scope.new_interval()
  }

  // Delete the passed interval from the day which contains it.

  this.scope.delete_interval = function(interval) {
    var daily_ms = control.date_to_daily_ms(new Date(interval.create_ms))
    var day = scope.get_day(daily_ms)
    var intervals = day.intervals
    var index = intervals.indexOf(interval)
    intervals.splice(index, 1)
    if(interval == control.scope.curr_interval)
      control.scope.curr_interval = null
    control.save_day(day)
    control.notification && control.notification.close()
    control.after_delete()
  }

  this.after_bind_intervals()
}

OuterController.prototype.save_day = function(day) {}

OuterController.prototype.after_delete = function() {}
OuterController.prototype.after_bind_intervals = function() {}






