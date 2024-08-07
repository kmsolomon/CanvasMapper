import { Point } from "./types";

export function getEventMouseCoords(
  e: TouchEvent | MouseEvent,
  offset = { x: 0, y: 0 }
): Point | null {
  let mouse: Point | null = null;
  if (
    e instanceof TouchEvent &&
    (e.type === "touchstart" ||
      e.type === "touchmove" ||
      e.type === "touchend") &&
    e.changedTouches?.length > 0
  ) {
    mouse = {
      x: e.changedTouches[0].pageX - offset.x,
      y: e.changedTouches[0].pageY - offset.y,
    };
  } else if (e instanceof MouseEvent) {
    mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
  }
  return mouse;
}

export function roundNum(x: number): number {
  const multi = Math.pow(10, 2 || 0);
  return Math.round(x * multi) / multi;
}
