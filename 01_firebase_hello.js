
// https://cdn.firebase.com/v0/firebase.js
// https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js

function connect_to_firebase() {

  // Hook firebase top-level.  Setup click event handlers.

  $('body').append('<div class="nodes"></div>')
  var root_ref = new Firebase('https://taskranger.firebaseio.com/test_tree')
  root_ref.once('value', function(snap) {
    var nodes = snap.val().nodes
    for(var key in nodes)
      $('.nodes').append("<div>Node {0}</div>".replace('{0}', nodes[key].node_id))
  })

  $('.new_node').click(function() {
    root_ref.child('nodes').push({node_id:Math.random()})
  })
}