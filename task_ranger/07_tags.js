
RemoteTree.prototype.after_setup_ping = function() {
  this.regen_every_ping = true
}

RemoteTree.prototype.after_ping = function() {
  this.regen_start = Date.now()
  if(this.regen_every_ping) {
    var tags_data = this.regen_top5()
    this.after_regenTop5(tags_data)
  }
  if(Date.now() - this.regen_start > 200) {
    console.log('regen top5 too slow, stopping')
    this.regen_every_ping = false
  }
  this.after_bind_top_list()
}

RemoteTree.prototype.after_bind_top_list = function() {}

RemoteTree.prototype.after_regenTop5 = function(tags_data) {}

RemoteTree.prototype.regen_top5 = function() {
  var tree = this

  function add_to_tags(task_node, extra_args) {

    // Collect tags for each interval

    var tags = extra_args[0], stem_to_tags = extra_args[1]
    var tag = null

    var node_intervals = task_node.node_intervals
    for(var date_key in node_intervals) {
      var intervals = node_intervals[date_key],
          tag = null
      for(var i = 0; i < intervals.length; i++) {

        // Pull out tag for current segment if it has one.

        var interval = intervals[i]
        var match = /^#[a-zA-Z_]+| #[a-zA-Z_]+/.exec(interval.text)
        if(match) {
          tag = match[0].trim().slice(1)
          var stem_tag = stemmer(tag)
          if(!(stem_tag in stem_to_tags))
            stem_to_tags[stem_tag] = []
          stem_to_tags[stem_tag].push(tag)
          tag = stem_to_tags[stem_tag][0]
        }
        if(!tag)
          continue
        if(!(tag in tags))
          tags[tag] = {}
        if(!(date_key in tags[tag]))
          tags[tag][date_key] = 0
        tags[tag][date_key] += interval.ms
      }
    }

    task_node.end_tag = tag
  }

  // Recurse tree to build tags data.  Calculate total time.

  var tags_data = {}, stem_to_tags = {}
  this.walk_tree(this.scope.top_ids, add_to_tags, [tags_data, stem_to_tags])

  var total_ms = 0
  for(var tag in tags_data)
    for(var date in tags_data[tag])
      total_ms += tags_data[tag][date]
  this.scope.total_ms = total_ms

  // Generate top X list.

  var top_list = []
  for(var tag in tags_data) {
    var tag_ms = 0
    var layer = tags_data[tag]
    for(var date in layer)
      tag_ms += layer[date]
    top_list.push({tag:tag, ms:tag_ms})
  }
  top_list.sort(function(a,b){ return b.ms - a.ms })

  // Stick < 5% tags under misc tag.

  tags_data['misc'] = {}
  to_delete = []
  for(var tag in tags_data) {
    var layer = tags_data[tag]
    var layer_total = 0
    for(var date in layer)
      layer_total += layer[date]
    if(layer_total < total_ms * .04) {
      for(var date in layer) {
        if(!tags_data['misc'][date])
          tags_data['misc'][date] = 0
        tags_data['misc'][date] += layer[date]
      }
      to_delete.push(tag)
    }
  }
  for(var i = 0; i < to_delete.length; i++)
    delete tags_data[to_delete[i]]
  delete tags_data['null']
  this.scope.top_list = top_list
}

RemoteTree.prototype.after_buttons_html = function() {
  $('body').prepend("<ol id='top5' style='float:left'></ol>")
  this.after_top5_html()
}

RemoteTree.prototype.after_top5_html = function() {}














