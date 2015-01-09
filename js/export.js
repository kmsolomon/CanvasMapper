define(
  ['jquery', 'fileSaver', 'canvastoBlob'],
  function ($, FileSaver, CanvastoBlob) {

  return {
    
    exportAsPNG: function(){
      var canvas = document.getElementById("workspace"), ctx = canvas.getContext("2d");

      canvas.toBlob(function(blob) {
        saveAs(blob, "canvasMap.png");
      });
    },
    
    exportAsJSON: function(state){
      var stations = [];
      var shapes = state.shapes;
      console.log(shapes);
      // for (var i = 0; i < shapes.length; i++) {
        // var shape = shapes[i];
        // if(shape === undefined){
            // console.error("something went wrong");
            // return;
        // }
        // if(shape.type == "station"){
// 
            // stations.push(shape);
        // }
      // }
//       
      // var json = JSON.stringify(stations);
      // console.log(json);

    }
    
      
  };
});