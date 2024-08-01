export default class Station {
  #x = 0;
  #y = 0;
  #w = 1;
  #h = 1;
  #fill = "#AAAAAA";
  #borderColor = "#AAAAAA";
  #name = null;
  #xcoord = 0;
  #ycoord = 0;
  #zcoord = 0;
  #smallPadding = 5;
  #largePadding = 12;
  #path = null;
  #shape = "square";
  #id = null;
  #connections = new Array();
  type = "station";

  constructor(x, y, w, h, fill, snum, shape = "square", borderColor) {
    this.#x = x;
    this.#y = y;
    this.#w = w;
    this.#h = h;
    if (/^#[0-9A-F]{6}$/i.test(fill)) {
      this.#fill = fill;
    }
    this.#id = snum;
    if (
      shape === "square" ||
      shape === "circle" ||
      shape === "diamond" ||
      shape === "triangle" ||
      shape === "star"
    ) {
      this.#shape = shape;
    }
    if (/^#[0-9A-F]{6}$/i.test(borderColor)) {
      this.#borderColor = borderColor;
    }
    this.draw = this.draw.bind(this);
    this.contains = this.contains.bind(this);
    this.toJSON = this.toJSON.bind(this);
  }

  static clone(original) {
    const cloned = new Station(
      original.x,
      original.y,
      original.w,
      original.h,
      original.fill,
      original.id,
      original.shape,
      original.borderColor
    );
    cloned.name = original.name;
    cloned.xcoord = original.xcoord;
    cloned.ycoord = original.ycoord;
    cloned.zcoord = original.zcoord;
    cloned.connections = [...original.connections];
    return cloned;
  }

  draw(ctx) {
    ctx.fillStyle = this.#fill;
    ctx.strokeStyle = this.#borderColor;
    ctx.lineWidth = 2;
    // drawing square
    if (this.#shape === null || this.#shape === "square") {
      ctx.fillRect(this.#x, this.#y, this.#w, this.#h);
      ctx.strokeStyle = this.#borderColor;
      ctx.strokeRect(this.#x, this.#y, this.#w, this.#h);
    } else if (this.#shape === "circle") {
      const path = new Path2D();
      const xCenter = this.#x + this.#w / 2;
      const yCenter = this.#y + this.#h / 2;
      path.arc(xCenter, yCenter, this.#w / 2, 0, 2 * Math.PI, false);
      ctx.fill(path);
      ctx.stroke(path);
      ctx.closePath();
      this.#path = path;
    } else if (this.#shape === "diamond") {
      const path = new Path2D();
      path.moveTo(this.#x + this.#w / 2, this.#y);
      path.lineTo(this.#x + this.#w, this.#y + this.#h / 2);
      path.lineTo(this.#x + this.#w / 2, this.#y + this.#h);
      path.lineTo(this.#x, this.#y + this.#h / 2);
      path.closePath();
      this.#path = path;
      ctx.fill(path);
      ctx.stroke(path);
    } else if (this.#shape === "triangle") {
      const path = new Path2D();
      path.moveTo(this.#x + this.#w / 2, this.#y);
      path.lineTo(this.#x + this.#w + this.#w / 5, this.#y + this.#h);
      path.lineTo(this.#x - this.#w / 5, this.#y + this.#h);
      path.closePath();
      this.#path = path;
      ctx.fill(path);
      ctx.stroke(path);
    } else if (this.#shape === "star") {
      const starX = this.#x + this.#w / 2;
      const starY = this.#y + this.#w / 2;
      const starRadius = this.#w / 1.5;
      const path = new Path2D();
      const points = 5;

      path.moveTo(starX, starY - starRadius);
      for (let i = 0; i < 2 * points + 1; i++) {
        const r = i % 2 == 0 ? starRadius : starRadius / 2;
        const a = (Math.PI * i) / points;
        path.lineTo(starX - r * Math.sin(a), starY - r * Math.cos(a));
      }
      path.closePath();
      this.#path = path;
      ctx.fill(path);
      ctx.stroke(path);
    }

    if (this.#name !== null && this.#name !== "") {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const textBg = isDarkMode ? "#343434" : "#FFFFFF";
      const textColor = isDarkMode ? "#dddddd" : "#000000";
      ctx.font = "12px sans-serif";
      const metrics = ctx.measureText(this.#name);
      const center = metrics.width / 2 - 15;
      const halfStation = this.#w / 2;
      ctx.fillStyle = textBg;
      ctx.fillRect(
        this.#x - center - 2,
        this.#y + this.#h,
        metrics.width + 4,
        halfStation
      );
      ctx.fillStyle = textColor;
      ctx.fillText(
        this.#name,
        this.#x - center,
        this.#y + this.#h + this.#largePadding
      );
    }
  }

  contains(mx, my) {
    if (this.#shape === "square") {
      return (
        this.#x <= mx &&
        this.#x + this.#w >= mx &&
        this.#y <= my &&
        this.#y + this.#h >= my
      );
    } else {
      const canvas = document.getElementById("workspace");
      const ctx = canvas.getContext("2d");
      return ctx.isPointInPath(this.#path, mx, my);
    }
  }

  toJSON() {
    const obj = {
      id: this.#id,
      name: this.#name,
      type: "station",
      x: this.#x,
      y: this.#y,
      w: this.#w,
      h: this.#h,
      fill: this.#fill,
      xcoord: this.#xcoord,
      ycoord: this.#ycoord,
      zcoord: this.#zcoord,
      shape: this.#shape,
      borderColor: this.#borderColor,
      smallPadding: this.#smallPadding,
      largePadding: this.#largePadding,
      connections: this.#connections,
    };
    return JSON.stringify(obj);
  }

  get name() {
    return this.#name;
  }

  set name(n) {
    this.#name = n;
  }

  get xcoord() {
    return this.#xcoord;
  }

  set xcoord(n) {
    this.#xcoord = n;
  }

  get ycoord() {
    return this.#ycoord;
  }

  set ycoord(n) {
    this.#ycoord = n;
  }

  get zcoord() {
    return this.#zcoord;
  }

  set zcoord(n) {
    this.#zcoord = n;
  }

  get fill() {
    return this.#fill;
  }

  set fill(n) {
    if (/^#[0-9A-F]{6}$/i.test(n)) {
      this.#fill = n;
    }
  }

  get x() {
    return this.#x;
  }

  set x(n) {
    this.#x = n;
  }

  get y() {
    return this.#y;
  }

  set y(n) {
    this.#y = n;
  }

  get id() {
    return this.#id;
  }

  get w() {
    return this.#w;
  }

  get h() {
    return this.#h;
  }

  get connections() {
    return this.#connections;
  }

  set connections(c) {
    this.#connections = c;
  }

  get shape() {
    return this.#shape;
  }

  set shape(s) {
    if (
      s === "square" ||
      s === "circle" ||
      s === "triangle" ||
      s === "diamond" ||
      s === "star"
    ) {
      this.#shape = s;
    } else {
      throw new Error(`Invalid station shape: ${s}`);
    }
  }

  get borderColor() {
    return this.#borderColor;
  }

  set borderColor(c) {
    if (/^#[0-9A-F]{6}$/i.test(c)) {
      this.#borderColor = c;
    }
  }
}
