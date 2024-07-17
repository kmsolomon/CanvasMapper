import Connection from "./connection";
import HistoryStep from "./historystep";
import Station from "./station";

async function importFromJSON(evt, cm) {
  const file = evt.target.files[0]; // FileList object
  // Only want json or text files
  if (
    !file.type.match("application/json") &&
    !file.type.match("text/plain") &&
    !file.type.match("application/plain")
  ) {
    console.error(
      `Error: Can only import maps using .json or .txt file types. Provided file type was: ${file.type}`
    );
    return;
  }

  const reader = new FileReader();
  let shapes = null;

  reader.onload = readSuccessful;
  reader.readAsText(file);

  function readSuccessful(rEvt) {
    const json = rEvt.target.result;

    try {
      const importIdPrefix = `i${cm.imp}-`;
      cm.incrementImp();
      shapes = JSON.parse(json);

      // we need to go through to replace references to stations/connections that had to be replaced with ids when we saved the map as json
      const connections = shapes.allConnections;
      const stations = shapes.allStations;

      // make copy of stations, but with empty connections list
      const stnsCopy = [];
      for (const station of stations) {
        const sObj = JSON.parse(station);
        const s = new Station(
          sObj.x,
          sObj.y,
          sObj.w,
          sObj.h,
          sObj.fill,
          `${importIdPrefix}${sObj.id}`
        );
        s.name = sObj.name;
        s.xcoord = sObj.xcoord;
        s.ycoord = sObj.ycoord;
        s.zcoord = sObj.zcoord;
        stnsCopy.push(s);
      }

      // make the connections
      const ctsCopy = [];
      for (const c of connections) {
        const cObj = JSON.parse(c);
        const start = getObject(`${importIdPrefix}${cObj.start}`, stnsCopy);
        const end = getObject(`${importIdPrefix}${cObj.end}`, stnsCopy);
        const fixedC = new Connection(
          start,
          end,
          `${importIdPrefix}${cObj.id}`,
          cObj.color,
          cObj.width
        );

        ctsCopy.push(fixedC);

        // add this connection to the start/end stations' connections if it's not already there
        if (!getObject(`${importIdPrefix}${cObj.id}`, start.connections)) {
          start.connections = start.connections.concat(fixedC);
        }

        if (!getObject(`${importIdPrefix}${cObj.id}`, end.connections)) {
          end.connections = end.connections.concat(fixedC);
        }
      }

      const importedShapes = [...stnsCopy, ...ctsCopy];
      for (const shape of importedShapes) {
        cm.canvas.addShape(shape);
      }
      cm.canvas.valid = false;
      cm.addToUndoHistory(
        new HistoryStep("import", {
          importedShapes: importedShapes,
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  function getObject(id, objects) {
    for (const obj of objects) {
      if (id === obj.id) {
        return obj;
      }
    }
    return null;
  }
}

export { importFromJSON };
