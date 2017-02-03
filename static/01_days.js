
var module = angular.module('myApp', ['ui.bootstrap'])
.controller('MyController', function ($scope) {

  // Datepicker functions.

  $scope.open_datepicker = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.date_info.is_open = true
  }

  // Day interval accessors.

  $scope.set_curr_interval = function(interval) {
    $scope.curr_interval = interval || null
    control.notification && control.notification.close()
  }

  $scope.get_curr_intervals = function() {
    return $scope.get_day($scope.curr_day_key).intervals
  }

  $scope.get_day = function(date_key) {
    if(!$scope.days[date_key])
      $scope.days[date_key] = {intervals:[]}
    return $scope.days[date_key]
  }

  $scope.date_changed = function() {
    $scope.curr_interval = null
  }

  $scope.save_interval = function(interval) {}

  control = new OuterController($scope)

  var date = new Date()
  $scope.curr_day_key = '' + date.getFullYear() + ' ' + date.getMonth() + ' ' + date.getDate()

  control.after_construction()
  control.launch()
})

function OuterController(scope) {
  this.scope = scope
  scope.control = this
  scope.days = {}
}

// Write some test days.

OuterController.prototype.write_test_data = function() {
  this.scope.days = this.get_test_json().days
  this.after_have_data()
}

OuterController.prototype.after_have_data = function() {}

OuterController.prototype.get_test_json = function() {
  var daily_key = this.date_to_daily_key(new Date())
  var days = {}
  days[daily_key] = {
    intervals:[{
      ms: 1000 * 10,
      text: '#test interval 1',
      create_ms: new Date().getTime()
    }, {
      ms: 1000 * 20,
      text: 'test #interval 2',
      create_ms: new Date().getTime()
    }]
  }
  return {days:days}
}

OuterController.prototype.date_to_daily_key = function(date) {
  return '' + date.getFullYear() + ' ' + date.getMonth() + ' ' + date.getDate()
}

OuterController.prototype.after_construction = function() {}

OuterController.prototype.launch = function() {
  this.write_test_data()
}





