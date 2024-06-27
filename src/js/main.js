import * as Tools from "./toolbar";
import CanvasState from "./state";
import Connection from "./connection";

// this class should probably be moved to its own file
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
    this.incrementCNum = this.incrementCNum.bind(this);
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

  get cnum() {
    return this.#cnum;
  }

  incrementSNum() {
    this.#snum += 1;
  }

  incrementCNum() {
    this.#cnum += 1;
  }

  displayProperties() {
    if (this.#canvas.selection && this.#canvas.selection.type === "station") {
      const props = document.getElementById("propdiv");
      const template = document.querySelector("#stationProps");
      const clone = template.content.cloneNode(true);
      const selectedShape = this.#canvas.selection;

      props.innerHTML = "";
      // get the name/coords/color from station and update fields before appending
      clone.querySelector("#stColorField").value = selectedShape.fill;
      clone.querySelector("#stNameInput").value = selectedShape.name;
      clone.querySelector("#stXInput").value = selectedShape.xcoord;
      clone.querySelector("#stYInput").value = selectedShape.ycoord;
      clone.querySelector("#stZInput").value = selectedShape.zcoord;
      props.appendChild(clone);
    }
  }

  clearDisplayProps() {
    document.getElementById("propdiv").innerHTML = "";
    const props = document.getElementById("propdiv");
    const template = document.querySelector("#emptyProps");
    const clone = template.content.cloneNode(true);

    props.innerHTML = "";
    props.appendChild(clone);
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
    const tool = cm.activeTool;
    const offset = cm.canvas.getMouseOffset();
    const mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
    const shapes = cm.canvas.shapes;
    let validSelection = false;

    if (tool === "selectBtn" || tool === "connectionBtn") {
      console.log("this shapes are:", shapes);
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
    } else if (tool === "connectionBtn") {
      console.log("mouse down connecting");
      const selection = cm.canvas.selection; // TODO, probably want to select the station if you start a line on the station
      const line = new Connection(selection, mouse, cm.cnum);
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
      console.log("dragging for some reason");
      // var mouse = myState.getMouse(e);
      // Don't want to drag the object by its top-left corner, that's what offset is for
      cm.canvas.selection.x = mouse.x - cm.canvas.dragoffx;
      cm.canvas.selection.y = mouse.y - cm.canvas.dragoffy;
      cm.canvas.valid = false; // Something's dragging so we must redraw
    }
    if (cm.canvas.connecting) {
      console.log("connecting?");
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
      // TODO - 3rd time we have the offset then mouse thing. just put it in a function
      const offset = cm.canvas.getMouseOffset();
      const mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
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
          // UndoRedo.addToUndoHistory(
          //   new HistoryStep("add", cm.canvas.activeLine)
          // );
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
