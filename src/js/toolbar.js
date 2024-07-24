import Station from "./station";
import HistoryStep from "./historystep";
import { getEventMouseCoords } from "./utils";

function changeTool(btn, cm) {
  // remove active from others buttons, apply active to the clicked tool
  if (btn !== cm.activeTool) {
    const prev = document.getElementById(cm.activeTool);
    prev.classList.toggle("active");
    prev.setAttribute("aria-pressed", false);

    cm.activeTool = btn;
    const current = document.getElementById(cm.activeTool);
    current.classList.toggle("active");
    current.setAttribute("aria-pressed", true);
  }
}

// Delete the Station or Connection
function deletePart(e, cm) {
  if (cm.canvas.selection) {
    cm.addToUndoHistory(new HistoryStep("delete", cm.canvas.selection));
    cm.canvas.removeShape(cm.canvas.selection);
    cm.clearDisplayProps();
  }
}

function handleAddStation(e, cm) {
  const offset = cm.canvas.getMouseOffset();
  let mouse = getEventMouseCoords(e, offset);

  const newStation = new Station(
    mouse.x - 15,
    mouse.y - 15,
    30,
    30,
    cm.lastStationFill,
    `s${cm.snum}`
  );
  cm.incrementSNum();
  cm.addToUndoHistory(new HistoryStep("add", newStation));
  cm.canvas.addShape(newStation);
  cm.canvas.selection = newStation;

  cm.displayProperties();
}

// TODO might get rid of this
function handleSelectClick(e, cm) {
  // update selection?
  // show properties
  cm.displayProperties();
}

function handleSelectMouseDown(e, cm) {
  const selection = cm.canvas.selection;
  if (selection) {
    cm.canvas.dragging = true;
    cm.addToUndoHistory(
      new HistoryStep("move", {
        id: selection.id,
        x: selection.x,
        y: selection.y,
      })
    );
  }
  cm.displayProperties();
}

export {
  handleAddStation,
  handleSelectClick,
  handleSelectMouseDown,
  changeTool,
  deletePart,
};
