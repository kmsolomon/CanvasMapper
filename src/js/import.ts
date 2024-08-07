import CanvasMapper from "./canvasmapper";
import Connection from "./connection";
import HistoryStep from "./historystep";
import Station from "./station";
import { SimplifiedConnection, SimplifiedStation } from "./types";

type ImportedDetails = {
  allConnections: string[];
  allStations: string[];
};

async function importFromJSON(evt: Event, cm: CanvasMapper) {
  const target = <HTMLInputElement>evt.target;

  if (target && target.files) {
    const file = target.files[0]; // FileList object
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
    let shapes: ImportedDetails = { allConnections: [], allStations: [] };

    reader.onload = readSuccessful;
    reader.readAsText(file);

    function readSuccessful(rEvt: ProgressEvent) {
      const json = reader.result;

      try {
        if (typeof json === "string") {
          const importIdPrefix = `i${cm.imp}-`;
          cm.incrementImp();
          shapes = JSON.parse(json);

          // we need to go through to replace references to stations/connections that had to be replaced with ids when we saved the map as json
          const connections = shapes.allConnections;
          const stations = shapes.allStations;

          // make copy of stations, but with empty connections list
          const stnsCopy: Station[] = [];
          for (const station of stations) {
            const sObj: SimplifiedStation = JSON.parse(station);
            const s = new Station(
              sObj.x,
              sObj.y,
              sObj.w,
              sObj.h,
              sObj.fill,
              `${importIdPrefix}${sObj.id}`,
              sObj.shape,
              sObj.borderColor
            );
            s.name = sObj.name;
            s.xcoord = sObj.xcoord;
            s.ycoord = sObj.ycoord;
            s.zcoord = sObj.zcoord;
            stnsCopy.push(s);
          }

          // make the connections
          const ctsCopy: Connection[] = [];
          for (const c of connections) {
            const cObj: SimplifiedConnection = JSON.parse(c);
            const start = getObject(`${importIdPrefix}${cObj.start}`, stnsCopy);
            const end = getObject(`${importIdPrefix}${cObj.end}`, stnsCopy);
            if (start instanceof Station && end instanceof Station) {
              const fixedC = new Connection(
                start,
                end,
                `${importIdPrefix}${cObj.id}`,
                cObj.color,
                cObj.style,
                cObj.width
              );

              ctsCopy.push(fixedC);

              // add this connection to the start/end stations' connections if it's not already there
              if (
                !getObject(`${importIdPrefix}${cObj.id}`, start.connections)
              ) {
                start.connections = start.connections.concat(fixedC);
              }

              if (!getObject(`${importIdPrefix}${cObj.id}`, end.connections)) {
                end.connections = end.connections.concat(fixedC);
              }
            }
          }

          const importedShapes = [...stnsCopy, ...ctsCopy];
          for (const shape of importedShapes) {
            cm.canvas.addShape(shape);
          }
          cm.canvas.valid = false;
          cm.addToUndoHistory(
            new HistoryStep({
              type: "import",
              obj: {
                importedShapes: importedShapes,
              },
            })
          );
        }
      } catch (e) {
        console.error(e);
      }
    }

    function getObject(
      id: string,
      objects: Station[] | Connection[]
    ): Station | Connection | null {
      for (const obj of objects) {
        if (id === obj.id) {
          return obj;
        }
      }
      return null;
    }
  }
}

export { importFromJSON };
