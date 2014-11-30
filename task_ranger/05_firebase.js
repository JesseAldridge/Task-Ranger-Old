
OuterController.prototype.after_setup_tags = function() {

  // Save a key/value for the passed interval path.

  var control = this
  var scope = this.scope
  this.scope.save_interval = function(interval) {
    var daily_ms = control.date_to_daily_ms(new Date(interval.create_ms))
    var day = scope.get_day(daily_ms)
    var index = scope.days[daily_ms].intervals.indexOf(interval)
    var path = 'days/' + daily_ms + '/intervals/' + index
    control.save_path(path, interval, true)
  }
}

// Write a json object to the root

OuterController.prototype.write_root_json = function(root_json) {
  var control = this
  new Firebase(this.firebase_url() + 'test_tree').set(
    root_json, function() {
      control.download_data()
    })
}

OuterController.prototype.firebase_url = function() {
  return 'https://taskranger.firebaseio.com/'
}

OuterController.prototype.get_user_root = function() {
  return 'test_tree'
}

OuterController.prototype.download_data = function() {

  // Download data from firebase.

  this.root_ref = new Firebase(this.firebase_url() + this.get_user_root())
  var control = this
  this.root_ref.once('value', function(snap) {
    var scope = control.scope
    scope.days = snap.val() ? (snap.val().days || {}) : {}
    control.after_have_data()
    scope.$apply()
  })
}

OuterController.prototype.save_path = function(path, val, debounce) {

  // Debounced save of a key/val pair for the passed node.

  set_func = function() {
    control.root_ref.child(path).set(angular.copy(val))
  }
  if(debounce) {
    if(!control.save_timers)
      control.save_timers = {}
    clearTimeout(control.save_timers[path])
    control.save_timers[path] = setTimeout(set_func, 500)
  }
  else
    set_func()
}


// Prepend login buttons to body.  Hide content.

OuterController.prototype.launch = function() {
  $('.main_content').hide()

  var tree = this

  var ref = new Firebase('https://taskranger.firebaseio.com/')
  var auth = new FirebaseSimpleLogin(ref, function(err,user) {
    if(err)
      alert(err)
    else if(user) {
      console.log('user:', user)
      $('.login-layer').hide()
      $('.main_content').show()
      OuterController.prototype.get_user_root = function(){
        return 'user_trees/' + user.uid + '/'
      }
      tree.user_data = user.thirdPartyUserData
      tree.download_data()
    }
    else {
      $('.login-layer').show()
      $('.logout-layer').hide()
    }
  })

  $('#login-github').click(function() {
    auth.login('github', { rememberMe: true })
  })
  $('#login-twitter').click(function() {
    auth.login('twitter', { rememberMe: true })
  })
  $('#logout').click(function() {
    auth.logout()
  })
}

OuterController.prototype.after_have_data2 = function() {
  this.root_ref.child('user_info').set(this.user_data)
}