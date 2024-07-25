export function getEventMouseCoords(e, offset = { x: 0, y: 0 }) {
  let mouse = null;
  if (
    (e.type === "touchstart" ||
      e.type === "touchmove" ||
      e.type === "touchend") &&
    e.changedTouches?.length > 0
  ) {
    mouse = {
      x: e.changedTouches[0].pageX - offset.x,
      y: e.changedTouches[0].pageY - offset.y,
    };
  } else {
    mouse = { x: e.pageX - offset.x, y: e.pageY - offset.y };
  }
  return mouse;
}

export function roundNum(x) {
  const multi = Math.pow(10, 2 || 0);
  return Math.round(x * multi) / multi;
}
