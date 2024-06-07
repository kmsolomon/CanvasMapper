import * as Tools from "./toolbar";

class CanvasMapper {
  #undoHistory = [];
  #redoHistory = [];
  #uStep = 0;
  #rStep = 0;
  #maxHistory = 10; // customizable number of undo/redo steps
  #snum = 0; // number we'll use for station ids
  #cnum = 0; // number we'll use for connection ids
  #state = null;
  #activeTool = "selectBtn";

  constructor(maxHistory) {
    this.maxHistory = maxHistory;
  }

  set activeTool(name) {
    this.#activeTool = name;
  }

  get activeTool() {
    return this.#activeTool;
  }
}

function setupListeners(cm) {
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
}

function setupCanvas() {
  // TODO Would be nice to be able to resize the canvas later
  const canvas = document.getElementById("workspace");
  canvas.setAttribute("width", "800");
  canvas.setAttribute("height", "600");
  //state = new CanvasState(canvas); //TODO
}

function init() {
  const cm = new CanvasMapper();
  setupListeners(cm);
  setupCanvas();
}

init();
