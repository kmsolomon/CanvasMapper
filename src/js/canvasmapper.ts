import Connection from "./connection";
import HistoryStep from "./historystep";
import CanvasState from "./state";
import Station from "./station";
import {
  LineStyle,
  Point,
  StationShape,
  Tools,
  isTypeLineStyle,
  isTypeStationShape,
} from "./types";

export default class CanvasMapper {
  #undoHistory: HistoryStep[] = [];
  #redoHistory: HistoryStep[] = [];
  #uStep: number = 0;
  #rStep: number = 0;
  #maxHistory: number = 10; // customizable number of undo/redo steps
  #snum: number = 0; // number we'll use for station ids
  #cnum: number = 0; // number we'll use for connection ids
  #imp: number = 0; // number of files imported to help avoid id conflicts
  #lastStationFill: string = "#00AA00";
  #lastStationShape: StationShape = "square";
  #lastBorderColor: string = "#00AA00";
  #lastConnectionColor: string | null = null;
  #lastConnectionStyle: LineStyle = "solid";
  #lastConnectionWidth: number | null = null;
  #canvas: CanvasState;
  #activeTool: Tools = "selectBtn";

  constructor(maxHistory: number = 10, canvas: CanvasState) {
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
    if (c !== null && /^#[0-9A-F]{6}$/i.test(c)) {
      this.#lastConnectionColor = c;
    } else if (c === null) {
      this.#lastConnectionColor = null;
    }
  }

  get lastBorderColor() {
    return this.#lastBorderColor;
  }

  set lastBorderColor(c) {
    if (/^#[0-9A-F]{6}$/i.test(c)) {
      this.#lastBorderColor = c;
    }
  }

  get lastConnectionStyle() {
    return this.#lastConnectionStyle;
  }

  set lastConnectionStyle(s) {
    if (isTypeLineStyle(s)) {
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

  get lastStationShape() {
    return this.#lastStationShape;
  }

  set lastStationShape(s) {
    if (isTypeStationShape(s)) {
      this.#lastStationShape = s;
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
    if (this.#canvas.selection && this.#canvas.selection instanceof Station) {
      const props = <HTMLDivElement | null>document.getElementById("propdiv");
      const template = <HTMLTemplateElement | null>(
        document.querySelector("#stationProps")
      );
      const clone = template?.content.cloneNode(true) as HTMLElement;
      const selectedShape = this.#canvas.selection;
      const canvas = this.#canvas;
      const cm = this;

      if (props && template && clone !== null) {
        props.innerHTML = "";
        // get the name/coords/color from station and update fields before appending
        const stationColorField = <HTMLInputElement>(
          clone.querySelector("#stColorField")
        );
        const stationBorderColorField = <HTMLInputElement>(
          clone.querySelector("#stBorderColorField")
        );
        const stationNameField = <HTMLInputElement>(
          clone.querySelector("#stNameInput")
        );
        const stationXField = <HTMLInputElement>(
          clone.querySelector("#stXInput")
        );
        const stationYField = <HTMLInputElement>(
          clone.querySelector("#stYInput")
        );
        const stationZField = <HTMLInputElement>(
          clone.querySelector("#stZInput")
        );
        const stationShapeField = <HTMLSelectElement>(
          clone.querySelector("#stShapeSelect")
        );

        stationColorField.value = selectedShape.fill;
        stationBorderColorField.value = selectedShape.borderColor;
        stationNameField.value = selectedShape.name;
        stationXField.value = selectedShape.xcoord.toString();
        stationYField.value = selectedShape.ycoord.toString();
        stationZField.value = selectedShape.zcoord.toString();
        stationShapeField.value = selectedShape.shape;

        stationColorField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.fill = target.value;
            cm.lastStationFill = target.value;
            canvas.valid = false;
          }
        });
        stationBorderColorField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.borderColor = target.value;
            cm.lastBorderColor = target.value;
            canvas.valid = false;
          }
        });
        stationNameField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.name = target.value;
            canvas.valid = false;
          }
        });
        stationXField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.xcoord = Number.parseFloat(target.value);
            canvas.valid = false;
          }
        });
        stationYField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.ycoord = Number.parseFloat(target.value);
            canvas.valid = false;
          }
        });
        stationZField.addEventListener("change", function (e) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.zcoord = Number.parseFloat(target.value);
            canvas.valid = false;
          }
        });
        stationShapeField.addEventListener("change", function (e) {
          const target = <HTMLSelectElement>e.target;
          if (target.value && isTypeStationShape(target.value)) {
            selectedShape.shape = target.value;
            cm.lastStationShape = target.value;
            canvas.valid = false;
          }
        });
        props.appendChild(clone);
      }
    } else if (
      this.#canvas.selection &&
      this.#canvas.selection instanceof Connection
    ) {
      const props = <HTMLDivElement | null>document.getElementById("propdiv");
      const template = <HTMLTemplateElement | null>(
        document.querySelector("#connectionProps")
      );
      const clone = template?.content.cloneNode(true) as HTMLElement;
      const selectedShape = this.#canvas.selection;
      const canvas = this.#canvas;
      const cm = this;

      if (props && template && clone !== null) {
        props.innerHTML = "";
        const lineColorField = <HTMLInputElement>(
          clone.querySelector("#lineColorField")
        );
        const lineStyleField = <HTMLSelectElement>(
          clone.querySelector("#lineStyleInput")
        );
        const lineWidthField = <HTMLInputElement>(
          clone.querySelector("#lineWidthInput")
        );

        lineColorField.value = selectedShape.color;
        lineStyleField.value = selectedShape.style;
        lineWidthField.value = selectedShape.width.toString();

        lineColorField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          if (target.value) {
            selectedShape.color = target.value;
            cm.lastConnectionColor = target.value;
            canvas.valid = false;
          }
        });
        lineWidthField.addEventListener("change", function (e: Event) {
          const target = <HTMLInputElement>e.target;
          try {
            selectedShape.width = Number.parseInt(target.value, 10);
            cm.lastConnectionWidth = Number.parseInt(target.value, 10);
            canvas.valid = false;
          } catch (err) {
            console.error(err);
            target.value = "1";
            cm.lastConnectionWidth = 1;
            canvas.valid = false;
          }
        });
        lineStyleField.addEventListener("change", function (e: Event) {
          const target = <HTMLSelectElement>e.target;
          if (target.value && isTypeLineStyle(target.value)) {
            selectedShape.style = target.value;
            cm.lastConnectionStyle = target.value;
            canvas.valid = false;
          }
        });
        props.appendChild(clone);
      }
    }
  }

  clearDisplayProps() {
    const props = <HTMLDivElement | null>document.getElementById("propdiv");
    const template = <HTMLTemplateElement | null>(
      document.querySelector("#emptyProps")
    );
    if (props && template) {
      const clone = template.content.cloneNode(true);
      props.innerHTML = "";
      props.appendChild(clone);
    }
  }

  addToUndoHistory(hs: HistoryStep) {
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
      if (u.step.type === "move") {
        const l = this.#canvas.shapes.length;
        const currentSpot: Point = { x: 0, y: 0 };
        for (let i = l - 1; i >= 0; i--) {
          const currentShape = this.#canvas.shapes[i];
          if (
            currentShape.id === u.step.obj.id &&
            currentShape instanceof Station
          ) {
            currentSpot.x = currentShape.x;
            currentSpot.y = currentShape.y;
          }
        }
        this.#canvas.modifyShape(u.step.obj);
        u.step.obj.x = currentSpot.x;
        u.step.obj.y = currentSpot.y;
      }
      this.#redoHistory.push(u);

      if (u.step.type === "add") {
        this.#canvas.selection = null;
        this.clearDisplayProps();
        this.#canvas.removeShape(u.step.obj);
      } else if (u.step.type === "delete") {
        this.#canvas.addShape(u.step.obj);
        if (u.step.obj instanceof Station) {
          const l = u.step.obj.connections.length;
          for (let i = 0; i < l; i++) {
            this.#canvas.addShape(u.step.obj.connections[i]);
          }
        }
      } else if (u.step.type === "import") {
        this.#canvas.removeImportedShapes(u.step.obj);
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
      if (r.step.type === "move") {
        const l = this.#canvas.shapes.length;
        const currentSpot: Point = { x: 0, y: 0 };
        for (let i = l - 1; i >= 0; i--) {
          const currentShape = this.#canvas.shapes[i];
          if (
            currentShape instanceof Station &&
            currentShape.id === r.step.obj.id
          ) {
            currentSpot.x = currentShape.x;
            currentSpot.y = currentShape.y;
          }
        }
        this.#canvas.modifyShape(r.step.obj);
        r.step.obj.x = currentSpot.x;
        r.step.obj.y = currentSpot.y;
      }
      this.#undoHistory.push(r);
      if (r.step.type === "add") {
        this.#canvas.selection = null;
        this.clearDisplayProps();
        this.#canvas.addShape(r.step.obj);
      } else if (r.step.type === "delete") {
        this.#canvas.removeShape(r.step.obj);
      } else if (r.step.type === "import") {
        this.#canvas.addImportedShapes(r.step.obj);
      }
    }
  }
}
