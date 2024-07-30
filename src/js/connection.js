export default class Connection {
  #start;
  #end;
  #color;
  #width;
  #stationMidpoint = 15;
  #path;
  #padding = 2;
  #style = "solid";
  #id;
  type = "connection";
  constructor(start, end, cnum, color = "#000000", style = "solid", width = 2) {
    this.#start = start;
    this.#end = end;
    this.#color = color;
    this.#width = width;
    this.#id = cnum;
    this.#style = style;

    this.draw = this.draw.bind(this);
    this.contains = this.contains.bind(this);
    this.includes = this.includes.bind(this);
    this.toJSON = this.toJSON.bind(this);
  }

  static clone(original) {
    const cloned = new Connection(
      original.start,
      original.end,
      original.id,
      original.color,
      original.style,
      original.width
    );
    return cloned;
  }

  get start() {
    return this.#start;
  }

  set start(s) {
    this.#start = s;
  }

  get end() {
    return this.#end;
  }

  set end(e) {
    // TODO, checking end is a valid station/obj
    this.#end = e;
  }

  get id() {
    return this.#id;
  }

  get width() {
    return this.#width;
  }

  set width(n) {
    if (n >= 1 && n <= 100) {
      this.#width = Math.floor(n);
    } else if (n > 100) {
      throw new Error("Error line width must be less than 100");
    } else {
      throw new Error("Error line width must be at least 1");
    }
  }

  get style() {
    return this.#style;
  }

  set style(s) {
    if (
      s === "solid" ||
      s === "dash" ||
      s === "large-dash" ||
      s === "dots" ||
      s === "dash-dot"
    ) {
      this.#style = s;
    }
  }

  get color() {
    return this.#color;
  }

  set color(n) {
    if (/^#[0-9A-F]{6}$/i.test(n)) {
      this.#color = n;
    }
  }

  static getLinePattern(n) {
    switch (n) {
      case "solid":
        return [];
      case "dash":
        return [6, 6];
      case "large-dash":
        return [20, 4];
      case "dots":
        return [2, 2];
      case "dash-dot":
        return [16, 4, 2, 4];
      default:
        return [];
    }
  }

  draw(ctx) {
    ctx.strokeStyle = this.#color;
    ctx.lineWidth = this.#width;
    ctx.setLineDash(Connection.getLinePattern(this.#style));
    const path = new Path2D();
    path.moveTo(
      this.#start.x + this.#stationMidpoint,
      this.#start.y + this.#stationMidpoint
    );
    if (this.#end.type == "station") {
      path.lineTo(
        this.#end.x + this.#stationMidpoint,
        this.#end.y + this.#stationMidpoint
      );
    } else {
      path.lineTo(this.#end.x, this.#end.y);
    }

    ctx.stroke(path);
    ctx.closePath();
    ctx.setLineDash([]); // reset back to solid
    this.#path = path;
  }

  contains(mx, my) {
    const canvas = document.getElementById("workspace");
    const ctx = canvas.getContext("2d");
    let contained = false;
    if (this.#width < 6) {
      ctx.lineWidth = 6; // tolerance to make it easier to select a line
    } else {
      ctx.lineWidth = this.#width;
    }
    contained = ctx.isPointInStroke(this.#path, mx, my);
    ctx.lineWidth = this.#width;
    return contained;
  }

  includes(s) {
    return this.#end.id === s.id || this.#start.id === s.id;
  }

  toJSON() {
    const obj = {
      id: this.#id,
      type: this.type,
      start: this.#start,
      end: this.#end,
      color: this.#color,
      width: this.#width,
      style: this.#style,
    };

    return JSON.stringify(obj);
  }
}
