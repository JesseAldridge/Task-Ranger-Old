
// source: http://ridiculousfish.com/blog/posts/colors.html

var color_seq = {

  next_hue: 0,

  get_hue: function(idx) {
     /* Here we use 31 bit numbers because JavaScript doesn't have a 32 bit unsigned type, and so the conversion to float would produce a negative value. */
     var bitcount = 31;

     /* Reverse the bits of idx into ridx */
     var ridx = 0, i = 0;
     for (i=0; i < bitcount; i++) {
        ridx = (ridx << 1) | (idx & 1);
        idx >>>= 1;
     }

     /* Divide by 2**bitcount */
     var hue = ridx / Math.pow(2, bitcount);

     /* Start at .6 (216 degrees) */
     return (hue + .6) % 1;
  },

  // Usage: <span style="background-color: hsl(' + degrees + ', 100%, 65%);">

  next_color: function(hue_num) {
    if(hue_num === undefined)
      hue_num = this.next_hue++
    var hue = this.get_hue(hue_num);
    var degrees = Math.round(hue * 360);
    return degrees
  }
}


