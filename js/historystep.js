define(
  ['jquery'],
  function ($) {
    // Type == what type of action occurred (ie delete, add, move)
    function HistoryStep(type, object){
      this.type = type;
      this.object = object;
    }
    
    return HistoryStep;
    
  }
);