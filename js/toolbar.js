define(
  ['jquery', 'undoredo', 'historystep'],
  function ($, UndoRedo, HistoryStep) {

  return {
          
    activeTool: function(){
      var active = document.querySelector('.active');
      if(active.id){
        return active.id;
      } else {
        console.warn("There was an error getting the active tool");
        return "selection";
      }
    },  
    
    changeTool: function(e){
    // remove active from others buttons, apply active to the clicked tool
      var active = document.querySelector('.active');
      $(active).removeClass('active');
      $(e.target).addClass('active');
    },
    
   // Delete the Station or Connection
   deletePart: function(e){
     if(state.selection){
       UndoRedo.addToUndoHistory(new HistoryStep("delete", state.selection));
       state.removeShape(state.selection);    
      }
   }
      
  };
});