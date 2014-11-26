
BaseTree.prototype.after_construction = function() {
  var tree = this

  // Create a new node at the passed index of the passed parent_id.

  this.scope.new_node = function(parent_id, index) {
    var node_id = '' + Math.round(Math.random() * Math.pow(10, 10))
    var new_node = {
      node_id:node_id, child_ids:[], parent_id:parent_id || null, node_intervals:{},
      date_created:Date.now()}
    tree.scope.nodes[node_id] = new_node
    tree.save_node(new_node)
    tree.add_id_to_parent(node_id, parent_id, index)
    tree.scope.set_current_node(new_node)
  }

  // Show intervals for the current day.

  this.scope.set_current_node = function(node, e) {
    tree.scope.curr_node = node
    var daily_time = tree.date_to_daily_ms(new Date())
    var intervals = node.node_intervals[daily_time] || []
    tree.scope.set_curr_interval(intervals[intervals.length - 1])
  }

  this.scope.set_curr_interval = function(interval) {
    tree.scope.curr_interval = interval || null
  }

  this.scope.get_curr_intervals = function() {
    var curr_node = tree.scope.curr_node
    return curr_node ? curr_node.node_intervals[tree.scope.curr_daily_date.getTime()] : []
  }

  this.scope.date_changed = function() {
    tree.scope.curr_interval = null
  }

  this.scope.curr_daily_date = new Date(this.date_to_daily_ms(new Date()))

  this.after_bind_show_intervals()
}

BaseTree.prototype.after_bind_show_intervals = function() {}

BaseTree.prototype.date_to_daily_ms = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

BaseTree.prototype.add_id_to_parent = function(node_id, parent_id, index) {

  // Add a child id to parent node's child_id list or to top level ids.

  var scope = this.scope,
      ids_list = parent_id ? scope.nodes[parent_id].child_ids : scope.top_ids
  if(index === undefined)
    ids_list.push(node_id)
  else
    ids_list.splice(index, 0, node_id)
  this.save_id_list(parent_id, ids_list)
}

BaseTree.prototype.save_node = function(node) {}
BaseTree.prototype.save_id_list = function(parent_id, ids_list) {}

BaseTree.prototype.decorate_test_json = function(json) {

  // Generate some fake intervals.

  var nodes = json.nodes

  var daily_ms = this.date_to_daily_ms(new Date())
  for(var id in nodes) {
    var node = nodes[id]
    node.node_intervals = {}
    node.node_intervals[daily_ms] = [{
      create_ms:daily_ms,
      daily_time:daily_ms,
      ms:1000 * 10,
      text:'#test interval ' + id
    }]
  }
  return json
}

