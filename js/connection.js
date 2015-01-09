define(
  ['jquery', 'station'],
  function ($, station) {
    // A connection takes a starting Station and an end Station and draws a line between the two
    function Connection(start, end, color, width){
        console.log("new connection");
      if(start && end){
        this.start = start;
        this.end = end;
        this.color = color || '#000000';
        this.width = width || 2;
        this.id = "c" + cnum;
        this.type = "connection";
        cnum++;
      } else {
        console.error("Connection could not be created. Connections need both a start and end.");
      }
    }
    
    Connection.prototype = {
      draw: function(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.start.x+15 ,this.start.y+15); // will eventually want to do some fixing up to make sure the line starts on the correct side
        if(this.end.type == "station"){
          ctx.lineTo(this.end.x+15, this.end.y+15);
        } else {
          ctx.lineTo(this.end.x, this.end.y);   
        }
        ctx.stroke();
      },
      
      contains: function(mx, my){
        var padding = 2;
        return  (this.x <= mx) && (this.x + padding >= mx) &&
                (this.y <= my) && (this.y + padding >= my);
      },
      
      includes: function(s) {
        return (this.end.id === s.id || this.start.id === s.id);
      }
      
       
    };
    
    return Connection;
    
  }
);