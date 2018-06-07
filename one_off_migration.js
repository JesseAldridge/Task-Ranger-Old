var firebase = require("firebase"),
    admin = require("firebase-admin");

function init_firebase(on_login, on_sigin_error) {
  // Login to firebase as admin.

  firebase.initializeApp({
    apiKey: "AIzaSyBlWlz8M-YI3MmHtBNh9j6pe8GpKff6WCQ",
    authDomain: "taskranger.firebaseapp.com",
    databaseURL: "https://taskranger.firebaseio.com",
    projectId: "firebase-taskranger",
    storageBucket: "firebase-taskranger.appspot.com",
    messagingSenderId: "358940489899"
  });

  admin.initializeApp({
    credential:
      admin.credential.cert("firebase-taskranger-firebase-adminsdk-il1ag-5bbc16fcee.json"),
    databaseURL: "https://taskranger.firebaseio.com"
  });

  var uid = "admin";

  console.log('logging in as admin...');
  admin.auth().createCustomToken(uid)
    .then(function(customToken) {
      console.log('got customToken...');
      firebase.auth().signInWithCustomToken(customToken).catch(function(error) {
        console.log('signin error:', error);
        on_sigin_error(error);
      });
    })
    .catch(function(error) {
      console.log("Error creating custom token:", error);
    });

  var first_auth = true;
  firebase.auth().onAuthStateChanged(function(user) {
    console.log('auth changed, user:', user ? user.uid : null);
    var root_ref = firebase.database().ref();
    if (user && first_auth) {
      first_auth = false;
      if(on_login)
        on_login(admin, root_ref);
    }
  });

  return admin;
}

init_firebase(
  function(admin, root_ref) {
    // var days_ref = root_ref.child('user_trees/github:191903/days');
    // days_ref.once('value', function(snap) {
    //   console.log('downloaded data:', JSON.stringify(snap.val()));
    // }, function(err) { console.log('error downloading data:', err); });

    root_ref.child('user_trees/github:191903/days/2015 6 17/intervals/30/text').set(
      '#debug _@deliveries is nil', function(err) {
        console.log('error:', arguments);
      }
    );
  },

  function(error) {
    console.log('error:', error);
  }
);
