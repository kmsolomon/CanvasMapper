import Connection from "./connection";
import Station from "./station";
import { HistoryImport, HistoryMove, Point } from "./types";

export default class CanvasState {
  #canvas: HTMLCanvasElement;
  #width: number;
  #height: number;
  #ctx: CanvasRenderingContext2D | null;
  #stylePaddingLeft: number = 0;
  #stylePaddingTop: number = 0;
  #styleBorderLeft: number = 0;
  #styleBorderTop: number = 0;
  #valid: boolean = false; // false to redraw
  #shapes: (Station | Connection)[] = []; // the stations, connections, etc. to draw
  #dragging: boolean = false; // need to know when dragging
  #activeLine: Connection | null = null;
  #connecting: boolean = false; // know when we're drawing a connection
  #selection: Station | Connection | null = null;
  #moveStart: Point | null = null;
  #dragoffx: number = 0;
  #dragoffy: number = 0;
  #selectionColor: string = "#3e6659";
  #selectionOffset: number = 2;
  #selectionWidth: number = 2;
  #interval: number = 30;
  #bgColor: string = "#FFFFFF";

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    this.#width = canvas.width;
    this.#height = canvas.height;
    this.#ctx = canvas.getContext("2d");
    this.draw = this.draw.bind(this);
    this.#styleBorderLeft = Number.parseInt(
      getComputedStyle(canvas)
        .getPropertyValue("border-left-width")
        .slice(0, -2),
      10
    );
    this.#styleBorderTop = Number.parseInt(
      getComputedStyle(canvas)
        .getPropertyValue("border-top-width")
        .slice(0, -2),
      10
    );
  }

  get dragging() {
    return this.#dragging;
  }

  set dragging(d: boolean) {
    this.#dragging = d;
  }

  get canvas() {
    return this.#canvas;
  }

  get shapes() {
    return this.#shapes;
  }

  get selection() {
    return this.#selection;
  }

  set selection(shape: Station | Connection | null) {
    this.#selection = shape;
  }

  get dragoffx() {
    return this.#dragoffx;
  }

  set dragoffx(i: number) {
    this.#dragoffx = i;
  }

  get dragoffy() {
    return this.#dragoffy;
  }

  set dragoffy(i: number) {
    this.#dragoffy = i;
  }

  get interval() {
    return this.#interval;
  }

  get valid() {
    return this.#valid;
  }

  set valid(b: boolean) {
    this.#valid = b;
  }

  get activeLine() {
    return this.#activeLine;
  }

  set activeLine(l: Connection | null) {
    this.#activeLine = l;
  }

  get connecting() {
    return this.#connecting;
  }

  set connecting(b: boolean) {
    this.#connecting = b;
  }

  set width(w: number) {
    this.#width = w;
  }

  set height(h: number) {
    this.#height = h;
  }

  set moveStart(coords: Point | null) {
    if (this.#dragging) {
      this.#moveStart = coords;
    }
  }

  get moveStart() {
    return this.#moveStart;
  }

  addShape(shape: Station | Connection) {
    this.#shapes.push(shape);
    this.#valid = false;
  }

  removeShape(shape: Station | Connection) {
    const filteredShapes = this.#shapes.filter((s) => s.id !== shape.id);
    const l = filteredShapes.length;
    this.#selection = null;
    this.#valid = false;
    this.#shapes = filteredShapes;

    for (let i = l - 1; i >= 0; i--) {
      const checkShape = filteredShapes[i];
      if (
        shape instanceof Station &&
        checkShape instanceof Connection &&
        checkShape.includes(shape)
      ) {
        this.removeShape(checkShape);
      } else if (shape instanceof Connection) {
        // need to make sure we take it out of the station connection arrays that are still on the canvas
        const start = shape.start;
        const end = shape.end;
        if (start instanceof Station && end instanceof Station) {
          if (this.#includesShape(start.id)) {
            for (let j = 0; j < start.connections.length; j++) {
              if (start.connections && start.connections[j].id === shape.id) {
                start.connections.splice(j, 1);
              }
            }
          }
          if (this.#includesShape(end.id)) {
            for (let j = 0; j < end.connections.length; j++) {
              if (end.connections && end.connections[j].id === shape.id) {
                end.connections.splice(j, 1);
              }
            }
          }
        } else if (start instanceof Station && !(end instanceof Station)) {
          for (let j = 0; j < start.connections.length; j++) {
            if (start.connections && start.connections[j].id === shape.id) {
              start.connections.splice(j, 1);
            }
          }
        } else if (end instanceof Station && !(start instanceof Station)) {
          for (let j = 0; j < end.connections.length; j++) {
            if (end.connections && end.connections[j].id === shape.id) {
              end.connections.splice(j, 1);
            }
          }
        }
      }
    }
  }

  removeImportedShapes(shapes: HistoryImport) {
    for (const shape of shapes.importedShapes) {
      this.removeShape(shape);
    }
  }

  addImportedShapes(shapes: HistoryImport) {
    for (const shape of shapes.importedShapes) {
      this.addShape(shape);
    }
  }

  modifyShape(step: HistoryMove) {
    const l = this.#shapes.length;
    for (let i = l - 1; i >= 0; i--) {
      const shape = this.#shapes[i];
      if (shape instanceof Station && shape.id === step.id) {
        shape.x = step.x;
        shape.y = step.y;
        this.#valid = false;
        return;
      }
    }
  }

  clear() {
    if (this.#ctx !== null) {
      this.#ctx.clearRect(0, 0, this.#width, this.#height);
    }
  }

  draw() {
    if (!this.#valid && this.#ctx !== null) {
      const ctx = this.#ctx;
      const shapes = this.#shapes;
      this.clear();
      ctx.fillStyle = this.#bgColor;
      ctx.fillRect(0, 0, this.#width, this.#height); // Draw white background so it's not transparent when downloaded
      // draw all shapes
      // want to draw connections first
      for (const shape of shapes) {
        if (shape === undefined) {
          console.error("something went wrong");
          return;
        }
        if (
          shape instanceof Connection &&
          shape.start instanceof Station &&
          shape.start.x + shape.start.w >= 0 &&
          shape.start.y + shape.start.h >= 0 &&
          shape.start.x <= this.#width &&
          shape.start.y <= this.#height
        ) {
          shape.draw(ctx);
        }
      }

      // now draw the stations
      for (const shape of shapes) {
        if (shape === undefined) {
          console.error("Something went wrong while drawing");
          return;
        }
        if (
          shape instanceof Station &&
          shape.x <= this.#width &&
          shape.y <= this.#height &&
          shape.x + shape.w >= 0 &&
          shape.y + shape.h >= 0
        ) {
          shape.draw(ctx);
        }
      }

      // draw selection (a separate stroke-only rectangle around the station)
      if (this.#selection != null) {
        ctx.strokeStyle = this.#selectionColor;
        ctx.lineWidth = this.#selectionWidth;
        const mySel = this.#selection;

        if (mySel instanceof Station && mySel.shape === "square") {
          ctx.strokeRect(
            mySel.x - this.#selectionOffset,
            mySel.y - this.#selectionOffset,
            mySel.w + 2 * this.#selectionOffset,
            mySel.h + 2 * this.#selectionOffset
          );
        } else if (mySel instanceof Station && mySel.shape === "circle") {
          const path = new Path2D();
          const xCenter = mySel.x + mySel.w / 2;
          const yCenter = mySel.y + mySel.h / 2;
          path.arc(xCenter, yCenter, mySel.w / 2 + 3, 0, 2 * Math.PI, false);
          ctx.stroke(path);
          ctx.closePath();
        } else if (mySel instanceof Station && mySel.shape === "triangle") {
          const path = new Path2D();
          path.moveTo(mySel.x + mySel.w / 2, mySel.y - 5);
          path.lineTo(
            mySel.x + mySel.w + mySel.w / 5 + 5,
            mySel.y + mySel.h + 2.5
          );
          path.lineTo(mySel.x - mySel.w / 5 - 5, mySel.y + mySel.h + 2.5);
          path.closePath();
          ctx.stroke(path);
        } else if (mySel instanceof Station && mySel.shape === "diamond") {
          const path = new Path2D();
          path.moveTo(mySel.x + mySel.w / 2, mySel.y - 4);
          path.lineTo(mySel.x + mySel.w + 4, mySel.y + mySel.h / 2);
          path.lineTo(mySel.x + mySel.w / 2, mySel.y + mySel.h + 4);
          path.lineTo(mySel.x - 4, mySel.y + mySel.h / 2);
          path.closePath();
          ctx.stroke(path);
        } else if (mySel instanceof Station && mySel.shape === "star") {
          const path = new Path2D();
          const points = 5;
          const starX = mySel.x + mySel.w / 2;
          const starY = mySel.y + mySel.w / 2;
          const starRadius = mySel.w / 1.5 + 6;

          path.moveTo(starX, starY - starRadius);
          for (let i = 0; i < 2 * points + 1; i++) {
            const r = i % 2 == 0 ? starRadius : starRadius / 2;
            const a = (Math.PI * i) / points;
            path.lineTo(starX - r * Math.sin(a), starY - r * Math.cos(a));
          }
          path.closePath();
          ctx.stroke(path);
        }
      }

      this.#valid = true;
    }
  }

  getMouseOffset() {
    const canvas = this.#canvas;
    let offsetX = 0,
      offsetY = 0;

    offsetX +=
      canvas.offsetLeft + this.#stylePaddingLeft + this.#styleBorderLeft;
    offsetY += canvas.offsetTop + this.#stylePaddingTop + this.#styleBorderTop;

    return { x: offsetX, y: offsetY };
  }

  enableDarkMode(b: boolean) {
    if (b) {
      this.#bgColor = "#343434";
      this.#selectionColor = "#dcefe6";
    } else {
      this.#bgColor = "#FFFFFF";
      this.#selectionColor = "#3e6659";
    }
    this.#valid = false;
  }

  #includesShape(id: string): boolean {
    for (const obj of this.#shapes) {
      if (id === obj.id) {
        return true;
      }
    }
    return false;
  }

  // IDK what this was for, commenting out to see what happens
  // if (document.defaultView && document.defaultView.getComputedStyle) {
  //   this.stylePaddingLeft =
  //     parseInt(
  //       document.defaultView.getComputedStyle(canvas, null)["paddingLeft"],
  //       10
  //     ) || 0;
  //   this.stylePaddingTop =
  //     parseInt(
  //       document.defaultView.getComputedStyle(canvas, null)["paddingTop"],
  //       10
  //     ) || 0;
  //   this.styleBorderLeft =
  //     parseInt(
  //       document.defaultView.getComputedStyle(canvas, null)[
  //         "borderLeftWidth"
  //       ],
  //       10
  //     ) || 0;
  //   this.styleBorderTop =
  //     parseInt(
  //       document.defaultView.getComputedStyle(canvas, null)["borderTopWidth"],
  //       10
  //     ) || 0;
  // }
}
