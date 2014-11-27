
BaseTree.prototype.after_setup_ping = function() {
  this.regen_every_ping = true
}

BaseTree.prototype.after_ping = function() {
  this.regen_start = Date.now()
  if(this.regen_every_ping)
    var tags_data = this.regen_top5()
  if(Date.now() - this.regen_start > 200) {
    console.log('regen top5 too slow, stopping')
    this.regen_every_ping = false
  }
}

BaseTree.prototype.fixup_data = function() {
  var scope = this.scope
  for(var id in scope.nodes) {
    var node = scope.nodes[id]
    node.child_ids = node.child_ids || []
    node.node_intervals = node.node_intervals || {}
  }
}

BaseTree.prototype.write_test_data = function() {

  // Write some test data to firebase.

  var scope = this.scope

  scope.nodes = {
    "5005108148" : {
      "child_ids" : [ "9072973696" ],
      "is_collapsed" : false,
      "node_id" : "5005108148",
      "text" : "foo text 5005108148"
    },
    "5534964984" : {
      "node_id" : "5534964984",
      "parent_id" : "9072973696",
    },
    "9072973696" : {
      "child_ids" : [ "5534964984" ],
      "is_collapsed" : false,
      "node_id" : "9072973696",
      "parent_id" : "5005108148",
      "text" : "foo text 9072973696"
    }
  }
  scope.top_ids = [ "5005108148" ]
  this.after_write_test_data()
  this.fixup_data()
}

BaseTree.prototype.after_regenTop5 = function(tags_data) {}

BaseTree.prototype.regen_top5 = function() {
  var tree = this

  function add_to_tags(task_node, tree_stats) {

    // Collect tags for each interval

    var tags = tree_stats.tags_data, stem_to_tags = tree_stats.stem_to_tags,
        time_per_day = tree_stats.time_per_day
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
        if(!(date_key in time_per_day))
          time_per_day[date_key] = 0
        time_per_day[date_key] += interval.ms || 0
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

  var tags_data = {}
  var tree_stats = this.scope.tree_stats = {
    tags_data:tags_data, stem_to_tags:{}, time_per_day:{}
  }
  this.walk_tree(this.scope.top_ids, add_to_tags, tree_stats)

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
  this.after_regenTop5(tags_data)
  this.scope.$apply()
}

BaseTree.prototype.after_buttons_html = function() {
  $('body').prepend("<ol id='top5' style='float:left'></ol>")
  this.after_top5_html()
}

BaseTree.prototype.after_top5_html = function() {}














