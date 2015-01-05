define(
  ['jquery', 'undoredo', 'historystep', 'station', 'connection'],
  function ($, UndoRedo, HistoryStep, Station, Connection) {

   return {
     click: function(e, state){
       //TODO when we click a shape we should be displaying the properties of
       //the shape in the properties box  
         
     },
       
     mouseDown: function(e, state){
       var selection = state.selection;
       state.dragging = true;
       UndoRedo.addToUndoHistory(new HistoryStep("move", {id: selection.id, x: selection.x, y: selection.y}));
     }
      
  };
});