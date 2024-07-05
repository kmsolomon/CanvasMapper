import Station from "./station";
import HistoryStep from "./historystep";

// function activeTool() {
//   var active = document.querySelector(".active");
//   if (active.id) {
//     switch (active.id) {
//       case "stationBtn":
//         return AddStation;
//         break;
//       case "selectBtn":
//         return SelectTool;
//         break;
//       case "connectionBtn":
//         return AddConnection;
//         break;
//       default:
//         break;
//     }
//   } else {
//     console.warn("There was an error getting the active tool");
//     return "selection";
//   }
// }

function changeTool(btn, cm) {
  // remove active from others buttons, apply active to the clicked tool
  if (btn !== cm.activeTool) {
    console.log(`should change to ${btn}!`);
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
  const mouse = { x: e.pageX, y: e.pageY }; // TODO -- offset?
  const offset = cm.canvas.getMouseOffset();
  const newStation = new Station(
    mouse.x - offset.x - 15,
    mouse.y - offset.y - 15,
    30,
    30,
    "#00FF00",
    cm.snum
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
  cm.displayProperties();
  cm.canvas.dragging = true;
  cm.addToUndoHistory(
    new HistoryStep("move", {
      id: selection.id,
      x: selection.x,
      y: selection.y,
    })
  );
}

export {
  handleAddStation,
  handleSelectClick,
  handleSelectMouseDown,
  changeTool,
  deletePart,
};
