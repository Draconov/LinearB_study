import { test, expect } from "vitest";
import { emptyPad, beginStroke, moveStroke, endStroke, normalisePoint } from "./strokes";
test("second pointers and cancellations preserve completed strokes", () => {
  let p = beginStroke(emptyPad(), 1, { x: .1, y: .2 });
  p = moveStroke(p, 1, { x: .3, y: .4 });
  p = endStroke(p, 1, false);
  const finished = p.strokes;
  p = beginStroke(p, 2, { x: .5, y: .5 });
  expect(beginStroke(p, 3, { x: .9, y: .9 })).toEqual(p);
  expect(moveStroke(p, 3, { x: 0, y: 0 })).toEqual(p);
  expect(endStroke(p, 2, true).strokes).toEqual(finished);
});
test("coordinates stay proportional across viewport sizes", () => {
  const small = normalisePoint(50, 50, { left: 0, top: 0, width: 100, height: 100 });
  const large = normalisePoint(100, 100, { left: 0, top: 0, width: 200, height: 200 });
  expect(small).toEqual(large);
});
