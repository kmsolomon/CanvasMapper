define(
  ['jquery', 'undoredo', 'historystep', 'station'],
  function ($, UndoRedo, HistoryStep, Station) {

   return {
     click: function(e, state){
       var mouse = state.getMouse(e);
       var s = new Station(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)');
       UndoRedo.addToUndoHistory(new HistoryStep("add", s));
       state.addShape(s);  
       state.selection = s;
       
       // then display options in properties
       s.displayProperties(state);
     }
      
  };
});