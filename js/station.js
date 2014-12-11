define('station',
  ['jquery'],
  function ($) {
    function Station(x, y, w, h, fill) {
      this.x = x || 0;
      this.y = y || 0;
      this.w = w || 1;
      this.h = h || 1;
      this.fill = fill || '#AAAAAA';
      this.id = "s" + snum;
      this.type = "station";
      this.connections = new Array();
      snum++;
    }
    
    Station.prototype = {
      draw: function(ctx) {
        ctx.fillStyle = this.fill;
        ctx.fillRect(this.x, this.y, this.w, this.h);
      },
      
      contains: function(mx, my){
        return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y <= my) && (this.y + this.h >= my);
      }
      
       
    };
    
    return Station;
    
  }
);