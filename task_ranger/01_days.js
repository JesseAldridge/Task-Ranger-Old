
var module = angular.module('myApp', ['ui.bootstrap'])
.controller('MyController', function ($scope) {

  // Datepicker functions.

  $scope.open_datepicker = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.date_info.is_open = true
  }

  $scope.get_daily_date = function() {
    return $scope.date_info.curr_daily_date
  }

  // Day interval accessors.

  $scope.set_curr_interval = function(interval) {
    $scope.curr_interval = interval || null
    $scope.notification && $scope.notification.close()
  }

  $scope.get_curr_intervals = function() {
    var daily_ms = $scope.get_daily_date().getTime()
    return $scope.get_day(daily_ms).intervals
  }

  $scope.get_day = function(daily_ms) {
    if(!$scope.days[daily_ms])
      $scope.days[daily_ms] = {intervals:[]}
    return $scope.days[daily_ms]
  }

  $scope.date_changed = function() {
    $scope.curr_interval = null
  }

  $scope.date_to_daily_ms = function(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  }

  // Write some test days.

  $scope.write_test_data = function() {
    $scope.days = this.get_test_json()
  }

  $scope.get_test_json = function() {
    var daily_ms = this.date_to_daily_ms(new Date())
    var days = {}
    days[daily_ms] = {
      intervals:[{
        ms: 1000 * 10,
        text: '#test interval 1',
        create_ms: daily_ms
      }, {
        ms: 1000 * 20,
        text: 'test #interval 2',
        create_ms: daily_ms
      }]
    }
    return days
  }

  $scope.date_info = {
    curr_daily_date: new Date($scope.date_to_daily_ms(new Date())),
    is_open: false
  }

  outer_controller = new OuterController($scope)
  outer_controller.after_construction()
  outer_controller.launch()
})

function OuterController(scope) {
  this.scope = scope
}

OuterController.prototype.after_construction = function() {}

OuterController.prototype.launch = function() {
  this.scope.write_test_data()
}





