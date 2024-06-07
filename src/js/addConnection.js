define(
  ['jquery', 'undoredo', 'historystep', 'connection'],
  function ($, UndoRedo, HistoryStep, Connection) {

   return {
     click: function(e, state){
     
     },  
       
     mouseDown: function(e, state){
       var selection = state.selection;
       var mouse = state.getMouse(e);
       var line = new Connection(selection, mouse);
       state.connecting = true;
       selection.connections.push(line);
       state.activeLine = line;
       state.shapes.push(line);
     }
      
  };
});