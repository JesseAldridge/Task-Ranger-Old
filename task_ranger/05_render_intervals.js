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
    console.log('text focus')
    var node_el = $(this).closest('.node')
    tree.show_intervals_for_day(tree.local_nodes[node_el.attr('node_id')], new Date())
  })
  this.after_bind_focus()
}

RemoteTree.prototype.after_bind_focus = function() {}

// Display intervals for the passed day.

RemoteTree.prototype.show_intervals_for_day = function(node, date) {
  var daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  var intervals = node.node_intervals[daily_time] || []
  $('.interval_list').empty()
  for(var i = 0; i < intervals.length; i++) {
    var input = $('<input class="interval"></input>')
    input.val(intervals[i].text)
    $('.interval_list').append(input)
  }
}

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


















