// requires:
// https://cdn.firebase.com/js/simple-login/1.6.1/firebase-simple-login.js

// Prepend login buttons to body.  Hide content.

RemoteTree.prototype.init = function() {
  $('.main_content').hide()

  var tree = this

  var ref = new Firebase(this.firebase_url())
  var auth = new FirebaseSimpleLogin(ref, function(err,user) {
    if(err)
      alert(err)
    else if(user) {
      console.log('user:', user)
      $('.login-layer').hide()
      $('.main_content').show()
      RemoteTree.prototype.get_user_root = function(){ return 'user_trees/' + user.uid + '/' }
      tree.download_data()
      tree.root_ref.child('user_info').set(user.thirdPartyUserData)
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
