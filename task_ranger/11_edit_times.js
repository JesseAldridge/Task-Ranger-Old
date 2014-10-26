
// Apply new time to node on edit timer.

RemoteTree.prototype.after_init_notifications = function() {
  var tree = this

  $(document).on('focus', '.interval_section .time_input', function() {
    console.log('pausing')
    tree.pause()
  })

  $(document).on('blur', '.interval_section .time_input', function() {
    tree.unpause()
  })

  $(document).on('keyup', '.interval_section .time_input', function(e) {
    if(e.keyCode == 13) // return
      $('.current_interval').focus()
    if(!$(this).val().match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/))
      return

    var new_ms = el_ms(this)
    var selected_node = tree.local_nodes[$('.current_node').attr('node_id')]
    selected_node.modify_curr_interval_ms(function(){ return new_ms })
  })

  $('body').append("<div class='pause_indic' style='display:none'>PAUSED</div>")
  this.after_bind_time_edits()
}

RemoteTree.prototype.after_bind_time_edits = function() {}

// $('<div>00:00:00</div>') -> 0

function el_ms(el) {
  var hms = parse_time_div(el)
  return (hms[0] * 60 * 60 + hms[1] * 60 + hms[2]) * 1000
}

function parse_time_div(el) {
  var s = el
  if(typeof(el) != 'string') {
    el = $(el)
    s = el.val()
  }
  if(s === '')  s = el.text()
  return parse_time_str(s)
}

// '00:00:00' -> [0, 0, 0]

function parse_time_str(s) {
  var split = s.split(':', 3)
  for(var i = 0; i < split.length; i++) {
    if(split[i][0] == '0')  split[i] = split[i].substr(1)
    split[i] = parseInt(split[i])
  }
  return split
}

// Clear current and show pause indicator.

RemoteTree.prototype.pause = function(e) {
  this.last_inc_time = null
  this.paused = true
  $('.pause_indic').show()
}

RemoteTree.prototype.unpause = function(e) {
  this.paused = false
  $('.pause_indic').hide()
}

// Pull user's score out of node's text.

RemoteTree.prototype.task_score = function(node_) {
  var text = node_.text.trim()
  var match = text.match(/\(([0-9\.]+)\)?$/)
  if(match) {
    value = parseFloat(match[1])
    return (value / (node_.cum_ms / 1000)) * 60 * 60 * 10
  }
}

RemoteTree.prototype.after_decorate_node = function(node) {
  var score = this.task_score(node)
  if(score) {
    var node_el = $('.node[node_id="()"]'.replace('()', node.node_id))
    node_el.find('.value_per_hour:first').text(score.toFixed(3))
  }
}




















