
// requires
// https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.6.0/moment.min.js

// Init node's timer vars.

LocalNode.prototype.after_init = function() {
  if(!this.date_created) {
    this.set('date_created', Date.now())
    this.set('cum_ms', 0)
  }
  if(!this.interval_list)
    this.set('interval_list', [])
}

// Start pinging.

RemoteTree.prototype.after_bind_drag_drop = function() {
  this.ping_secs = 1
  this.ping_timer = setTimeout(ping, 1000 * this.ping_secs)
  var tree = this
  global_tree = tree

  $(document).on('click', '.headline', function(evt) {
    if(!evt.metaKey && !evt.altKey) {
      $('.current').removeClass('current')
      var node_el = tree.from(this, 'node_el')
      node_el.addClass('current')
      var node = tree.local_nodes[node_el.attr('node_id')]
      node.new_interval()
    }
    return false
  })

  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  }
  else if (Notification.permission !== 'granted')
    Notification.requestPermission(function (permission) {
      console.log('permission:', permission)
      Notification.permission = permission;
    })

  this.last_input_date = new Date()
  console.log('set last_input_date, this:', this)
  this.nagged = false
  this.notification = null

  $(document).on('keydown', '.text', function(e) {
    tree.last_input_date = new Date()
  })

  this.after_bind_ping()
}

RemoteTree.prototype.after_bind_ping = function() {}

RemoteTree.prototype.after_set_current = function(node) {
  node.just_selected = true
}

RemoteTree.prototype.after_undelete = function(root_node) {
  var parent_node = this.local_nodes[root_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}

// Increment MetaNode for selected, re-render timer, recalc cum time, loop.

// (not a method because it's called via setTimeout, so this == window)
function ping() {
  var current = $('.current')
  if(current.length > 0 && !global_tree.paused) {
    var selected_node = global_tree.local_nodes[current.attr('node_id')]
    if(selected_node.just_selected) {
      selected_node.just_selected = false
      selected_node.new_interval()
    }
    selected_node.increment()
    global_tree.recalc_cum_time(selected_node)
    // var minutes = selected_node.calc_indiv_ms() / 1000 / 60,
    //     minutes_per_ellipse = minutes / selected_node.text.split('...').length
    if(new Date() - global_tree.last_input_date > 10 * 60 * 1000) {
    // if(new Date() - global_tree.last_input_date > 5 * 1000) { 
      if(!global_tree.nagged) {
        global_tree.nagged = true
        if (!("Notification" in window))
          return
        else if (Notification.permission === "granted")
          global_tree.notification = new Notification("It's been 10 minutes.", {icon:'static/clock.png'})
      }
    }
    else {
      if(global_tree.nagged)
        global_tree.nagged = false
      if(global_tree.notification) {
        global_tree.notification.close()
        global_tree.notification = null
      }
    }
    global_tree.decorate_ids(global_tree.top_ids)
  }
  global_tree.ping_timer = setTimeout(ping, global_tree.ping_secs * 1000)
  global_tree.after_ping()
}


RemoteTree.prototype.after_ping = function() {}

RemoteTree.prototype.after_drop = function(node, old_parent) {
  this.recalc_cum_time(node)
  if(old_parent)
    this.recalc_cum_time(old_parent)
}

// Include descendant's time.  Display new time and recurse upward.


RemoteTree.prototype.recalc_cum_time = function(task_node) {
  var cum_ms = task_node.calc_indiv_ms()
  var child_ids = task_node.child_ids
  for(var i = 0; i < child_ids.length; i++)
    cum_ms += this.local_nodes[child_ids[i]].cum_ms

  var task_el = select_node_el(task_node)
  var cum_time_dom = this.from(task_el, 'cum_time')
  set_time_el(cum_time_dom, cum_ms)
  task_node.set('cum_ms', cum_ms)
  var parent_node = this.local_nodes[task_node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
}

RemoteTree.prototype.after_delete = function(node) {
  var parent_node = this.local_nodes[node.parent_id]
  if(parent_node)
    this.recalc_cum_time(parent_node)
  this.last_inc_time = null
}

// Set hours:mins:secs for passed element.

function set_time_el(time_dom, ms) {
  if(!ms)
    ms = 0
  var secs = ms / 1000
  var time_str = build_time_str(secs)
  if($(time_dom).is('input'))
    time_dom.val(time_str)
  else
    time_dom.text(time_str)
  return time_str
}

// Integer seconds to hours:mins:seconds string.

function build_time_str(all_secs) {
  var hms = break_up_secs(all_secs)
  var hours = hms[0], mins = hms[1], secs = hms[2]
  if(secs < 10)  secs = '0' + secs
  if(mins < 10)  mins = '0' + mins
  if(hours < 10)  hours = '0' + hours
  var t_str = '%h:%m:%s'.replace('%h', hours).replace('%m', mins)
  t_str = t_str.replace('%s', secs)
  return t_str
}

// Seconds to hours, mins, secs

function break_up_secs(secs) {
  var mins = Math.floor(secs / 60)
  secs %= 60
  var hours = Math.floor(mins / 60)
  mins %= 60
  secs = Math.round(secs)
  return [hours, mins, secs]
}

LocalNode.prototype.new_interval = function() {
  var interval_obj = {start:new Date().getTime(), ms:0}
  if(!this.interval_list)
    this.interval_list = []
  this.interval_list.push(interval_obj)
  this.send('interval_list/' + (this.interval_list.length - 1), interval_obj)
}

// Increase node's last interval by ms since last ping.

LocalNode.prototype.increment = function() {
  var curr_time = Date.now()
  if(this.tree.last_inc_time) {
    var interval_list = this.interval_list,
        delta = curr_time - this.tree.last_inc_time
    interval_list[interval_list.length - 1].ms += delta
    this.send('interval_list/' + (interval_list.length - 1) + '/ms',
      interval_list[interval_list.length - 1].ms)
  }
  this.tree.last_inc_time = curr_time
}

LocalNode.prototype.calc_indiv_ms = function() {
  var ms = 0
  for(var i = 0; i < this.interval_list.length; i++) {
    if(!this.interval_list[i]) {
      console.log('undefined interval, this:', this.node_id)
      continue
    }
    ms += this.interval_list[i].ms
  }
  return ms
}

window.html_after_buttons = function() { 
  return " \
  <span title='Date created' class='date_created'></span> \
  <div title='Cumulative time' class='cum_time time'>00:00:00</div> \
  <input title='Individual time' class='task_time time' value='00:00:00'> \
  <span title='Value per hour' class='value_per_hour'></span> \
  "
}

// Turn the seconds into a rendered date on the node.

RemoteTree.prototype.decorate_node_el = function(task_node) {
  var task_el = select_node_el(task_node)
  set_time_el(this.from(task_el, 'task_time'), task_node.calc_indiv_ms())
  set_time_el(this.from(task_el, 'cum_time'), task_node.cum_ms)
  task_el.find('.date_created:first').text(moment(task_node.date_created).format('MM/DD'))

  var score = this.task_score(task_node)
  if(score)
    task_el.find('.value_per_hour:first').text(score.toFixed(3))
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


function run_test() {
  $('body').append([
    '<div class="buttons"></div>', '<div style="clear:both"></div>', 
    '<div><ol id="node_container"></ol></div>'])
  var tree = new RemoteTree()
}






