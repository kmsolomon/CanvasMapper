import * as Tools from "./toolbar";
import CanvasMapper from "./canvasmapper";
import CanvasState from "./state";
import Connection from "./connection";
import HistoryStep from "./historystep";
import { exportAsJSON, exportAsPNG } from "./export";
import { importFromJSON } from "./import";
import { getEventMouseCoords } from "./utils";

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
    exportAsPNG(cm.canvas);
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

  window.addEventListener("resize", function (e) {
    const canvas = document.getElementById("workspace");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cm.canvas.width = canvas.clientWidth;
    cm.canvas.height = canvas.clientHeight;
    cm.canvas.valid = false;
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
    e.preventDefault();
    e.stopPropagation();

    const tool = cm.activeTool;
    const offset = cm.canvas.getMouseOffset();
    let mouse = getEventMouseCoords(e, offset);

    const shapes = cm.canvas.shapes;
    let validSelection = false;

    if (tool === "selectBtn" || tool === "connectionBtn") {
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (shapes[i].contains(mouse.x, mouse.y, cm.canvas.canvas)) {
          const selectedShape = shapes[i];

          cm.canvas.selection = selectedShape;

          validSelection = true;
          // Keep track of where in the object we clicked
          // so we can move it smoothly (see mousemove)
          cm.canvas.dragoffx = mouse.x - selectedShape.x;
          cm.canvas.dragoffy = mouse.y - selectedShape.y;
        }
      }
    }

    if (!validSelection && cm.canvas.selection) {
      // Still need to save the values here because of some cases in Firefox
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
      if (cm.activeTool !== "stationBtn") {
        cm.clearDisplayProps();
      }
    }

    if (tool === "selectBtn") {
      cm.canvas.valid = false; // force redraw
      Tools.handleSelectMouseDown(e, cm);
    } else if (tool === "connectionBtn" && cm.canvas.selection) {
      const selection = cm.canvas.selection;
      let connectColor = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "#dddddd"
        : "#000000";
      if (cm.lastConnectionColor !== null) {
        connectColor = cm.lastConnectionColor;
      }
      const line = new Connection(
        selection,
        mouse,
        `c${cm.cnum}`,
        connectColor
      );
      cm.incrementCNum();
      cm.canvas.connecting = true;
      selection.connections.push(line);
      cm.canvas.activeLine = line;
      cm.canvas.shapes.push(line);
    }
  }

  function handleCanvasMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();

    if (
      cm.activeTool === "selectBtn" &&
      cm.canvas.dragging &&
      cm.canvas.selection
    ) {
      Tools.handleShapeMove(e, cm);
    }
    if (cm.canvas.connecting) {
      const offset = cm.canvas.getMouseOffset();
      let mouse = getEventMouseCoords(e, offset);

      cm.canvas.activeLine.end.x = mouse.x;
      cm.canvas.activeLine.end.y = mouse.y;
      cm.canvas.valid = false;
    }
  }

  function handleCanvasMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    cm.canvas.dragging = false;
    const tool = cm.activeTool;
    switch (tool) {
      case "stationBtn":
        Tools.handleAddStation(e, cm);
        break;
      case "selectBtn":
        Tools.handleShapeMoveEnd(e, cm);
        break;
      case "connectionBtn":
        if (cm.canvas.connecting) {
          // check that we ended on a station
          // if yes, add that as the end point
          // if not, remove the line
          let validConnection = false;
          const offset = cm.canvas.getMouseOffset();
          let mouse = getEventMouseCoords(e, offset);
          const shapes = cm.canvas.shapes;
          for (let i = shapes.length - 1; i >= 0; i--) {
            if (
              shapes[i].type === "station" &&
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
        break;
      default:
        break;
    }

    cm.canvas.connecting = false;
  }

  canvas.addEventListener("mousedown", handleCanvasMouseDown, {
    passive: false,
  });
  canvas.addEventListener("touchstart", handleCanvasMouseDown, {
    passive: false,
  });
  canvas.addEventListener("mousemove", handleCanvasMouseMove, {
    passive: false,
  });
  canvas.addEventListener("touchmove", handleCanvasMouseMove, {
    passive: false,
  });
  canvas.addEventListener("mouseup", handleCanvasMouseUp, { passive: false });
  canvas.addEventListener("touchend", handleCanvasMouseUp, { passive: false });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      cm.canvas.enableDarkMode(e.matches);
    });
}

function initCanvas() {
  const canvas = document.getElementById("workspace");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  return new CanvasState(canvas);
}

function init() {
  const canvasState = initCanvas();
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    canvasState.enableDarkMode(true);
  }
  const cm = new CanvasMapper(10, canvasState);
  setupListeners(cm);

  setInterval(function () {
    canvasState.draw();
  }, 10);
}

init();
