//Globals
var stations = new Array(); // The array of Stations
var connections = new Array(); // The array of Connections
var undoHistory = new Array();
var redoHistory = new Array();
var uStep = 0;
var rStep = 0;
var maxHistory = 10; // customizable number of undo/redo steps
var snum = 0; // number we'll use for station ids
var cnum = 0; // number we'll use for connection ids
var state = null;

requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'lib/jquery-1.11.1.min',
        spectrum: 'lib/spectrum/spectrum',
        canvastoBlob: 'lib/canvas-toBlob/canvas-toBlob',
        fileSaver: 'lib/FileSaver/FileSaver.min'
    }
});

requirejs(['jquery', 'undoredo', 'station', 'connection', 'toolbar', 'historystep', 'state', 'spectrum', 'export', 'import'],
function   ($, UndoRedo, Station, Connection, Tools, HistoryStep, CanvasState, Spectrum, Export, Import) {
    
    $('#select').on('click', function(e) { Tools.changeTool(e); });
    $('#addStation').on('click', function(e) { Tools.changeTool(e); });
    $('#addConnection').on('click', function(e) { Tools.changeTool(e); });
    $('#delete').on('click', function(e) { Tools.deletePart(e); });
    $('#undo').on('click', function(e) { UndoRedo.undo(e); });
    $('#redo').on('click', function(e) { UndoRedo.redo(e); });
    
    $('#downloadPNG').on('click', function(e) {Export.exportAsPNG(); });
    
    // TODO Would be nice to be able to resize the canvas later
    var canvas = document.getElementById('workspace');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '600');
    state = new CanvasState(canvas);
    
    $('#downloadJSON').on('click', function(e) {Export.exportAsJSON(state); });
    $('#importFile').on('change', function(e) {Import.importFromJSON(e, state); });
});