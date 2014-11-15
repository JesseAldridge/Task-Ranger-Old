
// Angular directive to autgrow interval inputs.

module.directive('autogrow', ['$timeout', function($timeout) {
  return {
    link:function(scope, element, attrs) {
      $(element).autoGrowInput({comfortZone: 7})
      $timeout(function() { $(element).blur() })
    }
  }
}])

RemoteTree.prototype.after_request_data = function() {
  var tree = this

  // Setup datepicker.

  this.scope.curr_date = new Date()

  this.scope.open_datepicker = function(e) {
    e.preventDefault();
    e.stopPropagation();
    tree.scope.date_opened = true;
  }

  // Show intervals for the current day.

  this.scope.show_intervals_for_today = function(node) {
    tree.scope.curr_node = node
    var daily_time = date_to_daily_ms(new Date())
    tree.scope.curr_intervals = node.node_intervals[daily_time] || []
    tree.after_show_intervals(node)
  }

  // Save a key/value for the passed interval path.

  this.scope.save_interval = function(curr_node, date, index, key, value) {
    var path = 'node_intervals/{daily_time}/{index}/{key}'
    var daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    path = path.replace('{daily_time}', daily_time).replace('{index}', index)
               .replace('{key}', key)
    tree.scope.save_node_key(curr_node, path, value)
  }

  function date_to_daily_ms(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  }

  // Create a new interval for the current node.

  this.scope.new_interval = function(node) {
    var interval = {create_ms:new Date().getTime(), ms:0, text:'new interval'}
    var curr_day_ms = date_to_daily_ms(tree.scope.curr_date)
    if(!node.node_intervals[curr_day_ms]) {
      node.node_intervals[curr_day_ms] = []
    }
    var intervals = tree.scope.curr_intervals = node.node_intervals[curr_day_ms]
    intervals.push(interval)
    var path = 'node_intervals/' + curr_day_ms + '/' + (intervals.length - 1)
    tree.scope.save_node_key(node, path, interval)
  }
}

RemoteTree.prototype.after_show_intervals = function(){}






