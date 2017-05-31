
OuterController.prototype.after_setup_ping = function() {
  var control = this,
      scope = control.scope

  this.regen_every_ping = true
  this.stem_to_tags = {}
  scope.tag_colors = {}

  scope.interval_tag_color = function(interval) {
    var tag = scope.extract_tag_from_interval(interval)
    var color = scope.tag_colors[tag]
    return color || null
  }

  scope.extract_tag_from_interval = function(interval) {
    // Regex match the #tag in the interval.  Stem to normalize similar.

    var stem_to_tags = control.stem_to_tags
    var match = /^#[a-zA-Z_]+| #[a-zA-Z_]+/.exec(interval.text)
    if(match) {
      tag = match[0].trim().slice(1)
      var stem_tag = stemmer(tag)
      if(!(stem_tag in stem_to_tags))
        stem_to_tags[stem_tag] = []
      stem_to_tags[stem_tag].push(tag)
      return stem_to_tags[stem_tag][0]
    }
    else {
      var day = scope.get_day(scope.curr_day_key)
      // day with youtrack tickets; but no intervals logged
      if(!day.intervals)
        day.intervals = [];
      if(!day.intervals.indexOf) {
        // (day is loaded as an object if there are missing keys
        //  probably due to sync issues from running on two computers at the same time)
        intervals = []
        for(var key in day.intervals) {
          index = parseInt(key)
          for(var i = intervals.length; i < index; i++) {
            intervals.push({
              create_ms: intervals[i - 1].create_ms + 1,
              ms: 0,
              text: "#lost data"
            })
          }
          intervals[index] = day.intervals[key]
        }
        day.intervals = intervals
      }
      var index = day.intervals.indexOf(interval)
      if(index > 0) {
        return scope.extract_tag_from_interval(day.intervals[index - 1])
      }
      return null
    }
  }

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
  /*if(Date.now() - this.regen_start > 200) {
    this.regen_every_ping = false
  }*/
}

OuterController.prototype.after_regenTop5 = function(tags_data) {}

OuterController.prototype.regen_top5 = function() {
  var scope = this.scope

  // Iterate through every interval for every day.

  var tags = {}, time_per_day = scope.time_per_day = {}
  var stem_to_tags = this.stem_to_tags = {}

  var days = scope.days

  if(this.logged_days == null) {
    this.logged_days = true
  }

  var day_keys = Object.keys(days)
  // day_keys = day_keys.slice(day_keys.length - 5, day_keys.length)
  day_keys.forEach(function(day_key) {
    var tag = null, prev_tag = null;

    var intervals = days[day_key].intervals || [];
    for(var i = 0; i < intervals.length; i++) {
      var interval = intervals[i];

      // Regex out the tag from the current interval if it has one.

      if(interval.text[0] == '*')
        continue;

      prev_tag = tag
      tag = scope.extract_tag_from_interval(interval)
      if(!tag)
        tag = prev_tag
      if(!(day_key in time_per_day))
        time_per_day[day_key] = 0
      time_per_day[day_key] += interval.ms || 0
      if(!tag)
        continue
      if(!(tag in tags))
        tags[tag] = {}
      if(!(day_key in tags[tag]))
        tags[tag][day_key] = 0
      tags[tag][day_key] += interval.ms
    }
  })

  // Calculate all time logged ever.

  var total_ms = 0
  for(var tag in tags)
    for(var date_key in tags[tag])
      total_ms += tags[tag][date_key]
  scope.total_ms = total_ms

  // Generate top X list.

  var top_list = []
  for(var tag in tags) {
    var tag_ms = 0
    var layer = tags[tag]
    for(var date_key in layer)
      tag_ms += layer[date_key]
    top_list.push({tag:tag, ms:tag_ms})
  }
  top_list.sort(function(a,b){ return b.ms - a.ms })

  // Stick < 5% tags under misc tag.

  tags['misc'] = {}
  to_delete = []
  for(var tag in tags) {
    var layer = tags[tag]
    var layer_total = 0
    for(var date_key in layer)
      layer_total += layer[date_key]
    if(layer_total < total_ms * .04) {
      for(var date_key in layer) {
        if(!tags['misc'][date_key])
          tags['misc'][date_key] = 0
        tags['misc'][date_key] += layer[date_key]
      }
      to_delete.push(tag)
    }
  }

  // Assign a unique color to each tag.

  scope.tag_colors = {}
  var hue = 0
  for(var tag in tags)
    scope.tag_colors[tag] = color_seq.next_color(hue++)

  for(var i = 0; i < to_delete.length; i++)
    delete tags[to_delete[i]]
  delete tags['null']
  this.scope.top_list = top_list
  this.after_regenTop5(tags)
  this.scope.$apply()
}
