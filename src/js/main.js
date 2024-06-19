import * as Tools from "./toolbar";
import CanvasState from "./state";

class CanvasMapper {
  #undoHistory = [];
  #redoHistory = [];
  #uStep = 0;
  #rStep = 0;
  #maxHistory = 10; // customizable number of undo/redo steps
  #snum = 0; // number we'll use for station ids
  #cnum = 0; // number we'll use for connection ids
  #canvas = null;
  #activeTool = "selectBtn";

  constructor(maxHistory = 10, canvas) {
    this.#maxHistory = maxHistory;
    this.#canvas = canvas;
    this.incrementSNum = this.incrementSNum.bind(this);
  }

  set activeTool(name) {
    this.#activeTool = name;
  }

  get activeTool() {
    return this.#activeTool;
  }

  set canvas(obj) {
    this.#canvas = obj;
  }

  get canvas() {
    return this.#canvas;
  }

  get snum() {
    return this.#snum;
  }

  incrementSNum() {
    this.#snum += 1;
  }
}

function setupListeners(cm) {
  /***  Buttons  ***/
  document.getElementById("selectBtn").addEventListener("click", function (e) {
    console.log("select btn");
    Tools.changeTool("selectBtn", cm);
  });
  document.getElementById("stationBtn").addEventListener("click", function (e) {
    console.log("add station btn");
    Tools.changeTool("stationBtn", cm);
  });
  document
    .getElementById("connectionBtn")
    .addEventListener("click", function (e) {
      console.log("add connection btn");
      Tools.changeTool("connectionBtn", cm);
    });
  document.getElementById("deleteBtn").addEventListener("click", function (e) {
    console.log("delete btn");
    // Tools.deletePart(e);
  });
  document.getElementById("undoBtn").addEventListener("click", function (e) {
    console.log("undo btn");
    // UndoRedo.undo(e);
  });
  document.getElementById("redoBtn").addEventListener("click", function (e) {
    console.log("redo btn");
    // UndoRedo.redo(e);
  });
  document
    .getElementById("downloadPNG")
    .addEventListener("click", function (e) {
      console.log("download png");
      // Export.exportAsPNG();
    });
  document
    .getElementById("downloadJSON")
    .addEventListener("click", function (e) {
      console.log("download json");
      // Export.exportAsJSON(state); // TODO -- state not global maybe
    });
  document.getElementById("importFile").addEventListener("click", function (e) {
    console.log("import!");
    // Import.importFromJSON(e, state);
  });

  /***  Canvas Listeners  ***/
  // fixes double clicking causing text not on canvas to get selected // TODO -- later verify if still needed
  const canvas = cm.canvas.canvas;
  const test = cm;
  canvas.addEventListener(
    "selectstart",
    function (e) {
      e.preventDefault();
      return false;
    },
    false
  );

  function handleCanvasMouseDown(e) {
    console.log("mouse down");
    const tool = cm.activeTool;
    const mouse = { x: e.pageX, y: e.pageY };
    const shapes = cm.canvas.shapes;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (shapes[i].contains(mouse.x, mouse.y)) {
        const mySel = shapes[i];
        cm.canvas.selection = mySel;
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        cm.canvas.dragoffx = mouse.x - mySel.x;
        cm.canvas.dragoffy = mouse.y - mySel.y;
        tool.mouseDown(e, myState);
        myState.valid = false;
        return;
      }
    }

    // havent returned means we have failed to select anything.
    // If there was an object selected, we deselect it
    if (cm.canvas.selection) {
      cm.canvas.selection.updateValues(); // make sure we get any changes that were made to properties
      //$("#propdiv").empty(); // TODO
      cm.canvas.selection = null;
      cm.canvas.valid = false; // Need to clear the old selection border
    }
  }

  function handleCanvasMouseMove(e) {
    const mouse = { x: e.pageX, y: e.pageY };
    if (cm.canvas.dragging) {
      // var mouse = myState.getMouse(e);
      // Don't want to drag the object by its top-left corner, that's what offset is for
      cm.canvas.selection.x = mouse.x - cm.canvas.dragoffx;
      cm.canvas.selection.y = mouse.y - cm.canvas.dragoffy;
      cm.canvas.valid = false; // Something's dragging so we must redraw
    }
    if (cm.canvas.connecting) {
      // var mouse = cm.canvas.getMouse(e);
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
      //var mouse = myState.getMouse(e);
      const mouse = { x: e.pageX, y: e.pageY };
      const shapes = cm.canvas.shapes;
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (
          shapes[i].contains(mouse.x, mouse.y) &&
          shapes[i].id !== cm.canvas.selection.id
        ) {
          console.log("valid connection");
          // was a valid shape, we're happy
          validConnection = true;
          cm.canvas.activeLine.end = shapes[i];
          shapes[i].connections.push(cm.canvas.activeLine);
          UndoRedo.addToUndoHistory(
            new HistoryStep("add", cm.canvas.activeLine)
          );
        }
      }
      if (!validConnection) {
        console.log("was not a valid connection");
        // should find and remove the connection from the shape
        // but that should be handled in removeShape()?
        cm.canvas.removeShape(cm.canvas.activeLine);
      }
      cm.canvas.activeLine = null;
    }
    cm.canvas.connecting = false;
  }

  function handleCanvasClick(e) {
    const tool = cm.activeTool;
    if (tool === "stationBtn") {
      Tools.handleAddStation(e, cm);
    }
  }

  // TODO -- fix the event listeners!
  canvas.addEventListener("mousedown", handleCanvasMouseDown, true);
  canvas.addEventListener("mousemove", handleCanvasMouseMove, true);
  canvas.addEventListener("mouseup", handleCanvasMouseUp, true);
  // Single click with the add station tool adds a station
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
