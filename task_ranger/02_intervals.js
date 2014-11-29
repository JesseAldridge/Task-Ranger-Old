
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
    var curr_day_ms = scope.date_to_daily_ms(scope.get_daily_date())
    var interval = {
      create_ms:new Date().getTime(), ms:0, text:'new interval #foo'}
    var day = scope.get_day(curr_day_ms)
    day.intervals.push(interval)
    control.save_interval(interval)
    scope.set_curr_interval(interval)
    setTimeout(function() {
      $('.curr_interval .interval-text').focus()
    }, 100)
  }

  // Create a new interval on tab.

  this.scope.interval_keydown = function(interval, e) {
    control.notification && control.notification.close()
    if(e.which == 13) // return
      scope.new_interval()
  }

  this.after_bind_intervals()
}

OuterController.prototype.save_interval = function(path, value) {}

OuterController.prototype.after_bind_intervals = function() {}






