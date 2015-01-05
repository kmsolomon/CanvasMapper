define(
  ['jquery', 'undoredo', 'station', 'connection', 'historystep', 'toolbar'],
  function ($, UndoRedo, Station, Connection, HistoryStep, Tools) {
    
    function CanvasState(canvas) {
  
      this.canvas = canvas;
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = canvas.getContext('2d');
     
      var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
      if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
      }

      var html = document.body.parentNode;
      this.htmlTop = html.offsetTop;
      this.htmlLeft = html.offsetLeft;
      
      this.valid = false; // false to redraw
      this.shapes = [];  // the stations, connections, etc. to draw
      this.dragging = false; // need to know when dragging
      this.activeLine = null;
      this.connecting = false; // know when we're drawing a connection
      this.selection = null;
      this.dragoffx = 0;
      this.dragoffy = 0;
      
      var myState = this;
      // fixes double clicking causing text not on canvas to get selected
      canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
      
      canvas.addEventListener('mousedown', function(e) {
        var tool = Tools.activeTool();
    
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        var shapes = myState.shapes;
        var l = shapes.length;
        for (var i = l-1; i >= 0; i--) {
          if (shapes[i].contains(mx, my)) {
            var mySel = shapes[i];
            myState.selection = mySel;
            // Keep track of where in the object we clicked
            // so we can move it smoothly (see mousemove)
            myState.dragoffx = mx - mySel.x;
            myState.dragoffy = my - mySel.y;
            tool.mouseDown(e, myState);
            myState.valid = false;
            return;
          }
        }
        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if (myState.selection) {
          myState.selection.updateValues(); // make sure we get any changes that were made to properties
          $('#propdiv').empty();
          myState.selection = null;
          myState.valid = false; // Need to clear the old selection border
        }
      }, true);
      canvas.addEventListener('mousemove', function(e) {
        if (myState.dragging){
          var mouse = myState.getMouse(e);
          // Don't want to drag the object by its top-left corner, that's what offset is for
          myState.selection.x = mouse.x - myState.dragoffx;
          myState.selection.y = mouse.y - myState.dragoffy;   
          myState.valid = false; // Something's dragging so we must redraw
        }
        if(myState.connecting){
          var mouse = myState.getMouse(e);
          myState.activeLine.end.x = mouse.x;
          myState.activeLine.end.y = mouse.y;
          myState.valid = false;
        }
      }, true);
      canvas.addEventListener('mouseup', function(e) {
        myState.dragging = false;
        if(myState.connecting){
          // check that we ended on a station
          // if yes, add that as the end point
          // if not, remove the line
          var validConnection = false;
          var mouse = myState.getMouse(e);
          var mx = mouse.x;
          var my = mouse.y;
          var shapes = myState.shapes;
          var l = shapes.length;
          for (var i = l-1; i >= 0; i--) {
            if (shapes[i].contains(mx, my) && shapes[i].id !== myState.selection.id) {
              console.log('valid connection');
              // was a valid shape, we're happy
              validConnection = true;
              myState.activeLine.end = shapes[i];
              shapes[i].connections.push(myState.activeLine);
              UndoRedo.addToUndoHistory(new HistoryStep("add", myState.activeLine));

            }
          } 
          if(!validConnection){
            console.log("was not a valid connection");
            // should find and remove the connection from the shape
            // but that should be handled in removeShape()?
            myState.removeShape(myState.activeLine); 

          } 
          myState.activeLine = null;
        }
        myState.connecting = false;
      }, true);
      // Single click with the add station tool adds a station
      canvas.addEventListener('click', function(e) {
        var tool = Tools.activeTool();
        tool.click(e, myState);
      }, true);
      
      this.selectionColor = '#CC0000';
      this.selectionWidth = 2;  
      this.interval = 30;
      setInterval(function() { myState.draw(); }, myState.interval);
    }
    
    CanvasState.prototype = {
      addShape: function(shape) {
        this.shapes.push(shape);
        this.valid = false;
      },
      
      removeShape: function(shape) {
        console.log("current shape to remove");
        console.log(shape);
        var l = this.shapes.length;
        for (var i = l-1; i >= 0; i--) {
           console.log("in for loop");
          if (this.shapes[i].id === shape.id) {
            this.selection = null;
            this.valid = false;
            this.shapes.splice(i, 1);
          }
          if(this.shapes[i] && this.shapes[i].type === "connection"){
            console.log("shape is a connection");
            console.log(this.shapes[i].includes(shape));
            if(this.shapes[i].includes(shape)){
              this.removeShape(this.shapes[i]);
            }
          }
          if(shape.type === "connection"){
              // need to make sure we take it out of the station connection arrays
              console.log("in the remove connections part");
              var start = shape.start;
              var end = shape.end;
              if(start.type === "station" && end.type === "station"){
                  return;
              }
              console.log(start);
              console.log(end);
              if(start.type === "station"){
                for( var j = 0; j < start.connections.length; j++){
                    if(start.connections &&start.connections[j].id === shape.id){
                      start.connections.splice(j, 1);
                    }
                }
              }
              if(end.type === "station"){
                for( var j = 0; j < end.connections.length; j++){
                  if(end.connections && end.connections[j].id === shape.id){
                    end.connections.splice(j, 1);
                  }
                }
                  
              }
          }
        } 
      },
      
      modifyShape: function(id, x, y) { // would be better to switch that to an options {}
        var l = this.shapes.length;
        for (var i = l-1; i >= 0; i--) {
          if (this.shapes[i].id === id) {
            this.shapes[i].x = x;
            this.shapes[i].y = y;
            this.valid = false;
            return;
          }
        }
      },
      
      clear: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
      },
      
      draw: function() {
        if (!this.valid) {
          var ctx = this.ctx;
          var shapes = this.shapes;
          this.clear();
            
          // draw all shapes
          var l = shapes.length;
          for (var i = 0; i < l; i++) {
            var shape = shapes[i];
            if(shape === undefined){
                console.error("something went wrong");
                return;
            }
            // We can skip the drawing of elements that have moved off the screen:
            if (shape.x > this.width || shape.y > this.height ||
                shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
            shapes[i].draw(ctx);
          }
            
          // draw selection
          // right now this is just a stroke along the edge of the selected Shape
          if (this.selection != null) {
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var mySel = this.selection;
            ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
          }
         
          this.valid = true;
        }
      },
      
      getMouse: function(e) {
        var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

        if (element.offsetParent !== undefined) {
          do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
          } while ((element = element.offsetParent));
        }
          
        offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
        offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;
      
        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;
          
        return {x: mx, y: my};
      }
       
    };
    
    return CanvasState;
    
  }
);