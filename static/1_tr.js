
/*
Calculate rgb values.  Convert to rgb hex and set back.
Clear current and show pause indicator.
Add time tracking extras to tree: both node and html.
Bind:  set current to clicked, pause on change time, store old time.
Add pause button.
Integer seconds to hours:mins:seconds string.
$('<div>00:00:00</div>') -> 0
'00:00:00' -> [0, 0, 0]
*/


// Calculate rgb values.  Convert to rgb hex and set back.
function time_color(time_div) {
  var prop = 0
  if(window.great_secs)
    prop = el_secs(time_div) / window.great_secs * .25
  var pieces = [1, 1 - prop, 1 - prop]
  function make_rgb(scale) {
    var rgb = ''
    for(var i_piece = 0; i_piece < pieces.length; i_piece++) {
      var piece = Math.round(pieces[i_piece] * 255 * scale).toString(16)
      if(piece.length == 1)
        piece = '0' + piece
      rgb += piece
    }
    return rgb
  }
  set_gradient(time_div, make_rgb(1), make_rgb(.9))
}

// Clear current and show pause indicator.
function pause(e){
  window.paused = window.paused ? false : true
  if(window.paused) {
    window.last_inc_time = null
    $('.pause_indic').show()
    $('.pause > span').text('Unpause')
  }
  else {
    $('.pause_indic').hide()
    $('.pause > span').text('Pause')
  }
}


// Add time tracking extras to tree: both node and html.

window.ping_secs = 1

function new_node_json() {
  return {text:'New task', daily_times:{}, cum_secs:0}
}

function initial_json() {
  var new_json = new_node_json()
  new_json.text = '#First task...  #another task...'
  return new_json
}

window.after_buttons = function() { return "\
<div class='ui-icon ui-icon-clock modify-times'></div> \
<div class='date'></div> \
<div class='cum_time time'>00:00:00</div> \
<input class='task_time time' value='00:00:00'> \
<span class='score'></span> \
"
}


// Bind:  set current to clicked, pause on change time, store old time.
function bind_gui() {
  $('.text').live('click', function(evt) {
    if(!evt.metaKey && !evt.altKey) {
      $('.current').removeClass('current')
      from(this, 'node_el').addClass('current')
    }
    return false
  })
  $('.task_time').live('click', function() {
    pause()
  })
  $('.task_time').live('focus', function() {
    $(this).data('old_val', $(this).val())
  })
  $('.task_time').live('change', function() {

    // Turn daily_times obj into array of (date, secs) pairs.
    var node = from($(this), 'node')
    var daily_times = node.daily_times
    var dates_array = []
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                  'Sep', 'Oct', 'Nov', 'Dec']
    for(var key in daily_times) {
      var split = key.split(' ')
      var month = months.indexOf(split[0])
      var date = new Date(parseInt(split[2]), month, parseInt(split[1]))
      dates_array.push([date, daily_times[key]])
    }
    dates_array.sort(function(a, b){ return a[0] - b[0] })

    // Subtract time change from each date
    var diff = el_secs($(this)) - el_secs($(this).data('old_val'))
    if(diff < 0) { // ie. was 30 seconds, is now 20 seconds
      for(var i = dates_array.length - 1; i >= 0; i--) {
        var date_secs = dates_array[i][1]
        var old_date_secs = date_secs
        date_secs += diff
        diff += old_date_secs
        if(date_secs < 0)  date_secs = 0
        dates_array[i][1] = date_secs
        if(diff >= 0)  break
      }
    }
    else
      dates_array[dates_array.length - 1][1] += diff

    // Set daily_times to new value
    for(var i = 0; i < dates_array.length; i++)
      daily_times[date_str(dates_array[i][0])] = dates_array[i][1]
    node.set('daily_times', daily_times)
    recalc_cum_time(from($(this), 'node'))
  })

  // Modify a node's daily times.

  $('.modify-times').live('click', function() {
    var node = from($(this), 'node')

    $('#modify_times_popup > textarea').change(function() {
      node.set('daily_times', JSON.parse($(this).val()))
    })

    $('#modify_times_popup > textarea').val(
      JSON.stringify(node.daily_times))
    var dims = {width: 600, height: 500}
    $('#modify_times_popup > textarea').css(dims)
    $("#modify_times_popup").dialog(dims)
    return false
  })

  // Pause button.

  append_widget("<button class='pause'>Pause</button>")
  $('.pause').live('click', function() {
    pause()
  })
  $('button').button()
}

function break_up_secs(secs) {
  // Seconds to hours, mins, secs

  var mins = Math.floor(secs / 60)
  secs %= 60
  var hours = Math.floor(mins / 60)
  mins %= 60
  secs = Math.round(secs)
  return [hours, mins, secs]
}

function build_time_str(secs) {
  // Integer seconds to hours:mins:seconds string.

  var hms = break_up_secs(secs)
  var hours = hms[0], mins = hms[1], secs = hms[2]
  if(secs < 10)  secs = '0' + secs
  if(mins < 10)  mins = '0' + mins
  if(hours < 10)  hours = '0' + hours
  var t_str = '%h:%m:%s'.replace('%h', hours).replace('%m', mins)
  t_str = t_str.replace('%s', secs)
  return t_str
}


// $('<div>00:00:00</div>') -> 0
function el_secs(div) {
  var hms = parse_time_div(div)
  return hms[0] * 60 * 60 + hms[1] * 60 + hms[2]
}
function parse_time_div(div) {
  var s = div
  if(typeof(div) != 'string') {
    div = $(div)
    s = div.val()
  }
  if(s == '')  s = div.text()
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