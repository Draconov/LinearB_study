import { expect, test } from "vitest";
import { signs, signById } from "./signs";
import { lessons } from "./lessons";
import { readings } from "./readings";

test("the beginner course has 59 distinct, valid sign records", () => {
  expect(signs).toHaveLength(59);
  expect(new Set(signs.map(s => s.id)).size).toBe(59);
  expect(new Set(signs.map(s => s.codePoint)).size).toBe(59);
  for (const s of signs) {
    expect(Array.from(s.glyph)).toHaveLength(1);
    expect(s.glyph.codePointAt(0)).toBe(s.codePoint);
    expect(s.sourceIds.length).toBeGreaterThan(0);
  }
});
test("lessons cover every course sign in groups of at most five", () => {
  const taught = lessons.flatMap(l => l.kind === "signs" ? l.signIds : []);
  expect(new Set(taught)).toEqual(new Set(signs.map(s => s.id)));
  for (const l of lessons)
    if (l.kind === "signs") expect(l.signIds.length).toBeLessThanOrEqual(5);
});
test("reading transliterations are derived from real course signs", () => {
  for (const r of readings) {
    expect(r.signIds.every(id => Boolean(signById[id]))).toBe(true);
    expect(r.signIds.join("-")).toBe(r.transliteration);
  }
  expect(readings.find(r => r.id === "knossos")?.signIds)
    .toEqual(["ko", "no", "so"]);
});
