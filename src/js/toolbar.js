import Station from "./station";
import HistoryStep from "./historystep";
import { getEventMouseCoords, roundNum } from "./utils";

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
    roundNum(mouse.x - 15),
    roundNum(mouse.y - 15),
    30,
    30,
    cm.lastStationFill,
    `s${cm.snum}`,
    cm.lastStationShape
  );
  cm.incrementSNum();
  cm.addToUndoHistory(new HistoryStep("add", newStation));
  cm.canvas.addShape(newStation);
  cm.canvas.selection = newStation;

  cm.displayProperties();
}

function handleSelectMouseDown(e, cm) {
  const selection = cm.canvas.selection;
  if (selection) {
    cm.canvas.dragging = true;
    cm.canvas.moveStart = {
      x: roundNum(selection.x),
      y: roundNum(selection.y),
    };
  }
  cm.displayProperties();
}

function handleShapeMove(e, cm) {
  const offset = cm.canvas.getMouseOffset();
  let mouse = getEventMouseCoords(e, offset);
  // Don't want to drag the object by its top-left corner, that's what offset is for
  cm.canvas.selection.x = roundNum(mouse.x - cm.canvas.dragoffx);
  cm.canvas.selection.y = roundNum(mouse.y - cm.canvas.dragoffy);
  cm.canvas.valid = false; // Something's dragging so we must redraw
}

function handleShapeMoveEnd(e, cm) {
  const selection = cm.canvas.selection;
  const start = cm.canvas.moveStart;
  if (
    selection &&
    roundNum(start.x) !== roundNum(selection.x) &&
    roundNum(start.y) !== roundNum(selection.y)
  ) {
    cm.addToUndoHistory(
      new HistoryStep("move", {
        id: selection.id,
        x: roundNum(start.x),
        y: roundNum(start.y),
      })
    );
  }
  cm.moveStart = { x: null, y: null };
}

export {
  handleAddStation,
  handleSelectMouseDown,
  handleShapeMove,
  handleShapeMoveEnd,
  changeTool,
  deletePart,
};
