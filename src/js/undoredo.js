define(function() {

  return {
    addToUndoHistory: function(hs){
        if (uStep === maxHistory){
          undoHistory.shift();
         uStep--;
        }
        uStep++;
        undoHistory.push(hs);
        // There's a new step so forget all the old redo items
        redoHistory.length = 0;
        rStep = 0;
    },
     
      undo: function(e){
        if (uStep > 0) {
          uStep--;
          var u = undoHistory.pop();
          if(u === undefined){
            console.error("The last undo history object was undefined.");
            return;
          }
          console.log(u);
          rStep++;
          if (u.type === "move"){
            var l = state.shapes.length;
            var currentSpot = {};
            for (var i = l-1; i >= 0; i--) {
              if (state.shapes[i].id === u.object.id) {
                currentSpot.x = state.shapes[i].x;
                currentSpot.y = state.shapes[i].y;
              }
            } 
            state.modifyShape(u.object.id, u.object.x, u.object.y);
            u.object.x = currentSpot.x;
            u.object.y = currentSpot.y;
          }
          redoHistory.push(u);
        
          if(u.type === "add"){
            state.removeShape(u.object);  
          } else if (u.type === "delete"){
            state.addShape(u.object);
            var l = u.object.connections.length;
            for( var i = 0; i < l; i++){
              state.addShape(u.object.connections[i]);
            }
          }
        }   
      },
      
      redo: function(e) {
        if(rStep > 0){
          rStep--;
          var r = redoHistory.pop();
          if(r === undefined){
            console.error("The last redo history object was undefined.");
            return;
          }
          uStep++;
          if (r.type === "move"){
            var l = state.shapes.length;
            var currentSpot = {};
            for (var i = l-1; i >= 0; i--) {
              if (state.shapes[i].id === r.object.id) {
                currentSpot.x = state.shapes[i].x;
                currentSpot.y = state.shapes[i].y;
              }
            } 
            state.modifyShape(r.object.id, r.object.x, r.object.y);
            r.object.x = currentSpot.x;
            r.object.y = currentSpot.y;
          }
          undoHistory.push(r);
          if(r.type === "add"){
            state.addShape(r.object);   
          } else if (r.type === "delete"){
             state.removeShape(r.object);
          } else if (r.type === "connection"){
              // TODO
              console.log("not implemented");
          }
        }
      }
  };
});