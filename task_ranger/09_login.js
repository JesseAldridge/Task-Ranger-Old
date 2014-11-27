
// Prepend login buttons to body.  Hide content.

BaseTree.prototype.ready_to_download = function() {
  if(this.is_local)
    return

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
      BaseTree.prototype.get_user_root = function(){ return 'user_trees/' + user.uid + '/' }
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

BaseTree.prototype.after_download_data = function() {
  this.root_ref.child('user_info').set(this.user_data)
}


