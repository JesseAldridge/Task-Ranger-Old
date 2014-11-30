
OuterController.prototype.after_setup_ping = function() {
  this.regen_every_ping = true
  this.after_setup_tags()
}

OuterController.prototype.after_setup_tags = function() {}

OuterController.prototype.after_have_data = function() {
  this.regen_top5()
  this.after_have_data2()
}

OuterController.prototype.after_have_data2 = function() {}

OuterController.prototype.after_ping = function() {

  // Regen time breakdown after every ping.

  this.regen_start = Date.now()
  if(this.regen_every_ping)
    this.regen_top5()
  if(Date.now() - this.regen_start > 200) {
    console.log('regen top5 too slow, stopping')
    this.regen_every_ping = false
  }
}

OuterController.prototype.after_regenTop5 = function(tags_data) {}

OuterController.prototype.regen_top5 = function() {
  var scope = this.scope

  // Iterate through every interval for every day.

  var tags = {}, stem_to_tags = {}, time_per_day = {}

  var days = scope.days
  for(var day_ms in days) {

    var tag = null

    var intervals = days[day_ms].intervals
    for(var i = 0; i < intervals.length; i++) {
      var interval = intervals[i]

      // Regex out the tag from the current interval if it has one.

      var match = /^#[a-zA-Z_]+| #[a-zA-Z_]+/.exec(interval.text)
      if(match) {
        tag = match[0].trim().slice(1)
        var stem_tag = stemmer(tag)
        if(!(stem_tag in stem_to_tags))
          stem_to_tags[stem_tag] = []
        stem_to_tags[stem_tag].push(tag)
        tag = stem_to_tags[stem_tag][0]
      }
      if(!(day_ms in time_per_day))
        time_per_day[day_ms] = 0
      time_per_day[day_ms] += interval.ms || 0
      if(!tag)
        continue
      if(!(tag in tags))
        tags[tag] = {}
      if(!(day_ms in tags[tag]))
        tags[tag][day_ms] = 0
      tags[tag][day_ms] += interval.ms
    }
  }

  // Calculate all time logged ever.

  var total_ms = 0
  for(var tag in tags)
    for(var date in tags[tag])
      total_ms += tags[tag][date]
  scope.total_ms = total_ms

  // Generate top X list.

  var top_list = []
  for(var tag in tags) {
    var tag_ms = 0
    var layer = tags[tag]
    for(var date in layer)
      tag_ms += layer[date]
    top_list.push({tag:tag, ms:tag_ms})
  }
  top_list.sort(function(a,b){ return b.ms - a.ms })

  // Stick < 5% tags under misc tag.

  tags['misc'] = {}
  to_delete = []
  for(var tag in tags) {
    var layer = tags[tag]
    var layer_total = 0
    for(var date in layer)
      layer_total += layer[date]
    if(layer_total < total_ms * .04) {
      for(var date in layer) {
        if(!tags['misc'][date])
          tags['misc'][date] = 0
        tags['misc'][date] += layer[date]
      }
      to_delete.push(tag)
    }
  }
  for(var i = 0; i < to_delete.length; i++)
    delete tags[to_delete[i]]
  delete tags['null']
  this.scope.top_list = top_list
  this.after_regenTop5(tags)
}






