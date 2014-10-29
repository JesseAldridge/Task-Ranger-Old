
if (!window.console)  window.console = {log: function(obj){}}

// DOM functions
$.extend(
  $.fn.disableTextSelect = function() {
    return this.each(function(){
      if($.browser.mozilla)  $(this).css('MozUserSelect','none')
      else if($.browser.msie)
        $(this).bind('selectstart',function(){return false;});
      else $(this).mousedown(function(){return false;});
    })
  },

  // Autogrow magic.  Don't ask me, I didn't write it.
  $.fn.autoGrowInput = function(o) {
    o = $.extend({
        maxWidth: 2000,
        minWidth: 1,
        comfortZone: 70
    }, o);

    this.filter('input:text').each(function(){

        // Autogrow parms.
        var minWidth = o.minWidth || $(this).width(),
            val = '',
            input = $(this),
            testSubject = $('<tester/>').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: input.css('fontSize'),
                fontFamily: input.css('fontFamily'),
                fontWeight: input.css('fontWeight'),
                letterSpacing: input.css('letterSpacing'),
                whiteSpace: 'nowrap'
            }),

            // More autogrow magic
            check = function() {

                if (val === (val = input.val())) {return;}
                'spaces to |s; hack cuz function ignoring spaces(?)'
                val = val.replace(/ /g, '|')
                // Enter new content into testSubject
                var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                testSubject.html(escaped);

                // Calculate new width + whether to change
                var testerWidth = testSubject.width(),
                    newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                    currentWidth = input.width(),
                    isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                                         || (newWidth > minWidth && newWidth < o.maxWidth);

                // Animate width
                if (isValidWidthChange) {
                    input.width(newWidth);
                }

            };

        testSubject.insertAfter($('body'));

        $(this).bind('keyup keydown blur update', check);

    });

    return this;

  }
)

// Index of
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i++)
      if (this[i] == obj) { return i; }
    return -1;
  }
}


var std = {
  // Date -> 'June 4 2011'
  date_str: function(date) {
    var split = date.toString().split(' ')
    return split[1] + ' ' + split[2] + ' ' + split[3] + ' ' + split[5]
  },

  delete_val: function(array, val) {
    for(var i = 0; i < array.length; i++) {
      if(array[i] == val) {
        array.splice(i, 1)
        return i
      }
    }
    throw 'val not found'
  },

  // Cross browser gradient
  set_gradient: function(el, color1, color2) {
    var strs = ['-moz-linear-gradient(top,  #%s1,  #%s2)',
                '-webkit-gradient(linear, left top, left bottom, from(#%s1), to(#%s2))']
    for(var i = 0; i < strs.length; i++){
      var back_str = strs[i]
      back_str = back_str.replace('%s1', color1).replace('%s2', color2)
      $(el).css({'background':back_str})
    }
  },

  safety_valve: function(func, max_calls) {

    // Don't call a function too many times (guard against infinite recursion).

    var num_calls = 0
    return function() {
      num_calls += 1
      if(num_calls > max_calls) {
        console.log('saftey valve')
        return
      }
      func.apply(this, arguments)
    }
  }
}

