import Station from "./station";
import { LineStyle, Point } from "./types";

export default class Connection {
  #start: Station | Point;
  #end: Station | Point;
  #color: string;
  #width: number;
  #stationMidpoint: number = 15;
  #path: Path2D | null = null;
  #style: LineStyle = "solid";
  #id: string;
  type: string = "connection";
  constructor(
    start: Station | Point,
    end: Station | Point,
    cnum: string,
    color: string = "#000000",
    style: LineStyle = "solid",
    width: number = 2
  ) {
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

  static clone(original: Connection): Connection {
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

  set start(s: Station | Point) {
    this.#start = s;
  }

  get end() {
    return this.#end;
  }

  set end(e: Station | Point) {
    this.#end = e;
  }

  get id() {
    return this.#id;
  }

  get width() {
    return this.#width;
  }

  set width(n: number) {
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

  set style(s: LineStyle) {
    this.#style = s;
  }

  get color() {
    return this.#color;
  }

  set color(n: string) {
    if (/^#[0-9A-F]{6}$/i.test(n)) {
      this.#color = n;
    }
  }

  static getLinePattern(n: LineStyle): number[] {
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

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.#color;
    ctx.lineWidth = this.#width;
    ctx.setLineDash(Connection.getLinePattern(this.#style));
    const path = new Path2D();
    path.moveTo(
      this.#start.x + this.#stationMidpoint,
      this.#start.y + this.#stationMidpoint
    );
    if (this.#end instanceof Station) {
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

  contains(mx: number, my: number): boolean {
    const canvas = <HTMLCanvasElement | null>(
      document.getElementById("workspace")
    );
    const ctx = canvas ? canvas.getContext("2d") : null;
    let contained = false;
    if (canvas === null || ctx === null || this.#path === null) {
      return false;
    } else if (this.#width < 6) {
      ctx.lineWidth = 6; // tolerance to make it easier to select a line
    } else {
      ctx.lineWidth = this.#width;
    }
    contained = ctx.isPointInStroke(this.#path, mx, my);
    ctx.lineWidth = this.#width;
    return contained;
  }

  includes(s: Station): boolean {
    let hasStation = false;
    if (this.#start instanceof Station && this.#start.id === s.id) {
      hasStation = true;
    }
    if (this.#end instanceof Station && this.#end.id === s.id) {
      hasStation = true;
    }
    return hasStation;
  }

  toJSON(): string {
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
