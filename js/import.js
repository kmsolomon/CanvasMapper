define(
  ['jquery', 'fileSaver'],
  function ($, FileSaver) {

  return {

    importFromJSON: function(evt, state){
      console.log(evt);
      var file = evt.target.files[0]; // FileList object

   

      // Only want json or text files
      if (!file.type.match('application/json') && !file.type.match('text/plain') && !file.type.match('application/plain')) {
        console.log('wrong file type');
        return;
      }

      var reader = new FileReader();
      var shapes = null;
      console.log('made the file reader');
      // part where we do stuff with the file goes here
      reader.onload = readSuccessful;
          
      function readSuccessful(rEvt) {                         
        var json = rEvt.target.result;    
        console.log(json);         
        try {
          shapes = JSON.parse(json);
                 
          // we need to go through to replace references to stations/connections that had to be replaced with ids when we saved the map as json
          var connections = shapes.allConnections;
          var stations = shapes.allStations;

          console.log(stations);
        } catch (e) {
          console.log(e);
        }
                                  
      };
      
      function getObject(id, objects){
          for(var i = 0; i < objects.length; i++){
              if(id == objects[i].id){
                  return objects[i];
              }
          }
          
      }
       

      reader.readAsText(file);
    }
    
      
  };
});