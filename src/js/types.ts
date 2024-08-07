import Connection from "./connection";
import Station from "./station";

interface SimplifiedConnection
  extends Omit<
    Connection,
    "start" | "end" | "draw" | "contains" | "includes" | "toJSON"
  > {
  start: string;
  end: string;
}

interface SimplifiedStation
  extends Omit<Station, "connections" | "draw" | "contains" | "toJSON"> {
  connections: string[];
}

type Point = {
  x: number;
  y: number;
};

type LineStyle = "solid" | "dash" | "large-dash" | "dots" | "dash-dot";

export function isTypeLineStyle(s: string): s is LineStyle {
  return ["solid", "dash", "large-dash", "dots", "dash-dot"].includes(s);
}

type StationShape = "square" | "circle" | "diamond" | "triangle" | "star";

export function isTypeStationShape(s: string): s is StationShape {
  return ["square", "circle", "diamond", "triangle", "star"].includes(s);
}

type HistoryType = "add" | "delete" | "move" | "import";

export function isTypeHistoryType(s: string): s is HistoryType {
  return ["add", "delete", "move", "import"].includes(s);
}

type HistoryImport = {
  importedShapes: (Station | Connection)[];
};

type HistoryImportStep = {
  type: "import";
  obj: HistoryImport;
};

type HistoryMove = {
  id: string;
  x: number;
  y: number;
};

type HistoryMoveStep = {
  type: "move";
  obj: HistoryMove;
};

type HistoryAddStep = {
  type: "add";
  obj: Station | Connection;
};

type HistoryDeleteStep = {
  type: "delete";
  obj: Station | Connection;
};

type HistoryDetail =
  | HistoryAddStep
  | HistoryDeleteStep
  | HistoryImportStep
  | HistoryMoveStep;

type Tools = "selectBtn" | "stationBtn" | "connectionBtn";

export type {
  HistoryDetail,
  HistoryImport,
  HistoryMove,
  HistoryMoveStep,
  HistoryType,
  LineStyle,
  Point,
  StationShape,
  Tools,
  SimplifiedConnection,
  SimplifiedStation,
};
