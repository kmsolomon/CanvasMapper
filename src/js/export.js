import Station from "./station";
import Connection from "./connection";

function exportAsPNG() {
  const canvas = document.getElementById("workspace");
  const dataURL = canvas.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "canvasMap.png";

  a.click();
}

function exportAsJSON(canvasState) {
  const shapes = canvasState.shapes;
  console.log("shapes:", shapes);
  let stations = [];
  let connections = [];

  function replaceConnections(shape) {
    const results = {
      connectIds: [],
      connections: [],
    };
    // for each of the connections, we want to add the id to an array
    // and also replace the start and end with the station ids
    for (const connection of shape.connections) {
      // TODO do we want a separate simplified type where start/end are strings instead of station objects?
      const copy = Connection.clone(connection);
      copy.start = connection.start.id;
      copy.end = connection.end.id;
      results.connectIds.push(copy.id);
      results.connections.push(copy);
    }

    return results;
  }

  let result = null;
  for (const shape of shapes) {
    if (shape.type === "station") {
      result = replaceConnections(shape);
      const simplifiedShape = Station.clone(shape);
      simplifiedShape.connections = result.connectIds;
      stations = stations.concat(simplifiedShape.toJSON());

      // check to make sure new result.connections not already found
      // if new add to connections
      for (const resultConnection of result.connections) {
        // for each result
        // check if connection id in it is already in connections
        let found = false;
        for (const newConnection of connections) {
          if (newConnection.id === resultConnection.id) {
            found = true;
          }
        }
        if (!found) {
          connections = connections.concat(resultConnection.toJSON());
        }
      }
    }
  }

  const allObjects = {
    allConnections: connections,
    allStations: stations,
  };

  const json = JSON.stringify(allObjects);
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "canvasMap.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

export { exportAsPNG, exportAsJSON };
