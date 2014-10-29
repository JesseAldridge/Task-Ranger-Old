// requires:
// https://cdn.rawgit.com/sindresorhus/multiline/69c26c826ec8909b8a92da37ae7aba562362faff/browser.js
// https://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js
// https://rawgit.com/Eonasdan/bootstrap-datetimepicker/master/src/js/bootstrap-datetimepicker.js
// https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css
// https://rawgit.com/Eonasdan/bootstrap-datetimepicker/master/build/css/bootstrap-datetimepicker.min.css


// Initially show intervals for today.

RemoteTree.prototype.after_bind_text = function() {
  var tree = this
  $(document).on('focus', '.text', function() {
    var node_el = $(this).closest('.node')
    tree.show_intervals_for_day(tree.local_nodes[node_el.attr('node_id')], new Date())
  })

  $(document).on('keydown', '.interval_input', function() {
    clearTimeout(window.save_timer)
    function make_setter(interval_el) {
      return function() {
        var node = tree.local_nodes[$('.current_node').attr('node_id')]
        node.get_interval_obj(interval_el).text = interval_el.val()
        var text_path = node.build_interval_path(interval_el) + '/text'
        node.send(text_path, interval_el.val())
      }
    }
    window.save_timer = setTimeout(make_setter($(this)), 500)
  })

  $(document).on('click', '.headline', function(evt) {
    if(!evt.metaKey && !evt.altKey) {
      $('.current_node').removeClass('current_node')
      var node_el = $(this).closest('.node')
      node_el.addClass('current_node')
      var node = tree.local_nodes[node_el.attr('node_id')]
      node.new_interval()
    }
    return false
  })

  this.after_bind_focus()
}

LocalNode.prototype.get_interval_obj = function(interval_el) {
  var intervals = this.node_intervals[this.get_curr_day_ms()],
      interval_index = $('.interval_div').index(interval_el),
      interval = intervals[interval_index]
  return interval
}

LocalNode.prototype.build_interval_path = function(interval_el) {
  var curr_day_ms = this.get_curr_day_ms(),
      interval_index = $('.interval_div').index(interval_el)
  return 'node_intervals/' + curr_day_ms + '/' + interval_index
}

LocalNode.prototype.get_curr_day_ms = function() {
  var date = $('#datetimepicker').data("DateTimePicker").getDate().toDate()
  return this.date_to_daily_ms(date)
}

LocalNode.prototype.date_to_daily_ms = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

// Create a new interval -- in local node, in db, and render view.

LocalNode.prototype.new_interval = function(interval_obj) {
  if(!interval_obj)
    interval_obj = {create_ms:new Date().getTime(), ms:0, text:'new interval'}
  if(!this.node_intervals)
    this.node_intervals = {}
  var curr_day_ms = this.get_curr_day_ms()
  if(!this.node_intervals[curr_day_ms])
    this.node_intervals[curr_day_ms] = []
  var intervals = this.node_intervals[curr_day_ms]
  intervals.push(interval_obj)
  this.send('node_intervals/' + curr_day_ms + '/' + (intervals.length - 1), interval_obj)
  this.tree.add_interval_el(this, interval_obj.text)
}

RemoteTree.prototype.after_bind_focus = function() {}

// Display intervals for the passed day.

RemoteTree.prototype.show_intervals_for_day = function(node, date) {
  var daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  var intervals = node.node_intervals[daily_time] || []
  $('.interval_list').empty()
  for(var i = 0; i < intervals.length; i++)
    this.add_interval_el(node, intervals[i].text)
  this.after_show_intervals(node)
}

RemoteTree.prototype.after_show_intervals = function(node) {}

RemoteTree.prototype.add_interval_el = function(node, text) {
  var interval_el = $(multiline.stripIndent(function(){ /*
    <div class="interval_div">
      <input><div class="close">×</div>
    </div>
  */}))

  $('.interval_list').append(interval_el)
  var input = interval_el.find('input')
  input.autoGrowInput({comfortZone: 7})
  input.val(text)
  input.blur()
  this.after_add_interval_el(node, interval_el)
}

RemoteTree.prototype.after_add_interval_el = function(node, input) {}

// Div with date button and info row at the bottom.

RemoteTree.prototype.after_tree_html = function() {
  $('body').append(multiline(function(){/*
    <div class="interval_section">
      <div class='input-group date' id='datetimepicker'>
          <input type='text' class="form-control" data-provide="datepicker" data-date-format="MMMM D, YYYY" />
          <span class="input-group-addon">
            <span class="glyphicon glyphicon-calendar"></span>
          </span>
      </div>

      <div class="interval_list"></div>
      <hr>
      <div class="interval_info">
        <span class="text"></span>
        <input class="time_input"></input>
      </div>
    </div>
  */}))

	$('#datetimepicker').datetimepicker({
		pickTime: false
	});

  this.after_interval_html()
}

RemoteTree.prototype.after_interval_html = function() {}


















