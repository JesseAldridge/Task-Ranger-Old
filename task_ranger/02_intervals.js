
// Angular directive to autgrow interval inputs.

module.directive('autogrow', ['$timeout', function($timeout) {
  return {
    link:function(scope, element, attrs) {
      $(element).autoGrowInput({comfortZone: 7})
      $timeout(function() { $(element).blur() })
    }
  }
}])

.directive('autoselect', ['$timeout', function($timeout) {
  return {
    link: function (scope, element) {
      var select_timeout = scope.tree.select_timeout
      $timeout.cancel(scope.tree.select_timeout)
      scope.tree.select_timeout = $timeout(function() {
        element[0].select();
      }, 100)
    }
  };
}])


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

BaseTree.prototype.after_bind_show_intervals = function() {
  var tree = this

  // Setup datepicker.

  this.scope.open_datepicker = function(e) {
    e.preventDefault();
    e.stopPropagation();
    tree.scope.date_opened = true;
  }

  // Show intervals for the current day.

  this.scope.set_current_node = function(node, e) {
    console.log('set_current_node')
    tree.scope.curr_node = node
    var daily_time = tree.date_to_daily_ms(new Date())
    var intervals = node.node_intervals[daily_time] || []
    tree.scope.set_curr_interval(intervals[intervals.length - 1])
  }

  // Save a key/value for the passed interval path.

  this.scope.save_interval = function(node, date, index, key, value) {
    var path = 'node_intervals/{daily_time}/{index}/{key}'
    var daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    path = path.replace('{daily_time}', daily_time).replace('{index}', index)
               .replace('{key}', key)
    tree.scope.save_node_key(node, path, value)
  }

  // Create a new interval for the current node.

  this.scope.new_interval = function(node) {
    var curr_day_ms = tree.date_to_daily_ms(tree.scope.curr_daily_date)
    var interval = {
      create_ms:new Date().getTime(), ms:0, text:'new interval #foo'}
    if(!node.node_intervals[curr_day_ms])
      node.node_intervals[curr_day_ms] = []
    var intervals = node.node_intervals[curr_day_ms]
    intervals.push(interval)
    var path = 'node_intervals/' + curr_day_ms + '/' + (intervals.length - 1)
    tree.scope.save_node_key(node, path, interval)
    tree.scope.set_curr_interval(interval)
    var daily_time = tree.date_to_daily_ms(new Date())
  }

  this.scope.interval_keydown = function(interval, e) {
    var scope = tree.scope,
        curr_day_ms = tree.date_to_daily_ms(scope.curr_daily_date),
        intervals = scope.curr_node.node_intervals[curr_day_ms]

    if(e.which == 9 && intervals[intervals.length - 1] == interval) // tab
      scope.new_interval(scope.curr_node)
  }

  this.scope.save_node_key = function(node, path, interval) {}

  this.after_bind_intervals()
}

BaseTree.prototype.after_bind_intervals = function(){}






