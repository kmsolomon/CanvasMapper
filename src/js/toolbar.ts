import Station from "./station";
import HistoryStep from "./historystep";
import { getEventMouseCoords, roundNum } from "./utils";
import CanvasMapper from "./canvasmapper";
import { HistoryMoveStep, Tools } from "./types";

function changeTool(btn: Tools, cm: CanvasMapper) {
  // remove active from others buttons, apply active to the clicked tool
  if (btn !== cm.activeTool) {
    const prev = <HTMLButtonElement | null>(
      document.getElementById(cm.activeTool)
    );
    if (prev) {
      prev.classList.toggle("active");
      prev.setAttribute("aria-pressed", "false");
    }

    cm.activeTool = btn;
    const current = <HTMLButtonElement | null>(
      document.getElementById(cm.activeTool)
    );
    if (current) {
      current.classList.toggle("active");
      current.setAttribute("aria-pressed", "true");
    }
  }
}

// Delete the Station or Connection
function deletePart(cm: CanvasMapper) {
  if (cm.canvas.selection) {
    cm.addToUndoHistory(
      new HistoryStep({ type: "delete", obj: cm.canvas.selection })
    );
    cm.canvas.removeShape(cm.canvas.selection);
    cm.clearDisplayProps();
  }
}

function handleAddStation(e: TouchEvent | MouseEvent, cm: CanvasMapper) {
  const offset = cm.canvas.getMouseOffset();
  let mouse = getEventMouseCoords(e, offset);
  if (mouse !== null) {
    const newStation = new Station(
      roundNum(mouse.x - 15),
      roundNum(mouse.y - 15),
      30,
      30,
      cm.lastStationFill,
      `s${cm.snum}`,
      cm.lastStationShape,
      cm.lastBorderColor
    );
    cm.incrementSNum();
    cm.addToUndoHistory(new HistoryStep({ type: "add", obj: newStation }));
    cm.canvas.addShape(newStation);
    cm.canvas.selection = newStation;

    cm.displayProperties();
  }
}

function handleSelectMouseDown(cm: CanvasMapper) {
  const selection = cm.canvas.selection;
  if (selection && selection instanceof Station) {
    cm.canvas.dragging = true;
    cm.canvas.moveStart = {
      x: roundNum(selection.x),
      y: roundNum(selection.y),
    };
  }
  cm.displayProperties();
}

function handleShapeMove(e: TouchEvent | MouseEvent, cm: CanvasMapper) {
  const offset = cm.canvas.getMouseOffset();
  let mouse = getEventMouseCoords(e, offset);
  // Don't want to drag the object by its top-left corner, that's what offset is for
  if (mouse && cm.canvas?.selection instanceof Station) {
    cm.canvas.selection.x = roundNum(mouse.x - cm.canvas.dragoffx);
    cm.canvas.selection.y = roundNum(mouse.y - cm.canvas.dragoffy);
    cm.canvas.valid = false; // Something's dragging so we must redraw
  }
}

function handleShapeMoveEnd(cm: CanvasMapper) {
  const selection = cm.canvas.selection;
  const start = cm.canvas.moveStart;
  if (
    selection &&
    selection instanceof Station &&
    start &&
    roundNum(start.x) !== roundNum(selection.x) &&
    roundNum(start.y) !== roundNum(selection.y)
  ) {
    const moveStep: HistoryMoveStep = {
      type: "move",
      obj: { id: selection.id, x: roundNum(start.x), y: roundNum(start.y) },
    };
    cm.addToUndoHistory(new HistoryStep(moveStep));
  }
  cm.canvas.moveStart = null;
}

export {
  handleAddStation,
  handleSelectMouseDown,
  handleShapeMove,
  handleShapeMoveEnd,
  changeTool,
  deletePart,
};
