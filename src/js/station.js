// define('station',
//   ['jquery', 'spectrum'],
//   function ($, Spectrum) {
//     function Station(x, y, w, h, fill) {
//       this.x = x || 0;
//       this.y = y || 0;
//       this.w = w || 1;
//       this.h = h || 1;
//       this.fill = fill || '#AAAAAA';
//       this.name = null;
//       this.xcoord = 0;
//       this.ycoord = 0;
//       this.zcoord = 0;
//       this.id = "s" + snum;
//       this.type = "station";
//       this.connections = new Array();
//       snum++;
//     }

//     Station.prototype = {
//       draw: function(ctx) {
//         ctx.fillStyle = this.fill;
//         ctx.fillRect(this.x, this.y, this.w, this.h);

//         if(this.name !== null){
//           ctx.font = '12px Courier';
//           var metrics = ctx.measureText(this.name);
//           var width = metrics.width;
//           var center = width/2 - 15;
//           var halfStation = this.w/2;
//           var smallpad = 5;
//           var largepad = 10;
//           ctx.fillStyle = '#FFF';
//           ctx.fillRect(this.x-center, this.y + this.h + smallpad, width, halfStation);
//           ctx.fillStyle = '#000';
//           ctx.fillText(this.name, this.x-center, this.y+this.h+largepad);
//         }
//       },

//       contains: function(mx, my) {
//         return  (this.x <= mx) && (this.x + this.w >= mx) &&
//         (this.y <= my) && (this.y + this.h >= my);
//       },

//       displayProperties: function(state) {
//         var station = this;
//         var initialFill = this.fill;
//         $("#propdiv").empty();

//         var properties = "<table id='stProperties'><tr><td id='stNameLabel'>Name: </td><td id='stNameField'><input type='text' id='stNameInput' /></td></tr>";
//         properties += "<tr><td id='stXLabel'>X: </td><td id='stXField'><input type='text' id='stXInput' /></td></tr>";
//         properties += "<tr><td id='stYLabel'>Y: </td><td id='stYField'><input type='text' id='stYInput' /></td></tr>";
//         properties += "<tr><td id='stZLabel'>Z: </td><td id='stZField'><input type='text' id='stZInput' /></td></tr>";
//         properties += "<tr><td id='stColorLabel'>Color: </td><td id='stColorField'><input type='text' id='custom' /></td></tr>";
//         properties += "</table>";

//         $('#propdiv').append(properties);
//         $('#stNameInput').val(station.name);
//         $('#stXInput').val(station.xcoord);
//         $('#stYInput').val(station.ycoord);
//         $('#stZInput').val(station.zcoord);
//         $("#custom").spectrum({
//           clickoutFiresChange: true,
//           showPaletteOnly: true,
//           togglePaletteOnly: true,
//           togglePaletteMoreText: 'more',
//           togglePaletteLessText: 'less',
//           color: initialFill,
//           palette: [
//             ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
//             ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
//             ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
//             ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
//             ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
//             ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
//             ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
//             ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
//           ],
//             change: function(color) {
//                 station.fill = color.toHexString();
//                 state.valid = false;
//             }
//         });

//         $("#stProperties").focusout( function() {
//             var name = $("#stNameInput").val();
//             var x = $("#stXInput").val();
//             var y = $("#stYInput").val();
//             var z = $("#stZInput").val();
//             station.name = name;
//             station.xcoord = x;
//             station.ycoord = y;
//             station.zcoord = z;
//             state.valid = false;
//         });

//       },

//       updateValues: function() {
//         this.name = $("#stNameInput").val();
//         this.xcoord = $("#stXInput").val();
//         this.ycoord = $("#stYInput").val();
//         this.zcoord = $("#stZInput").val();
//       }

//     };

//     return Station;

//   }
// );

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
    this.#fill = fill;
    this.#id = `s${snum}`;
    this.draw = this.draw.bind(this);
    this.contains = this.contains.bind(this);
  }

  draw(ctx) {
    console.log(
      "draw station!",
      this.#x,
      this.#y,
      this.#w,
      this.#h,
      this.#fill
    );
    ctx.fillStyle = this.#fill;
    ctx.fillRect(this.#x, this.#y, this.#w, this.#h);

    if (this.#name !== null) {
      ctx.font = "12px Courier";
      const metrics = ctx.measureText(this.#name);
      const center = width / 2 - 15;
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

  // Don't like this at all!
  displayProperties(state) {
    console.log("todo -- display properties but make it cleaner");
    // var station = this;
    // var initialFill = this.fill;
    // $("#propdiv").empty();

    // var properties =
    //   "<table id='stProperties'><tr><td id='stNameLabel'>Name: </td><td id='stNameField'><input type='text' id='stNameInput' /></td></tr>";
    // properties +=
    //   "<tr><td id='stXLabel'>X: </td><td id='stXField'><input type='text' id='stXInput' /></td></tr>";
    // properties +=
    //   "<tr><td id='stYLabel'>Y: </td><td id='stYField'><input type='text' id='stYInput' /></td></tr>";
    // properties +=
    //   "<tr><td id='stZLabel'>Z: </td><td id='stZField'><input type='text' id='stZInput' /></td></tr>";
    // properties +=
    //   "<tr><td id='stColorLabel'>Color: </td><td id='stColorField'><input type='text' id='custom' /></td></tr>";
    // properties += "</table>";

    // $("#propdiv").append(properties);
    // $("#stNameInput").val(station.name);
    // $("#stXInput").val(station.xcoord);
    // $("#stYInput").val(station.ycoord);
    // $("#stZInput").val(station.zcoord);
    // $("#custom").spectrum({
    //   clickoutFiresChange: true,
    //   showPaletteOnly: true,
    //   togglePaletteOnly: true,
    //   togglePaletteMoreText: "more",
    //   togglePaletteLessText: "less",
    //   color: initialFill,
    //   palette: [
    //     ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
    //     ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
    //     [
    //       "#f4cccc",
    //       "#fce5cd",
    //       "#fff2cc",
    //       "#d9ead3",
    //       "#d0e0e3",
    //       "#cfe2f3",
    //       "#d9d2e9",
    //       "#ead1dc",
    //     ],
    //     [
    //       "#ea9999",
    //       "#f9cb9c",
    //       "#ffe599",
    //       "#b6d7a8",
    //       "#a2c4c9",
    //       "#9fc5e8",
    //       "#b4a7d6",
    //       "#d5a6bd",
    //     ],
    //     [
    //       "#e06666",
    //       "#f6b26b",
    //       "#ffd966",
    //       "#93c47d",
    //       "#76a5af",
    //       "#6fa8dc",
    //       "#8e7cc3",
    //       "#c27ba0",
    //     ],
    //     [
    //       "#c00",
    //       "#e69138",
    //       "#f1c232",
    //       "#6aa84f",
    //       "#45818e",
    //       "#3d85c6",
    //       "#674ea7",
    //       "#a64d79",
    //     ],
    //     [
    //       "#900",
    //       "#b45f06",
    //       "#bf9000",
    //       "#38761d",
    //       "#134f5c",
    //       "#0b5394",
    //       "#351c75",
    //       "#741b47",
    //     ],
    //     [
    //       "#600",
    //       "#783f04",
    //       "#7f6000",
    //       "#274e13",
    //       "#0c343d",
    //       "#073763",
    //       "#20124d",
    //       "#4c1130",
    //     ],
    //   ],
    //   change: function (color) {
    //     station.fill = color.toHexString();
    //     state.valid = false;
    //   },
    // });

    // $("#stProperties").focusout(function () {
    //   var name = $("#stNameInput").val();
    //   var x = $("#stXInput").val();
    //   var y = $("#stYInput").val();
    //   var z = $("#stZInput").val();
    //   station.name = name;
    //   station.xcoord = x;
    //   station.ycoord = y;
    //   station.zcoord = z;
    //   state.valid = false;
    // });
  }

  updateValues() {
    console.log("todo update values");
    // this.name = $("#stNameInput").val();
    // this.xcoord = $("#stXInput").val();
    // this.ycoord = $("#stYInput").val();
    // this.zcoord = $("#stZInput").val();
  }
}
