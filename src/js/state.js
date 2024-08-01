export default class CanvasState {
  #canvas;
  #width;
  #height;
  #ctx;
  #stylePaddingLeft = 0;
  #stylePaddingTop = 0;
  #styleBorderLeft = 0;
  #styleBorderTop = 0;
  #valid = false; // false to redraw
  #shapes = []; // the stations, connections, etc. to draw
  #dragging = false; // need to know when dragging
  #activeLine = null;
  #connecting = false; // know when we're drawing a connection
  #selection = null;
  #moveStart = { x: null, y: null };
  #dragoffx = 0;
  #dragoffy = 0;
  #selectionColor = "#3e6659";
  #selectionOffset = 2;
  #selectionWidth = 2;
  #interval = 30;
  #bgColor = "#FFFFFF";
  #htmlTop = document.body.parentNode.offsetTop;
  #htmlLeft = document.body.parentNode.offsetLeft;

  constructor(canvas) {
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

  set dragging(d) {
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

  set selection(shape) {
    this.#selection = shape;
  }

  get dragoffx() {
    return this.#dragoffx;
  }

  set dragoffx(i) {
    this.#dragoffx = i;
  }

  get dragoffy() {
    return this.#dragoffy;
  }

  set dragoffy(i) {
    this.#dragoffy = i;
  }

  get interval() {
    return this.#interval;
  }

  get valid() {
    return this.#valid;
  }

  set valid(b) {
    this.#valid = b;
  }

  get activeLine() {
    return this.#activeLine;
  }

  set activeLine(l) {
    this.#activeLine = l;
  }

  get connecting() {
    return this.#connecting;
  }

  set connecting(b) {
    this.#connecting = b;
  }

  set width(w) {
    this.#width = w;
  }

  set height(h) {
    this.#height = h;
  }

  set moveStart(coords) {
    if (this.#dragging) {
      this.#moveStart = coords;
    }
  }

  get moveStart() {
    return this.#moveStart;
  }

  addShape(shape) {
    this.#shapes.push(shape);
    this.#valid = false;
  }

  removeShape(shape) {
    const l = this.#shapes.length;
    for (let i = l - 1; i >= 0; i--) {
      if (this.#shapes[i].id === shape.id) {
        this.#selection = null;
        this.#valid = false;
        this.#shapes = this.#shapes.filter((s) => s.id !== shape.id);
      }
      if (
        shape.type === "station" &&
        this.#shapes[i]?.type === "connection" &&
        this.#shapes[i].includes(shape)
      ) {
        this.removeShape(this.#shapes[i]);
      } else if (shape.type === "connection") {
        // need to make sure we take it out of the station connection arrays
        const start = shape.start;
        const end = shape.end;
        if (start.type === "station" && end.type !== "station") {
          for (let j = 0; j < start.connections.length; j++) {
            if (start.connections && start.connections[j].id === shape.id) {
              start.connections.splice(j, 1);
            }
          }
        } else if (end.type === "station" && start.type !== "station") {
          for (let j = 0; j < end.connections.length; j++) {
            if (end.connections && end.connections[j].id === shape.id) {
              end.connections.splice(j, 1);
            }
          }
        }
      }
    }
  }

  removeShapes(shapes) {
    for (const shape of shapes.importedShapes) {
      this.removeShape(shape);
    }
  }

  addShapes(shapes) {
    for (const shape of shapes.importedShapes) {
      this.addShape(shape);
    }
  }

  modifyShape(id, x, y) {
    // would be better to switch that to an options {}
    const l = this.#shapes.length;
    for (let i = l - 1; i >= 0; i--) {
      if (this.#shapes[i].id === id) {
        this.#shapes[i].x = x;
        this.#shapes[i].y = y;
        this.#valid = false;
        return;
      }
    }
  }

  clear() {
    this.#ctx.clearRect(0, 0, this.#width, this.#height);
  }

  draw() {
    if (!this.#valid) {
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
          shape.type === "connection" &&
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
          shape.type === "station" &&
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

        if (mySel.shape === "square") {
          ctx.strokeRect(
            mySel.x - this.#selectionOffset,
            mySel.y - this.#selectionOffset,
            mySel.w + 2 * this.#selectionOffset,
            mySel.h + 2 * this.#selectionOffset
          );
        } else if (mySel.shape === "circle") {
          const path = new Path2D();
          const xCenter = mySel.x + mySel.w / 2;
          const yCenter = mySel.y + mySel.h / 2;
          path.arc(xCenter, yCenter, mySel.w / 2 + 3, 0, 2 * Math.PI, false);
          ctx.stroke(path);
          ctx.closePath();
        } else if (mySel.shape === "triangle") {
          const path = new Path2D();
          path.moveTo(mySel.x + mySel.w / 2, mySel.y - 5);
          path.lineTo(
            mySel.x + mySel.w + mySel.w / 5 + 5,
            mySel.y + mySel.h + 2.5
          );
          path.lineTo(mySel.x - mySel.w / 5 - 5, mySel.y + mySel.h + 2.5);
          path.closePath();
          ctx.stroke(path);
        } else if (mySel.shape === "diamond") {
          const path = new Path2D();
          path.moveTo(mySel.x + mySel.w / 2, mySel.y - 4);
          path.lineTo(mySel.x + mySel.w + 4, mySel.y + mySel.h / 2);
          path.lineTo(mySel.x + mySel.w / 2, mySel.y + mySel.h + 4);
          path.lineTo(mySel.x - 4, mySel.y + mySel.h / 2);
          path.closePath();
          ctx.stroke(path);
        } else if (mySel.shape === "star") {
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
      canvas.offsetLeft +
      this.#stylePaddingLeft +
      this.#styleBorderLeft +
      this.#htmlLeft;
    offsetY +=
      canvas.offsetTop +
      this.#stylePaddingTop +
      this.#styleBorderTop +
      this.#htmlTop;

    return { x: offsetX, y: offsetY };
  }

  enableDarkMode(b) {
    if (b) {
      this.#bgColor = "#343434";
      this.#selectionColor = "#dcefe6";
    } else {
      this.#bgColor = "#FFFFFF";
      this.#selectionColor = "#3e6659";
    }
    this.#valid = false;
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
