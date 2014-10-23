// requires:
// https://cdn.rawgit.com/sindresorhus/multiline/69c26c826ec8909b8a92da37ae7aba562362faff/browser.js
// https://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js
// https://rawgit.com/Eonasdan/bootstrap-datetimepicker/master/src/js/bootstrap-datetimepicker.js
// https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css
// https://rawgit.com/Eonasdan/bootstrap-datetimepicker/master/build/css/bootstrap-datetimepicker.min.css


// Initially show chunks for today.

RemoteTree.prototype.after_bind_text = function() {
  this.after_initial_show_chunks()
  var tree = this
  $('.text').focus(function() {
    var node_el = $(this).closest('.node')
    tree.show_chunks_for_day(tree.local_nodes[node_el.attr('node_id')], new Date())
  })
}

RemoteTree.prototype.after_initial_show_chunks = function() {}

// Display chunks for the passed day.

RemoteTree.prototype.show_chunks_for_day = function(node, date) {
  var daily_time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  var chunk_ids = node.node_chunks[daily_time] || []
  $('.chunk_list').empty()
  for(var i = 0; i < chunk_ids.length; i++) {
    var input = $('<input class="chunk"></input>')
    input.val(this.local_chunks[chunk_ids[i]].text)
    $('.chunk_list').append(input)
  }
}

// Div with date button and info row at the bottom.

RemoteTree.prototype.after_tree_html = function() {
  $('body').append(multiline(function(){/*
    <div class="chunk_section">
      <div class='input-group date' id='datetimepicker'>
          <input type='text' class="form-control" data-provide="datepicker" data-date-format="MMMM D, YYYY" />
          <span class="input-group-addon">
            <span class="glyphicon glyphicon-calendar"></span>
          </span>
      </div>

      <div class="chunk_list"></div>
      <hr>
      <div class="chunk_info">
        <span class="text"></span>
        <input class="time_input"></input>
      </div>
    </div>
  */}))

	$('#datetimepicker').datetimepicker({
		pickTime: false
	});
}


















