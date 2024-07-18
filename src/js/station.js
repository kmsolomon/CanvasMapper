export default class Station {
  #x = 0;
  #y = 0;
  #w = 1;
  #h = 1;
  #fill = "#AAAAAA";
  #name = null;
  #xcoord = 0;
  #ycoord = 0;
  #zcoord = 0;
  #smallPadding = 5;
  #largePadding = 10;
  #id = null; // TODO need way to get and increment snum
  #connections = new Array();
  type = "station";

  constructor(x, y, w, h, fill, snum) {
    this.#x = x;
    this.#y = y;
    this.#w = w;
    this.#h = h;
    if (/^#[0-9A-F]{6}$/i.test(fill)) {
      this.#fill = fill;
    }
    this.#id = snum;
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
      original.id
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
    ctx.fillRect(this.#x, this.#y, this.#w, this.#h);

    if (this.#name !== null) {
      ctx.font = "12px Courier";
      const metrics = ctx.measureText(this.#name);
      const center = metrics.width / 2 - 15;
      const halfStation = this.#w / 2;
      ctx.fillStyle = "#FFF";
      ctx.fillRect(
        this.#x - center,
        this.#y + this.#h + this.#smallPadding,
        metrics.width,
        halfStation
      );
      ctx.fillStyle = "#000";
      ctx.fillText(
        this.#name,
        this.#x - center,
        this.#y + this.#h + this.#largePadding
      );
    }
  }

  contains(mx, my) {
    return (
      this.#x <= mx &&
      this.#x + this.#w >= mx &&
      this.#y <= my &&
      this.#y + this.#h >= my
    );
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

  updateValues() {
    console.log("todo update values");
    // this.name = $("#stNameInput").val();
    // this.xcoord = $("#stXInput").val();
    // this.ycoord = $("#stYInput").val();
    // this.zcoord = $("#stZInput").val();
  }
}
