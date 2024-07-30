export default class CanvasMapper {
  #undoHistory = [];
  #redoHistory = [];
  #uStep = 0;
  #rStep = 0;
  #maxHistory = 10; // customizable number of undo/redo steps
  #snum = 0; // number we'll use for station ids
  #cnum = 0; // number we'll use for connection ids
  #imp = 0; // number of files imported to help avoid id conflicts
  #lastStationFill = "#00AA00";
  #lastConnectionColor = null;
  #lastConnectionStyle = "solid";
  #lastConnectionWidth = null;
  #canvas = null;
  #activeTool = "selectBtn";

  constructor(maxHistory = 10, canvas) {
    this.#maxHistory = maxHistory;
    this.#canvas = canvas;
    this.incrementSNum = this.incrementSNum.bind(this);
    this.incrementCNum = this.incrementCNum.bind(this);
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
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

  get lastStationFill() {
    return this.#lastStationFill;
  }

  set lastStationFill(c) {
    if (/^#[0-9A-F]{6}$/i.test(c)) {
      this.#lastStationFill = c;
    }
  }

  get lastConnectionColor() {
    return this.#lastConnectionColor;
  }

  set lastConnectionColor(c) {
    if (/^#[0-9A-F]{6}$/i.test(c)) {
      this.#lastConnectionColor = c;
    }
  }

  get lastConnectionStyle() {
    return this.#lastConnectionStyle;
  }

  set lastConnectionStyle(s) {
    if (
      s === "solid" ||
      s === "dash" ||
      s === "large-dash" ||
      s === "dot" ||
      s === "dash-dot"
    ) {
      this.#lastConnectionStyle = s;
    }
  }

  get lastConnectionWidth() {
    return this.#lastConnectionWidth;
  }

  set lastConnectionWidth(n) {
    if (typeof n === "number") {
      this.#lastConnectionWidth = Math.floor(n);
    }
  }

  get imp() {
    return this.#imp;
  }

  incrementSNum() {
    this.#snum += 1;
  }

  incrementCNum() {
    this.#cnum += 1;
  }

  incrementImp() {
    this.#imp += 1;
  }

  displayProperties() {
    if (this.#canvas.selection && this.#canvas.selection.type === "station") {
      const props = document.getElementById("propdiv");
      const template = document.querySelector("#stationProps");
      const clone = template.content.cloneNode(true);
      const selectedShape = this.#canvas.selection;
      const canvas = this.#canvas;
      const cm = this;

      props.innerHTML = "";
      // get the name/coords/color from station and update fields before appending
      clone.querySelector("#stColorField").value = selectedShape.fill;
      clone.querySelector("#stNameInput").value = selectedShape.name;
      clone.querySelector("#stXInput").value = selectedShape.xcoord;
      clone.querySelector("#stYInput").value = selectedShape.ycoord;
      clone.querySelector("#stZInput").value = selectedShape.zcoord;

      clone
        .querySelector("#stColorField")
        .addEventListener("change", function (e) {
          selectedShape.fill = e.target.value;
          cm.lastStationFill = e.target.value;
          canvas.valid = false;
        });
      clone
        .querySelector("#stNameInput")
        .addEventListener("change", function (e) {
          selectedShape.name = e.target.value;
          canvas.valid = false;
        });
      clone.querySelector("#stXInput").addEventListener("change", function (e) {
        selectedShape.xcoord = e.target.value;
        canvas.valid = false;
      });
      clone.querySelector("#stYInput").addEventListener("change", function (e) {
        selectedShape.ycoord = e.target.value;
        canvas.valid = false;
      });
      clone.querySelector("#stZInput").addEventListener("change", function (e) {
        selectedShape.zcoord = e.target.value;
        canvas.valid = false;
      });
      props.appendChild(clone);
    } else if (
      this.#canvas.selection &&
      this.#canvas.selection.type === "connection"
    ) {
      const props = document.getElementById("propdiv");
      const template = document.querySelector("#connectionProps");
      const clone = template.content.cloneNode(true);
      const selectedShape = this.#canvas.selection;
      const canvas = this.#canvas;
      const cm = this;

      props.innerHTML = "";

      clone.querySelector("#lineColorField").value = selectedShape.color;
      clone.querySelector("#lineStyleInput").value = selectedShape.style;
      clone.querySelector("#lineWidthInput").value = selectedShape.width;

      clone
        .querySelector("#lineColorField")
        .addEventListener("change", function (e) {
          selectedShape.color = e.target.value;
          cm.lastConnectionColor = e.target.value;
          canvas.valid = false;
        });
      clone
        .querySelector("#lineWidthInput")
        .addEventListener("change", function (e) {
          try {
            selectedShape.width = e.target.value;
            cm.lastConnectionWidth = Number.parseInt(e.target.value);
            canvas.valid = false;
          } catch (err) {
            console.error(err);
            e.target.value = 1;
            cm.lastConnectionWidth = 1;
            canvas.valid = false;
          }
        });
      clone
        .querySelector("#lineStyleInput")
        .addEventListener("change", function (e) {
          selectedShape.style = e.target.value;
          cm.lastConnectionStyle = e.target.value;
          canvas.valid = false;
        });
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

  addToUndoHistory(hs) {
    if (this.#uStep === this.#maxHistory) {
      this.#undoHistory.shift();
      this.#uStep--;
    }
    this.#uStep++;
    this.#undoHistory.push(hs);
    // There's a new step so forget all the old redo items
    this.#redoHistory = [];
    this.#rStep = 0;
  }

  undo() {
    if (this.#uStep > 0) {
      this.#uStep--;
      const u = this.#undoHistory.pop();
      if (u === undefined) {
        console.error("The last undo history object was undefined.");
        return;
      }
      this.#rStep++;
      if (u.type === "move") {
        const l = this.#canvas.shapes.length;
        const currentSpot = {};
        for (let i = l - 1; i >= 0; i--) {
          if (this.#canvas.shapes[i].id === u.obj.id) {
            currentSpot.x = this.#canvas.shapes[i].x;
            currentSpot.y = this.#canvas.shapes[i].y;
          }
        }
        this.#canvas.modifyShape(u.obj.id, u.obj.x, u.obj.y);
        u.obj.x = currentSpot.x;
        u.obj.y = currentSpot.y;
      }
      this.#redoHistory.push(u);

      if (u.type === "add") {
        this.#canvas.selection = null;
        this.clearDisplayProps();
        this.#canvas.removeShape(u.obj);
      } else if (u.type === "delete") {
        this.#canvas.addShape(u.obj);
        const l = u.obj.connections.length;
        for (let i = 0; i < l; i++) {
          this.#canvas.addShape(u.obj.connections[i]);
        }
      } else if (u.type === "import") {
        this.#canvas.removeShapes(u.obj);
      }
    }
  }

  redo() {
    if (this.#rStep > 0) {
      this.#rStep--;
      const r = this.#redoHistory.pop();
      if (r === undefined) {
        console.error("The last redo history object was undefined.");
        return;
      }
      this.#uStep++;
      if (r.type === "move") {
        const l = this.#canvas.shapes.length;
        const currentSpot = {};
        for (let i = l - 1; i >= 0; i--) {
          if (this.#canvas.shapes[i].id === r.obj.id) {
            currentSpot.x = this.#canvas.shapes[i].x;
            currentSpot.y = this.#canvas.shapes[i].y;
          }
        }
        this.#canvas.modifyShape(r.obj.id, r.obj.x, r.obj.y);
        r.obj.x = currentSpot.x;
        r.obj.y = currentSpot.y;
      }
      this.#undoHistory.push(r);
      if (r.type === "add") {
        this.#canvas.selection = null;
        this.clearDisplayProps();
        this.#canvas.addShape(r.obj);
      } else if (r.type === "delete") {
        this.#canvas.removeShape(r.obj);
      } else if (r.type === "import") {
        this.#canvas.addShapes(r.obj);
      }
    }
  }
}
