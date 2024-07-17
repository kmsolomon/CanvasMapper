import * as Tools from "./toolbar";
import CanvasMapper from "./canvasmapper";
import CanvasState from "./state";
import Connection from "./connection";
import HistoryStep from "./historystep";
import { exportAsJSON, exportAsPNG } from "./export";
import { importFromJSON } from "./import";

function setupListeners(cm) {
  /***  Buttons  ***/
  document.getElementById("selectBtn").addEventListener("click", function () {
    Tools.changeTool("selectBtn", cm);
  });
  document.getElementById("stationBtn").addEventListener("click", function () {
    Tools.changeTool("stationBtn", cm);
  });
  document
    .getElementById("connectionBtn")
    .addEventListener("click", function () {
      Tools.changeTool("connectionBtn", cm);
    });
  document.getElementById("deleteBtn").addEventListener("click", function (e) {
    Tools.deletePart(e, cm);
  });
  document.getElementById("undoBtn").addEventListener("click", function () {
    cm.undo();
  });
  document.getElementById("redoBtn").addEventListener("click", function () {
    cm.redo();
  });
  document.getElementById("downloadPNG").addEventListener("click", function () {
    exportAsPNG();
  });
  document
    .getElementById("downloadJSON")
    .addEventListener("click", function () {
      exportAsJSON(cm.canvas);
    });
  document
    .getElementById("importFromJSONBtn")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      document.getElementById("importFile").click();
    });
  document
    .getElementById("importFile")
    .addEventListener("change", async function (e) {
      if (e.target.value !== "") {
        await importFromJSON(e, cm);
        e.target.value = "";
      }
    });

  /***  Canvas Listeners  ***/
  // fixes double clicking causing text not on canvas to get selected // TODO -- later verify if still needed
  const canvas = cm.canvas.canvas;
  //const test = cm;
  canvas.addEventListener(
    "selectstart",
    function (e) {
      e.preventDefault();
      return false;
    },
    false
  );

  function handleCanvasMouseDown(e) {
    const tool = cm.activeTool;
    const offset = cm.canvas.getMouseOffset();
    const mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
    const shapes = cm.canvas.shapes;
    let validSelection = false;

    if (tool === "selectBtn" || tool === "connectionBtn") {
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (shapes[i].contains(mouse.x, mouse.y)) {
          const selectedShape = shapes[i];

          cm.canvas.selection = selectedShape;
          validSelection = true;
          // Keep track of where in the object we clicked
          // so we can move it smoothly (see mousemove)
          cm.canvas.dragoffx = mouse.x - selectedShape.x;
          cm.canvas.dragoffy = mouse.y - selectedShape.y;
          break;
        }
      }
    }

    if (!validSelection && cm.canvas.selection) {
      // make sure we get any changes that were made to properties
      // TODO -- these should happen on enter/focus out
      if (cm.canvas.selection.type === "station") {
        cm.canvas.selection.name = document.getElementById("stNameInput").value;
        cm.canvas.selection.xcoord = document.getElementById("stXInput").value;
        cm.canvas.selection.ycoord = document.getElementById("stYInput").value;
        cm.canvas.selection.zcoord = document.getElementById("stZInput").value;
        cm.canvas.selection.fill =
          document.getElementById("stColorField").value;
      }
      cm.canvas.selection = null;
      cm.canvas.valid = false; // Need to clear the old selection border
      cm.clearDisplayProps();
    }

    if (tool === "selectBtn") {
      cm.displayProperties();
      cm.canvas.valid = false; // force redraw
      Tools.handleSelectMouseDown(e, cm);
    } else if (tool === "connectionBtn" && cm.canvas.selection) {
      const selection = cm.canvas.selection; // TODO, probably want to select the station if you start a line on the station
      const line = new Connection(selection, mouse, `c${cm.cnum}`);
      cm.incrementCNum();
      cm.canvas.connecting = true;
      selection.connections.push(line);
      cm.canvas.activeLine = line;
      cm.canvas.shapes.push(line);
    }
  }

  function handleCanvasMouseMove(e) {
    const offset = cm.canvas.getMouseOffset();
    const mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
    if (cm.canvas.dragging && cm.canvas.selection) {
      // Don't want to drag the object by its top-left corner, that's what offset is for
      cm.canvas.selection.x = mouse.x - cm.canvas.dragoffx;
      cm.canvas.selection.y = mouse.y - cm.canvas.dragoffy;
      cm.canvas.valid = false; // Something's dragging so we must redraw
    }
    if (cm.canvas.connecting) {
      cm.canvas.activeLine.end.x = mouse.x;
      cm.canvas.activeLine.end.y = mouse.y;
      cm.canvas.valid = false;
    }
  }

  function handleCanvasMouseUp(e) {
    cm.canvas.dragging = false;
    if (cm.canvas.connecting) {
      // check that we ended on a station
      // if yes, add that as the end point
      // if not, remove the line
      let validConnection = false;
      // TODO - 3rd time we have the offset then mouse thing. just put it in a function
      const offset = cm.canvas.getMouseOffset();
      const mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
      const shapes = cm.canvas.shapes;
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (
          shapes[i].contains(mouse.x, mouse.y) &&
          shapes[i].id !== cm.canvas.selection.id
        ) {
          // was a valid shape, we're happy
          validConnection = true;
          cm.canvas.activeLine.end = shapes[i];
          shapes[i].connections.push(cm.canvas.activeLine);
          cm.addToUndoHistory(new HistoryStep("add", cm.canvas.activeLine));
        }
      }
      if (!validConnection) {
        cm.canvas.removeShape(cm.canvas.activeLine);
      }
      cm.canvas.activeLine = null;
    }
    cm.canvas.connecting = false;
  }

  function handleCanvasClick(e) {
    const tool = cm.activeTool;
    switch (tool) {
      case "stationBtn":
        Tools.handleAddStation(e, cm);
        break;
      case "selectBtn":
        Tools.handleSelectClick(e, cm);
        break;
      default:
        break;
    }
  }

  canvas.addEventListener("mousedown", handleCanvasMouseDown, true);
  canvas.addEventListener("mousemove", handleCanvasMouseMove, true);
  canvas.addEventListener("mouseup", handleCanvasMouseUp, true);
  canvas.addEventListener("click", handleCanvasClick, true);
}

function initCanvas() {
  // TODO Would be nice to be able to resize the canvas later
  const canvas = document.getElementById("workspace");
  canvas.setAttribute("width", "800");
  canvas.setAttribute("height", "600");
  return new CanvasState(canvas);
}

function init() {
  const canvasState = initCanvas();
  const cm = new CanvasMapper(10, canvasState);
  setupListeners(cm);

  setInterval(function () {
    canvasState.draw();
  }, 10);
}

init();
