
// requires:
// static/jquery.flot.js
// static/jquery.flot.stack.js

RemoteTree.prototype.after_regenTop5 = function(tags_data) {

  // Turn stack data into a format flot likes.

  var proper_data = []
  for(var tag in tags_data) {
    var layer = tags_data[tag]
    var proper_layer = []
    for(var date_key in layer) {
      var date = new Date(date_key)

      // Don't interpolate; set unset dates to 0.  Drop bottom 10% of tags.

      proper_layer.push([date, layer[date] / 1000 / 60. / 60.]) // (ms to hours)
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

function run_test() {
  $('body').append([
    "<ol id='top5' style='float:left'></ol>",
    '<div id="stack" class="stack" style="width:600px;height:300px;float:left"></div>',
    '<div style="clear:both"></div>',
    '<div class="buttons"></div>',
    '<div><ol id="tree_section"></ol></div>'])
  var tree = new RemoteTree()
}