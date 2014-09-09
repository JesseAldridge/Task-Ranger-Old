
RemoteTree.prototype.after_bind_time_edits = function() {
  this.regen_every_ping = true
  this.regen_top5(this.top_ids)
}

RemoteTree.prototype.after_ping = function() {
  this.regen_start = Date.now()
  if(this.regen_every_ping) {
    var tags_data = this.regen_top5(this.top_ids)
    this.after_regenTop5(tags_data)
  }
  if(Date.now() - this.regen_start > 100) {
    console.log('regen top5 too slow, stopping')
    this.regen_every_ping = false
  }
}

RemoteTree.prototype.after_regenTop5 = function(tags_data) {}

RemoteTree.prototype.regen_top5 = function(node_ids) {
  var tree = this

  function add_to_tags(task_node, extra_args) {

    // Divide string into segments:  "#tag foo... bar" -> ["#tag foo", "bar"]

    var tags = extra_args[0], stem_to_tags = extra_args[1]
    var parent_id = task_node.parent_id
    var tag = parent_id ? tree.local_nodes[parent_id].end_tag : null
    var seg_strings = task_node.text.trim().split('...')
    for(var iseg = 0; iseg < seg_strings.length; iseg++) {
      var s = seg_strings[iseg]
      if(!s.trim())
        continue

      // Pull out tag for current segment if it has one.

      var match = /^#[a-zA-Z_]+| #[a-zA-Z_]+/.exec(s)
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

      // Add the segment's time to the tags.  Store ending tag.

      if(!(tag in tags))
        tags[tag] = {}

      var interval_list = task_node.interval_list
      for(var i = 0; i < interval_list.length; i++) {
        var date1 = new Date(interval_list[i].start)
        var date2 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
        if(!(date2 in tags[tag]))
          tags[tag][date2] = 0
        tags[tag][date2] += interval_list[i].ms / seg_strings.length
      }
    }
    task_node.end_tag = tag
  }

  // Recurse tree to build tags data.  Calculate total time.

  var tags_data = {}, stem_to_tags = {}
  this.walk_tree(node_ids, add_to_tags, [tags_data, stem_to_tags])
  var total_ms = 0
  for(var tag in tags_data)
    for(var date in tags_data[tag])
      total_ms += tags_data[tag][date]

  // Generate top X list.

  var top_list = []
  for(var tag in tags_data) {
    var tag_time = 0
    var layer = tags_data[tag]
    for(var date in layer)
      tag_time += layer[date]
    top_list.push([tag, tag_time])
  }
  top_list.sort(function(a,b){ return b[1] - a[1] })

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

  // Set top list.  (top_list: [[tag, tag_time], ...])

  $('#top5').empty()
  for(var i = 0; i < Math.min(100, top_list.length); i++) {
    var time_str = build_time_str(top_list[i][1] / 1000)
    time_str = time_str.substring(0, 5)
    $('#top5').append(
      '<li>{0} {1} ({2}%)'.replace(
        '{0}', time_str).replace(
        '{1}', top_list[i][0]).replace(
        '{2}', Math.round(top_list[i][1] / total_ms * 100).toFixed(0)))
  }
  return tags_data
}



