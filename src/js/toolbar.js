import Station from "./station";

function activeTool() {
  var active = document.querySelector(".active");
  if (active.id) {
    switch (active.id) {
      case "stationBtn":
        return AddStation;
        break;
      case "selectBtn":
        return SelectTool;
        break;
      case "connectionBtn":
        return AddConnection;
        break;
      default:
        break;
    }
  } else {
    console.warn("There was an error getting the active tool");
    return "selection";
  }
}

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
function deletePart(e) {
  if (state.selection) {
    UndoRedo.addToUndoHistory(new HistoryStep("delete", state.selection));
    state.removeShape(state.selection);
    $("#propdiv").empty();
  }
}

function handleAddStation(e, cm) {
  const mouse = { x: e.pageX, y: e.pageY }; // TODO -- offset
  const offset = cm.canvas.getMouseOffset();
  const newStation = new Station(
    mouse.x - offset.x - 15,
    mouse.y - offset.y - 15,
    30,
    30,
    "rgba(0,255,0,1)",
    cm.snum
  );
  cm.incrementSNum();
  //UndoRedo.addToUndoHistory(new HistoryStep("add", newStation));
  cm.canvas.addShape(newStation);
  cm.canvas.selection = newStation;

  // then display options in properties
  newStation.displayProperties(cm.canvas);
}

export { handleAddStation, changeTool, deletePart };
