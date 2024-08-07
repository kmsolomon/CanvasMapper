import Station from "./station";
import CanvasState from "./state";
import { SimplifiedConnection, SimplifiedStation } from "./types";

type exportResults = {
  connectIds: string[];
  connections: SimplifiedConnection[];
};

function exportAsPNG(mapper: CanvasState) {
  const canvas: HTMLCanvasElement = mapper.canvas;

  mapper.selection = null;
  mapper.valid = false;
  mapper.draw(); // redraw so selection isn't shown on the downloaded image

  const dataURL = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "canvasMap.png";

  a.click();
}

function exportAsJSON(canvasState: CanvasState) {
  const shapes = canvasState.shapes;
  let stations: string[] = [];
  let connections: string[] = [];
  let addedConnections: string[] = []; // array of the ids (strings) of the added connections

  function replaceConnections(shape: Station) {
    const results: exportResults = {
      connectIds: [],
      connections: [],
    };
    // for each of the connections, we want to add the id to an array
    // and also replace the start and end with the station ids
    for (const connection of shape.connections) {
      if (
        connection.start instanceof Station &&
        connection.end instanceof Station
      ) {
        const copy: SimplifiedConnection = {
          id: connection.id,
          start: connection.start.id,
          end: connection.end.id,
          color: connection.color,
          style: connection.style,
          type: connection.type,
          width: connection.width,
        };
        copy.start = connection.start.id;
        copy.end = connection.end.id;
        results.connectIds.push(copy.id);
        results.connections.push(copy);
      }
    }
    return results;
  }

  let result = null;
  for (const shape of shapes) {
    if (shape instanceof Station) {
      result = replaceConnections(shape);
      const simplifiedShape: SimplifiedStation = {
        id: shape.id,
        type: shape.type,
        fill: shape.fill,
        x: shape.x,
        y: shape.y,
        name: shape.name,
        xcoord: shape.xcoord,
        ycoord: shape.ycoord,
        zcoord: shape.zcoord,
        shape: shape.shape,
        w: shape.w,
        h: shape.h,
        borderColor: shape.borderColor,
        connections: result.connectIds,
      };
      stations = stations.concat(JSON.stringify(simplifiedShape));
      // check to make sure new result.connections not already found
      // if new add to connections
      for (const resultConnection of result.connections) {
        if (!addedConnections.includes(resultConnection.id)) {
          connections = connections.concat(JSON.stringify(resultConnection));
          addedConnections = addedConnections.concat(resultConnection.id);
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
