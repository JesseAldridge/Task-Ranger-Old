
// Apply new time to node on edit timer.

RemoteTree.prototype.after_bind_ping = function() {
  var tree = this

  $(document).on('focus', '.task_time', function() {
    $(this).data('old_val', $(this).val())
    tree.pause()
  })

  $(document).on('blur', '.task_time', function() {
    tree.unpause()
  })

  $(document).on('keyup', '.task_time', function() {
    console.log('keyup')
    if(!$(this).val().match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/))
      return
    var remaining_diff = el_ms($(this)) - el_ms($(this).data('old_val')),
        node = tree.from($(this), 'node')
    $(this).data('old_val', $(this).val())
    if(remaining_diff < 0) { // eg. was 30 seconds, is now 20 seconds
      for(var i = node.interval_list.length - 1; i >= 0; i--) {
        var interval_ms = node.interval_list[i].ms,
            old_interval_ms = interval_ms    

        interval_ms += remaining_diff
        remaining_diff += old_interval_ms
        if(interval_ms < 0)  interval_ms = 0
        node.interval_list[i].ms = interval_ms

        if(remaining_diff >= 0)  break
      }
    }
    else {
      if(node.interval_list.length == 0)
        node.new_interval()
      node.interval_list[node.interval_list.length - 1].ms += remaining_diff
    }
    node.send('interval_list', node.interval_list)
    tree.recalc_cum_time(tree.from($(this), 'node'))
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
  if(s == '')  s = el.text()
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





