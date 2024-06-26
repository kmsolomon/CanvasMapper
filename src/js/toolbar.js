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
    "#00FF00",
    cm.snum
  );
  cm.incrementSNum();
  //UndoRedo.addToUndoHistory(new HistoryStep("add", newStation)); // TODO -- history
  cm.canvas.addShape(newStation);
  cm.canvas.selection = newStation;

  // then display options in properties
  //newStation.displayProperties(cm.canvas);

  // TODO -- likely want a util function for props to add the template/attach listeners
  const props = document.getElementById("propdiv");
  const template = document.querySelector("#stationProps");
  const clone = template.content.cloneNode(true);

  props.innerHTML = "";
  // get the name/coords/color from station and update fields before appending
  clone.querySelector("#stColorField").value = "#00FF00";
  props.appendChild(clone);
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
  // TODO history
  // UndoRedo.addToUndoHistory(
  //   new HistoryStep("move", {
  //     id: selection.id,
  //     x: selection.x,
  //     y: selection.y,
  //   })
  // );
}

export {
  handleAddStation,
  handleSelectClick,
  handleSelectMouseDown,
  changeTool,
  deletePart,
};
