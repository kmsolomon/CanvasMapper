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
  #dragoffx = 0;
  #dragoffy = 0;
  #myState = this;
  #selectionColor = "#CC0000";
  #selectionWidth = 2;
  #interval = 30;
  // TODO -- I feel like there's a better way to do this/shouldn't be accessing these within the state
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

    // setInterval(function () {
    //   this.draw();
    // }, this.#interval);
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

  addShape(shape) {
    this.#shapes.push(shape);
    this.#valid = false;
    console.log("updated shapes array", this.#shapes);
  }

  removeShape(shape) {
    const l = this.#shapes.length;
    for (let i = l - 1; i >= 0; i--) {
      if (this.#shapes[i].id === shape.id) {
        this.#selection = null;
        this.#valid = false;
        this.#shapes.splice(i, 1);
      }
      if (this.#shapes[i] && this.#shapes[i].type === "connection") {
        if (this.#shapes[i].includes(shape)) {
          this.removeShape(this.#shapes[i]);
        }
      }
      if (shape.type === "connection") {
        // need to make sure we take it out of the station connection arrays
        const start = shape.start;
        const end = shape.end;
        if (start.type === "station" && end.type === "station") {
          return;
        }
        if (start.type === "station") {
          for (let j = 0; j < start.connections.length; j++) {
            if (start.connections && start.connections[j].id === shape.id) {
              start.connections.splice(j, 1);
            }
          }
        }
        if (end.type === "station") {
          for (let j = 0; j < end.connections.length; j++) {
            if (end.connections && end.connections[j].id === shape.id) {
              end.connections.splice(j, 1);
            }
          }
        }
      }
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
      console.log("redraw!", this.#shapes);
      const ctx = this.#ctx;
      const shapes = this.#shapes;
      this.clear();
      ctx.fillStyle = "#FFF";
      ctx.fillRect(0, 0, this.#width, this.#height); // Draw white background so it's not transparent when downloaded'
      // draw all shapes
      // TODO REFACTOR -- Why is the loop for connections and stations separate?
      // want to draw connections first
      for (const shape of shapes) {
        if (shape === undefined) {
          console.error("something went wrong");
          return;
        }
        if (shape.type == "connection") {
          // We can skip the drawing of elements that have moved off the screen:
          if (
            shape.x > this.#width ||
            shape.y > this.#height ||
            shape.x + shape.w < 0 ||
            shape.y + shape.h < 0
          ) {
            continue;
          }
          shape.draw(ctx);
        }
      }

      // now draw the stations
      for (const shape of shapes) {
        console.log("shape!", shape);
        if (shape === undefined) {
          console.error("something went wrong");
          return;
        }
        if (shape.type == "station") {
          // We can skip the drawing of elements that have moved off the screen:
          if (
            shape.x > this.#width ||
            shape.y > this.#height ||
            shape.x + shape.w < 0 ||
            shape.y + shape.h < 0
          ) {
            console.log("f");
            continue;
          }
          console.log("should draw shape");
          shape.draw(ctx);
        }
      }

      // draw selection
      // right now this is just a stroke along the edge of the selected Shape
      if (this.#selection != null) {
        ctx.strokeStyle = this.#selectionColor;
        ctx.lineWidth = this.#selectionWidth;
        const mySel = this.#selection;
        ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
      }

      this.#valid = true;
    }
  }

  // TODO REFACTOR -- I suspect I shouldn't have this within the actual class
  getMouse(e) {
    const element = this.#canvas;
    let offsetX = 0,
      offsetY = 0,
      mx,
      my;

    if (element.offsetParent !== undefined) {
      // TODO I have no idea what the below does?
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    offsetX += this.#stylePaddingLeft + this.#styleBorderLeft + this.#htmlLeft;
    offsetY += this.#stylePaddingTop + this.#styleBorderTop + this.#htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;

    return { x: mx, y: my };
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
