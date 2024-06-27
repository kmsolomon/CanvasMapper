// define(["jquery", "station"], function ($, station) {
//   // A connection takes a starting Station and an end Station and draws a line between the two
//   function Connection(start, end, color, width) {
//     console.log("new connection");
//     if (start && end) {
//       this.start = start;
//       this.end = end;
//       this.color = color || "#000000";
//       this.width = width || 2;
//       this.id = "c" + cnum;
//       this.type = "connection";
//       cnum++;
//     } else {
//       console.error(
//         "Connection could not be created. Connections need both a start and end."
//       );
//     }
//   }

//   Connection.prototype = {
//     draw: function (ctx) {
//       ctx.strokeStyle = this.color;
//       ctx.lineWidth = this.width;
//       ctx.beginPath();
//       ctx.moveTo(this.start.x + 15, this.start.y + 15); // will eventually want to do some fixing up to make sure the line starts on the correct side
//       if (this.end.type == "station") {
//         ctx.lineTo(this.end.x + 15, this.end.y + 15);
//       } else {
//         ctx.lineTo(this.end.x, this.end.y);
//       }
//       ctx.stroke();
//     },

//     contains: function (mx, my) {
//       var padding = 2;
//       return (
//         this.x <= mx &&
//         this.x + padding >= mx &&
//         this.y <= my &&
//         this.y + padding >= my
//       );
//     },

//     includes: function (s) {
//       return this.end.id === s.id || this.start.id === s.id;
//     },
//   };

//   return Connection;
// });

export default class Connection {
  #start;
  #end;
  #color;
  #width;
  #padding = 2;
  #id;
  type = "connection";
  constructor(start, end, cnum, color = "#000000", width = 2) {
    this.#start = start;
    this.#end = end;
    this.#color = color;
    this.#width = width;
    this.#id = `c${cnum}`;

    this.draw = this.draw.bind(this);
    this.contains = this.contains.bind(this);
    this.includes = this.includes.bind(this);
    console.log("connection end", end);
  }

  get start() {
    return this.#start;
  }

  get end() {
    return this.#end;
  }

  set end(e) {
    // TODO, checking end is a valid station/obj
    this.#end = e;
  }

  draw(ctx) {
    ctx.strokeStyle = this.#color;
    ctx.lineWidth = this.#width;
    ctx.beginPath();
    // TODO why 15? and should switch that to variable
    ctx.moveTo(this.#start.x + 15, this.#start.y + 15); // will eventually want to do some fixing up to make sure the line starts on the correct side
    if (this.#end.type == "station") {
      ctx.lineTo(this.#end.x + 15, this.#end.y + 15);
    } else {
      ctx.lineTo(this.#end.x, this.#end.y);
    }
    ctx.stroke();
  }

  // TODO - I have no idea where the x and y were coming from????
  contains(mx, my) {
    console.log("connection contains!");
    return false;
    // return (
    //   this.#x <= mx &&
    //   this.#x + this.#padding >= mx &&
    //   this.#y <= my &&
    //   this.#y + this.#padding >= my
    // );
  }

  includes(s) {
    return this.#end.id === s.id || this.#start.id === s.id;
  }
}
