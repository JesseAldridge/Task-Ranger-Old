
OuterController.prototype.after_setup_tags = function() {

  // Save a key/value for the passed interval path.

  var control = this
  var scope = this.scope
  this.scope.save_interval = function(interval) {
    var day = scope.get_day(scope.curr_day_key)
    var index = day.intervals.indexOf(interval)
    var path = 'days/' + scope.curr_day_key + '/intervals/' + index
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

  console.log('downloading data:', this.firebase_url() + this.get_user_root());
  this.root_ref = new Firebase(this.firebase_url() + this.get_user_root());
  var control = this;
  this.root_ref.once('value', function(snap) {
    var scope = control.scope;
    console.log('downloaded data:', snap.val());
    scope.days = snap.val() ? (snap.val().days || {}) : {};
    control.after_have_data();
    scope.$apply();
  }, function(err) { console.log('error downloading data:', err); });
}

OuterController.prototype.save_path = function(path, val, debounce) {

  // Debounced save of a key/val pair for the passed node.  Reload if stale data.

  var control = this;
  set_func = function() {
    if(control.last_set_time && new Date() - control.last_set_time > 2 * 60 * 60 * 1000) {
      document.location.reload(true);
      return;
    }
    control.root_ref.child(path).set(angular.copy(val), function() {
      control.last_set_time = new Date();
    });
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

// Save entire day (e.g. after delete).

OuterController.prototype.save_day = function(day) {
  var scope = this.scope
  this.save_path('days/' + scope.curr_day_key, day)
}


// Prepend login buttons to body.  Hide content.

OuterController.prototype.launch = function() {
  $('.main_content').hide()

  var control = this

  var ref = new Firebase('https://taskranger.firebaseio.com/')
  var auth = control.auth = new FirebaseSimpleLogin(ref, function(err,user) {
    if(err)
      alert(err)
    else if(user) {
      $('.login-layer').hide()
      $('.main_content').show()
      OuterController.prototype.get_user_root = function(){
        return 'user_trees/' + user.uid + '/'
      }
      control.user_data = user.thirdPartyUserData
      control.user_data.last_login = new Date().toString()
      control.download_data()
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
  this.scope.logout = function() {
    console.log('logging out')
    auth.logout()
  }
}

OuterController.prototype.after_have_data2 = function() {
  this.root_ref.child('user_info').set(this.user_data)
}
