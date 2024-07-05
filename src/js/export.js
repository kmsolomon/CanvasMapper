// define(["jquery", "fileSaver", "canvastoBlob"], function (
//   $,
//   FileSaver,
//   CanvastoBlob
// ) {
//   return {
//     exportAsPNG: function () {
//       var canvas = document.getElementById("workspace"),
//         ctx = canvas.getContext("2d");

//       canvas.toBlob(function (blob) {
//         saveAs(blob, "canvasMap.png");
//       });
//     },

//     exportAsJSON: function (state) {
//       var shapes = state.shapes;

//       function replaceConnections(connections, shape) {
//         var results = {
//           connectIds: [],
//           connections: [],
//         };

//         // for each of the connections, we want to add the id to an array
//         // and also replace the start and end with the station ids
//         for (var i = 0; i < shape.connections.length; i++) {
//           var c = shape.connections[i];
//           var copy = {
//             start: c.start.id,
//             end: c.end.id,
//             color: c.color,
//             width: c.width,
//             id: c.id,
//             type: "connection",
//           };
//           results.connectIds.push(copy.id);
//           results.connections.push(copy);
//         }

//         return results;
//       }

//       var stations = [];
//       var connections = [];
//       var result = null;
//       for (var i = 0; i < shapes.length; i++) {
//         if (shapes[i].type === "station") {
//           result = replaceConnections(connections, shapes[i]);
//           shapes[i].connections = result.connectIds;
//           stations.push(shapes[i]);

//           // check to make sure new result.connections not already found
//           // if new add to connections
//           for (var j = 0; j < result.connections.length; j++) {
//             // for each result
//             // check if connection id in it is already in connections
//             var found = false;
//             for (var k = 0; k < connections.length; k++) {
//               if (connections[k].id == result.connections[j].id) {
//                 found = true;
//               }
//             }
//             if (!found) {
//               connections.push(result.connections[j]);
//             }
//           }
//         }
//       }

//       var allObjects = {
//         allConnections: connections,
//         allStations: stations,
//       };

//       var json = JSON.stringify(allObjects);
//       var blob = new Blob([json], { type: "application/json" });
//       saveAs(blob, "canvasMap.json");
//     },
//   };
// });

function exportAsPNG() {
  const canvas = document.getElementById("workspace");
  const dataURL = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "canvasMap.png";

  a.click();
}

export { exportAsPNG };
