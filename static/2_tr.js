
/*
  Init
    Called from html.  Init tree stuff.  Set time background colors.
      Start ping timer:
        If not paused, increment current node time for today.
        Recalc cum time and render.
      Recurse through all nodes, bottom up, calculating cum_times.

  Recalc cum time
    Convert task_time + cum_time to seconds and replace.  Recurse upward.
*/

function after_load2() {

  // Called from html.  Init tree stuff. 

  window.paused = false
  init_tree()
  setup_dnd()
  bind_delete()
  window.ping_timer = setTimeout(ping, 1000 * ping_secs)
  bind_gui() // 1_tr.js
  bind_graph_events()
  recalc_all_cum_times()

  // Set time background colors.

  var time_els = $('.time')
  window.great_secs = 0
  for(var i = 0; i < time_els.length; i++)
    great_secs = Math.max(el_secs(time_els[i]), great_secs)
  great_secs *= 1.1
  for(var i = 0; i < time_els.length; i++) {
    var time_el = $(time_els[i])
    time_color(time_el)  // 1_tr.js
  }

  regen_graphs()
  strs = ['Sign Up', 'Login']
  for(var i = 0; i < strs.length; i++)
    login_box(strs[i])
}

var task_strs = []
function bind_graph_events() {
  var prev_index = null;
  $("#time_per_tln").bind("plothover", function (event, pos, item) {
    if (item) {
      if (prev_index != item.dataIndex) {
        prev_index = item.dataIndex;
        $("#tooltip").remove();
        var x = item.pageX;
        if(x + 200 > $(window).width())
          x -= 200
        showTooltip(x, item.pageY, task_strs[item.dataIndex]);
      }
    }
    else {
      $("#tooltip").remove();
      prev_index = null;            
    }
  });
}

function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + 5,
        left: x + 5,
        border: '1px solid #fdd',
        padding: '2px',
        'background-color': '#fee',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);
}

function ping() {

  // Prepare to increment time for current node.

  var current = $('.current')
  if(current.length > 0 && !window.paused) {
    var task_node = local_nodes[current.attr('node_id')]
    var daily_times = task_node.daily_times
    if(daily_times == undefined)
      daily_times = task_node.daily_times = {}
    var date_str_ = date_str(new Date())
    if(daily_times[date_str_] == undefined)  
      daily_times[date_str_] = 0

    // Batch nodes to sync.  Send all syncs every 10 seconds.

    var current_time = Math.round(new Date().getTime() / 1000)
    if(window.last_inc_time)
      daily_times[date_str_] += current_time - window.last_inc_time
    window.last_inc_time = current_time
    nodes_to_sync[task_node.node_id] = true

    // Recalc cum time and render.

    recalc_cum_time(task_node)
    var time_els = from(current, 'time')
    for(var i = 0; i < time_els.length; i++)
      window.great_secs = Math.max(el_secs(time_els[i]), window.great_secs)
    decorate_ids(top_ids)
  }
  window.ping_timer = setTimeout(ping, ping_secs * 1000)
}

function each_leaf(func) {

  // Recurse through the tree, calling func on leaves.

  walk_tree(top_ids, function(node) {
    var child_ids = node.child_ids
    if(!child_ids || child_ids.length == 0)
      func(node)
  })
}


// For each leaf, compute the node's individual time...

function recalc_all_cum_times() {
  each_leaf(recalc_cum_time)
}

function recalc_cum_time(task_node) {
  var secs = calc_indiv_time(task_node)

  // Include descendant's time.  Display new time and recurse upward.

  var child_ids = task_node.child_ids
  for(var i = 0; i < child_ids.length; i++)
    secs += local_nodes[child_ids[i]].cum_secs

  var task_el = select_node_el(task_node)
  var cum_time_div = from(task_el, 'cum_time')
  set_time_div(cum_time_div, secs)
  task_node.cum_secs = secs
  var parent_node = local_nodes[task_node.parent_id]
  if(parent_node)  recalc_cum_time(parent_node)
}

function get_completed_values() {
  function add_to_completed(task_node, extra_args) {
    // If the node is a completed task (under eg. october 2012), add to list.

    var months = [
      'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
      'september', 'october', 'november', 'december']

    var completed = extra_args[0]
    var parent_node = local_nodes[task_node.parent_id]
    if(!parent_node)
      return
    var text = parent_node.text.toLowerCase().trim()
    if(text.match('^[a-z]+ [0-9]{4}$') && 
       months.indexOf(text.split(' ')[0].toLowerCase()) != -1) {
      completed.push(task_node)
    }
  }

  // Get date:value for each top level task.

  var completed = []
  walk_tree(top_ids, add_to_completed, [completed])

  completed.sort(function(a,b){ 
    return get_avg_date(a) - get_avg_date(b) 
  })
  var avg_secs = 0;
  for(var i = 0; i < completed.length; i++)
    avg_secs += completed[i].cum_secs
  avg_secs /= completed.length

  task_strs = []
  var proper_data = []
  for(var i = 0; i < completed.length; i++) {
    var avg_date = get_avg_date(completed[i])
    var value = task_score(completed[i])
    proper_data.push(
      [avg_date, 
       value ? value : 60 * 60 * 1. / completed[i].cum_secs])
    task_strs.push(completed[i].text)
  }
  return [avg_secs, proper_data, task_strs]
}

function regen_completed(avg_secs, proper_data, task_strs, graph_num) {
  // For each completed list, print average task time...

  $('#avg_comp_time').text(
    'Avg task time:  ' + build_time_str(avg_secs))

  // Plot the completed tasks

  var plot = $.plot($("#time_per_tln"), 
    [{label:"time per task", data:proper_data}],
    {
        series: {
            bars: {show:true, barWidth:10, align:'center'},
            points: {show:true}
        },
        xaxis: {
            mode: "time",
            timeformat: "%m/%d",
        },
        grid: { hoverable: true },
    })
  draw_regression_line(plot, proper_data)
}

function draw_regression_line(plot, proper_data) {
  // Unpack regression line.  Calculate offsets on plot.  Draw the line.

  if(proper_data.length == 0)
    return
  var xs = [], ys = []
  for(var i = 0; i < proper_data.length; i++) {
      xs.push(proper_data[i][0].valueOf())
      ys.push(proper_data[i][1])
  }
  var a = linear_regression(xs, ys)
  var m = a[0], b = a[1]
  var first_date = proper_data[0][0]
  var last_date = proper_data[proper_data.length - 1][0]
  var off0 = plot.pointOffset({ x: first_date, y: m * first_date + b})
  var off1 = plot.pointOffset({ x: last_date, y: m * last_date + b })
  var ctx = plot.getCanvas().getContext("2d");
  ctx.beginPath();
  ctx.moveTo(off0.left, off0.top);
  ctx.lineTo(off1.left, off1.top);
  ctx.stroke();
}

function linear_regression(xs, ys) {
    // Get the slope and y-intercept of the best-fit line for the points.  

    var sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0, count = 0, x = 0, y = 0;
    if (xs.length != ys.length)
        throw new Error(
          'The parameters xs and ys need to have same size!');
    if (xs.length === 0)
        return [];
    for (var v = 0; v < xs.length; v++) {
        x = xs[v];
        y = ys[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;
    return [m, b]
}

function regen_stack(node_ids, graph_num) {
  function add_to_stack(task_node, extra_args) {

    // Divide string into segments:  "#tag foo... bar" -> ["#tag foo", "bar"]

    var stack = extra_args[0], stem_to_tags = extra_args[1]
    var parent_id = task_node.parent_id
    var tag = parent_id ? local_nodes[parent_id].end_tag : null
    var seg_strings = task_node.text.trim().split('...')
    for(var i = 0; i < seg_strings.length; i++) {
      var s = seg_strings[i]
      if(!s.trim())
        continue

      // Pull out tag for current segment if it has one.

      var parent_id = task_node.parent_id

      var match = /^#[a-zA-Z_]+| #[a-zA-Z_]+/.exec(s)
      if(match) {
        tag = match[0].trim().slice(1)
        var stem_tag = stemmer(tag)
        if(!(stem_tag in stem_to_tags))
          stem_to_tags[stem_tag] = []
        stem_to_tags[stem_tag].push(tag)
        tag = stem_to_tags[stem_tag][0]
      }

      // Add the segment's time to the stack.  Store ending tag.

      if(!(tag in stack))
        stack[tag] = {}

      var daily_times = task_node.daily_times
      for(var date_str in daily_times) {
        var date = new Date(date_str)
        var layer = stack[tag]
        if(!(date in layer))
          layer[date] = 0
        layer[date] += daily_times[date_str] / seg_strings.length
      }
    }
    task_node.end_tag = tag
  }

  // Recurse tree to build stack data.  Calculate total time.

  var stack_data = {}, stem_to_tags = {}
  walk_tree(node_ids, add_to_stack, [stack_data, stem_to_tags])
  var total_secs = 0
  for(var tag in stack_data)
    for(var date in stack_data[tag])
      total_secs += stack_data[tag][date]

  // Generate top X list.

  var top_list = []
  for(var tag in stack_data) {
    var tag_time = 0
    var layer = stack_data[tag]
    for(var date in layer)
      tag_time += layer[date]
    top_list.push([tag, tag_time])
  }
  top_list.sort(function(a,b){ return b[1] - a[1] })

  // Stick < 5% tags under misc tag.

  stack_data['misc'] = {}
  to_delete = []
  for(var tag in stack_data) {
    var layer = stack_data[tag]
    var layer_total = 0
    for(var date in layer)
      layer_total += layer[date]
    if(layer_total < total_secs * .04) {
      for(var date in layer) {
        if(!stack_data['misc'][date])
          stack_data['misc'][date] = 0
        stack_data['misc'][date] += layer[date]
      }
      to_delete.push(tag)
    }
  }
  for(var i = 0; i < to_delete.length; i++)
    delete stack_data[to_delete[i]]
  delete stack_data['null']

  // Turn stack data into a format flot likes.

  var proper_data = []
  for(var tag in stack_data) {
    var layer = stack_data[tag]
    var proper_layer = []
    for(var date_key in layer) {
      var date = new Date(date_key)

      // Don't interpolate; set unset dates to 0.  Drop bottom 10% of tags.

      proper_layer.push([date, layer[date] / 60. / 60.])
      for(var i = -1; i <= 1; i += 2) {
        surrounding_day = new Date(date)
        surrounding_day.setDate(date.getDate() + i)
        if(!(surrounding_day in layer))
          proper_layer.push([surrounding_day, 0])
      }
    }
    proper_layer.sort(function(a,b){ return a[0] - b[0] })
    proper_data.push({label:tag, data:proper_layer})
  }

  // Date to string.    

  for(var ilayer = 0; ilayer < proper_data.length; ilayer++) {
      var points = proper_data[ilayer].data
      for(var ipoint = 0; ipoint < points.length; ipoint++)
          points[ipoint][0] = new Date(points[ipoint][0])
  }

  // Set top list.  (top_list: [[tag, tag_time], ...])

  $('#top5').empty()
  for(var i = 0; i < Math.min(100, top_list.length); i++)
    $('#top5').append(
      '<li>{0}: {1} ({2}%)'.replace(
        '{0}', build_time_str(top_list[i][1])).replace(
        '{1}', top_list[i][0]).replace(
        '{2}', Math.round(top_list[i][1] / total_secs * 100.).toFixed(0)))

  // Plot the stack chart.

  $.plot($("#stack"), proper_data, {
      series: {
          stack: true,
          lines: { show: true, fill: true, steps: true },
          bars: { show:true, barWidth:1, align: 'center' }
      },
      xaxis: {
          mode: "time",
          timeformat: "%m/%d",
      },
  });
}

function calc_indiv_time(node_node) {

  // Return the accumulated seconds spent each day on this node.

  var secs = 0
  var daily_times = node_node.daily_times
  for(var key in daily_times)
    secs += daily_times[key]
  return secs
}

function decorate_node_el(task_node) {
  // Turn daily times into seconds.  Cleanup undefined values.

  var daily_times = task_node.daily_times
  var secs_ = 0
  for(var key in daily_times)
    secs_ += daily_times[key]

  // Turn the seconds into a rendered date on the node.

  var task_el = select_node_el(task_node)
  set_time_div(from(task_el, 'task_time'), secs_)
  set_time_div(from(task_el, 'cum_time'), task_node.cum_secs)
  var avg_date = get_avg_date(task_node)
  task_node.avg_date = avg_date
  from(task_el, 'date').text(
    '' + (avg_date.getMonth() + 1) + '/' + avg_date.getDate() + '/' +
    avg_date.getFullYear())
  var score = task_score(task_node)
  if(score)
    from(task_el, 'score').text(score.toFixed(3))
}


function task_score(node_) {
  // Pull user's score out of node's text.

  var text = node_.text.trim()
  var match = text.match(/\(([0-9\.]+)\)?$/)
  if(match) {
    var value = parseFloat(match[1])
    return (value / node_.cum_secs) * 60 * 60 * 10
  }
}


function get_avg_date(task_node) {
  // Take the weighted average of the length of times the node was touched.

  var top = 0, bottom = 0
  var daily_times = task_node.daily_times
  for(var key in daily_times) {
    top += new Date(key).valueOf() * daily_times[key]
    bottom += daily_times[key]
  }
  return new Date(top / bottom)
}

function set_time_div(time_div, secs) {
  // Set hours:mins:secs for passed div.

  var t_str = build_time_str(secs)
  if($(time_div).is('input'))  time_div.val(t_str)
  else  time_div.text(t_str)
  time_color(time_div)
  return t_str
}

// Regen stack and completed graphs on text change.

function on_save() {
  regen_graphs()
}

function regen_graphs() {
  for(var i = 0; i < top_ids.length; i++) {
    var node = local_nodes[top_ids[i]]
    if(node.is_expanded)
      continue
    child_ids = node.child_ids
    regen_stack(child_ids, i)

    var args = get_completed_values(child_ids)
    var avg_secs = args[0], proper_data = args[1], task_strs = args[2]
    regen_completed(avg_secs, proper_data, task_strs, i)
  }
}

function find_and_replace_tag(needle_tag, replace_tag) {
  if(needle_tag[0] == '#')
    needle_tag = needle_tag.slice(1)
  console.log('needle_tag:', needle_tag)
  needle_tag = stem(needle_tag)
  // walk_tree
  //   for each tag in node
  //     if stem(tag) == needle_tag
  //       replace tag with replace_tag
}



function login_box(label_str) {

  // Login boxes:  A form with a table.

  var action_str = label_str.toLowerCase().replace(/ /g, '_')
  $('.login_boxes').append("\
    <form class='login_box' id='%id'><p class='head'>%head <table> \
    <tr><td>Username:</td><td><input></td></tr> \
    <tr><td>Password:</td><td><input type='password'></td></tr> \
    <tr><td></td><td><input type='submit'></td></table>\
    </form>".replace('%id', action_str).replace('%head', label_str))

  // Bind ajax action:  send username and password.

  $('#' + action_str).submit(function(e) {
    var inputs = $(this).find('input'), values = []
    for(var i = 0; i < inputs.length; i++)
      values.push($(inputs[i]).val())
    $.post('/' + action_str, {'username':values[0], 'password':values[1]},
      function(data){
        var top_level_ids = data.top_level_ids
        if(top_level_ids.length == 0)
          write_json_to_node(initial_json())
        else
          decorate_ids(top_ids)
      })
    return false
  })
}
