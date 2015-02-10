define(
  ['jquery', 'fileSaver', 'station', 'connection'],
  function ($, FileSaver, Station, Connection) {

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

      // part where we do stuff with the file goes here
      reader.onload = readSuccessful;
          
      function readSuccessful(rEvt) {                         
        var json = rEvt.target.result;    
       
        try {
          shapes = JSON.parse(json);
                 
          // we need to go through to replace references to stations/connections that had to be replaced with ids when we saved the map as json
          var connections = shapes.allConnections;
          var stations = shapes.allStations;

          
          // make copy of stations, but with empty connections list
          
          var stnsCopy = [];
          for(var i = 0; i < stations.length; i++){
            var s = new Station(stations[i].x, stations[i].y, stations[i].w, stations[i].h, stations[i].fill);
            s.name = stations[i].name;
            s.xcoord = stations[i].xcoord;
            s.ycoord = stations[i].ycoord;
            s.zcoord = stations[i].zcoord;
            s.id = stations[i].id;     

            stnsCopy.push(s);      
          }
          
          // make the connections
          var ctsCopy = [];
          for(var j = 0; j < connections.length; j++){
            var c = connections[j];
            var start = getObject(c.start, stnsCopy);
            var end = getObject(c.end, stnsCopy);
            var fixedC = new Connection(start, end);
            fixedC.color = c.color;
            fixedC.width = c.width;
            fixedC.id = c.id;

            ctsCopy.push(fixedC);
          }
          
          // now add our connections to the stations
          for(var k = 0; k < stnsCopy.length; k++){
            var s = stnsCopy[k];
            var old = getObject(s.id, stations);
            for(var m = 0; m < old.connections.length; m++){
              s.connections.push(getObject(old.connections[m], ctsCopy));
            }
          }

          // we should fix the ids if there are existing shapes already
          
          if(snum - stnsCopy.length != 0){
            // need to fix station ids
            var old = snum - stnsCopy.length;
            for(var i = 0; i < stnsCopy.length; i++){
              stnsCopy[i].id = "s" + (old + i);
            }
          }
          if(cnum - ctsCopy.length != 0) {
            // need to fix connection ids
            var old = cnum - ctsCopy.length;
            for(var i = 0; i < ctsCopy.length; i++){
              ctsCopy[i].id = "c" + (old + i);
            }
            
          }
          
          // now add them to state.shapes and make it redraw
          
          state.shapes = state.shapes.concat(stnsCopy, ctsCopy);
          state.valid = false;

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