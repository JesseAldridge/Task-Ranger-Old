
var top_level_ids = JSON.parse(localStorage.getItem('tree.top_level_ids'))
var models = []
function recurse(id, prefix) {
  if(prefix == undefined)  prefix = ''
  var model = get_model(id)
  models.push(model)
  var child_ids = model.get('child_ids')
  for(var i = 0; i < child_ids.length; i++)
    recurse(child_ids[i], prefix + '  ')
}
for(var i = 0; i < top_level_ids.length; i++)
  recurse(top_level_ids[i])
function repr(obj) {
    var s = JSON.stringify(obj, null, 2)
    return s
}
console.log("var models = " + repr(models))
console.log("var top_level_ids = " + repr(top_level_ids))
console.log('for(var i = 0; i < models.length; i++)  save_model(models[i])')
console.log("set('top_level_ids', top_level_ids)")

// COPY AND PASTE EVERYTHING BELOW THIS MESSAGE TO SOME FILE ON YOUR COMPUTER.
// PASTE THE GENERATED CODE BACK INTO THE CONSOLE WHEN YOU WANT TO LOAD.