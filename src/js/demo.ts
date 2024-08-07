import CanvasMapper from "./canvasmapper";
import Connection from "./connection";
import HistoryStep from "./historystep";
import Station from "./station";
import { SimplifiedConnection, SimplifiedStation } from "./types";

const demoData = {
  allConnections: [
    '{"id":"i0-c0","start":"i0-s0","end":"i0-s1","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c1","start":"i0-s0","end":"i0-s5","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c5","start":"i0-s1","end":"i0-s2","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c10","start":"i0-s1","end":"i0-s3","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c6","start":"i0-s2","end":"i0-s3","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c7","start":"i0-s3","end":"i0-s7","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c8","start":"i0-s7","end":"i0-s4","color":"#2f7500","style":"large-dash","type":"connection","width":8}',
    '{"id":"i0-c2","start":"i0-s5","end":"i0-s6","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c3","start":"i0-s6","end":"i0-s9","color":"#000000","style":"solid","type":"connection","width":8}',
    '{"id":"i0-c4","start":"i0-s9","end":"i0-s8","color":"#000000","style":"solid","type":"connection","width":8}',
  ],
  allStations: [
    '{"id":"i0-s0","type":"station","fill":"#ff8a8a","x":134,"y":221,"name":"Base","xcoord":0,"ycoord":0,"zcoord":0,"shape":"star","w":30,"h":30,"borderColor":"#ffffff","connections":["i0-c0","i0-c1"]}',
    '{"id":"i0-s1","type":"station","fill":"#00a87e","x":134,"y":106,"name":"Forest","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c0","i0-c5","i0-c10"]}',
    '{"id":"i0-s2","type":"station","fill":"#00a87e","x":235,"y":24,"name":"Mine","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c5","i0-c6"]}',
    '{"id":"i0-s3","type":"station","fill":"#00a87e","x":333,"y":107,"name":"Jungle","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c10","i0-c6","i0-c7"]}',
    '{"id":"i0-s4","type":"station","fill":"#00a87e","x":546,"y":24,"name":"Village 2","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c8"]}',
    '{"id":"i0-s5","type":"station","fill":"#00a87e","x":133,"y":330,"name":"Swamp","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c1","i0-c2"]}',
    '{"id":"i0-s6","type":"station","fill":"#00a87e","x":134,"y":462,"name":"South plains station","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c2","i0-c3"]}',
    '{"id":"i0-s7","type":"station","fill":"#00a87e","x":547,"y":264,"name":"Plains Village","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c7","i0-c8"]}',
    '{"id":"i0-s8","type":"station","fill":"#00a87e","x":554,"y":464,"name":"Ocean","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c4"]}',
    '{"id":"i0-s9","type":"station","fill":"#00a87e","x":344,"y":465,"name":"South forest station","xcoord":0,"ycoord":0,"zcoord":0,"shape":"circle","w":30,"h":30,"borderColor":"#00a87e","connections":["i0-c3","i0-c4"]}',
  ],
};

type ImportedDetails = {
  allConnections: string[];
  allStations: string[];
};

async function loadDemo(cm: CanvasMapper) {
  const importIdPrefix = `i${cm.imp}-`;
  cm.incrementImp();
  let shapes = demoData;

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
      if (!getObject(`${importIdPrefix}${cObj.id}`, start.connections)) {
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

export { loadDemo };
