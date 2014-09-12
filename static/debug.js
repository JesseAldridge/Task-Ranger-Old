
var debug = {log_all_vars: function() {
  console.log('--- all vars ---')
  var ignore_list = ["top", "window", "location", "external", "chrome", "document", "ignore_keys", "key", "speechSynthesis", "localStorage", "sessionStorage", "applicationCache", "webkitStorageInfo", "indexedDB", "webkitIndexedDB", "crypto", "CSS", "performance", "console", "devicePixelRatio", "styleMedia", "parent", "opener", "frames", "self", "defaultstatus", "defaultStatus", "status", "name", "length", "closed", "pageYOffset", "pageXOffset", "scrollY", "scrollX", "screenTop", "screenLeft", "screenY", "screenX", "innerWidth", "innerHeight", "outerWidth", "outerHeight", "offscreenBuffering", "frameElement", "clientInformation", "navigator", "toolbar", "statusbar", "scrollbars", "personalbar", "menubar", "locationbar", "history", "screen", 'Firebase', '$', 'jQuery', 'ignore_list']

  var ignore_keys = {}
  for(var i = 0; i < ignore_list.length; i++)
    ignore_keys[ignore_list[i]] = true

  var filtered_vars = {}
  for(var key in window)
    if(window.hasOwnProperty(key) && !ignore_keys[key] && !(window[key] instanceof Function))
      // console.log(' ', key, window[key])
      filtered_vars[key] = window[key]
  console.log('filtered_vars:', filtered_vars)
  console.log('--- end all vars ---')
}}
