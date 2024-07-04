// define([
//   "jquery",
//   "undoredo",
//   "historystep",
//   "station",
//   "connection",
// ], function ($, UndoRedo, HistoryStep, Station, Connection) {
//   return {
//     click: function (e, state) {},

//     mouseDown: function (e, state) {
//       var selection = state.selection;
//       selection.displayProperties(state);
//       state.dragging = true;
//       UndoRedo.addToUndoHistory(
//         new HistoryStep("move", {
//           id: selection.id,
//           x: selection.x,
//           y: selection.y,
//         })
//       );
//     },
//   };
// });
//
