import { test, expect } from "vitest";
import { claimAnswer, makePrompt } from "./prompts";
test("one prompt can be claimed once", () => {
  const handled = new Set<string>();
  expect(claimAnswer(handled, "p1")).toBe(true);
  expect(claimAnswer(handled, "p1")).toBe(false);
});
test("a small pool creates unique options including the answer", () => {
  const p = makePrompt("a", ["a", "e", "e"], "sign-to-reading", "p1");
  expect(new Set(p.optionIds).size).toBe(p.optionIds.length);
  expect(p.optionIds).toContain("a");
  expect(p.optionIds.every(id => ["a", "e"].includes(id))).toBe(true);
});
