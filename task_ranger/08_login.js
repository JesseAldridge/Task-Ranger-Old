// requires:
// https://cdn.firebase.com/js/simple-login/1.6.1/firebase-simple-login.js

// Prepend login buttons to body.  Hide content.

RemoteTree.prototype.init = function() {
  $('.main_content').hide()

  var tree = this

  var ref = new Firebase('https://taskranger.firebaseio.com/')
  var auth = new FirebaseSimpleLogin(ref, function(err,user) {
    if(err)
      alert(err)
    else if(user) {
      $('.login-layer').hide()
      $('.main_content').show()
      RemoteTree.prototype.get_user_root = function(){ return 'user_trees/' + user.uid + '/' }
      tree.download_data()
    }
    else {
      $('.login-layer').show()
      $('.logout-layer').hide()
    }
  })

  $('#login-github').click(function() {
    auth.login('github', { rememberMe: true }) })
  $('#login-twitter').click(function() {
    auth.login('twitter', { rememberMe: true }) })
  $('#logout').click(function() {
    auth.logout() });
}
