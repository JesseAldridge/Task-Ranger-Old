// requires:
// https://cdn.firebase.com/js/simple-login/1.6.1/firebase-simple-login.js

// Prepend login buttons to body.  Hide content.

RemoteTree.prototype.after_top5_html = function() {
  var main_div = $('<div class="main_content"></div>')
  $('body').children().appendTo(main_div)
  $('body').append(main_div)
  $('.main_content').hide()

  $('body').prepend(multiline(function() {/*
    <button class="login-layer login" id="login-github" style="display: none">
      Log in with GitHub
    </button>
    <button class="login-layer login" id="login-twitter" style="display: none">
      Log in with Twitter
    </button>
    <button class="logout-layer login" style="display: none; float:right" id="logout">
      Log out
    </button>
  */}))
}


// Login to firebase via a social button before pulling tree for user.

RemoteTree.prototype.handle_login = function() {
  var ref = new Firebase('https://taskranger.firebaseio.com/')
  var tree = this
  var auth = new FirebaseSimpleLogin(ref, function(err,user) {
    if(err)
      alert(err)
    else if(user) {
      console.log('user:', user)
      $('.main_content').show()
      $('.login-layer').hide()
      // $('.logout-layer').show()
      RemoteTree.prototype.get_user_root = function(){ return 'user_trees/' + user.uid + '/' }
      tree.download_data()
    }
    else {
      $('.login-layer').show()
      $('.logout-layer').hide()
    }
  })

  $('#login-github').click(function() { auth.login('github', { rememberMe: true }) })
  $('#login-twitter').click(function() { auth.login('twitter', { rememberMe: true }) })
  $('#logout').click(function() { auth.logout() });
}

function run_test() {
  var tree = new RemoteTree()
  tree.handle_login()
}





