// review.test.ts
import { test, expect } from "vitest";
import { emptyProgress, recordOutcome } from "./review";
const day = 86_400_000;
test("a repeated prompt does not advance a review twice", () => {
  const event = { attemptId: "p1", signId: "a", skill: "recognition" as const,
    correct: true, now: 1000, extra: false };
  const once = recordOutcome(emptyProgress(), event);
  expect(recordOutcome(once, event)).toEqual(once);
  expect(once.cards["recognition:a"].dueAt).toBe(1000 + day);
});
test("early practice keeps a future due date and writing separate", () => {
  const first = { attemptId: "p1", signId: "a", skill: "recognition" as const,
    correct: true, now: 1000, extra: false };
  const p = recordOutcome(emptyProgress(), first);
  const next = recordOutcome(p, { ...first, attemptId: "p2", now: 2000, extra: true });
  expect(next.cards["recognition:a"]).toEqual(p.cards["recognition:a"]);
  expect(next.cards["writing:a"]).toBeUndefined();
});
test("a failure resets the next successful interval", () => {
  const event = { attemptId: "p1", signId: "a", skill: "writing" as const,
    correct: false, now: 1000, extra: false };
  const failed = recordOutcome(emptyProgress(), event);
  const recovered = recordOutcome(failed,
    { ...event, attemptId: "p2", correct: true, now: 2000 });
  expect(recovered.cards["writing:a"].dueAt).toBe(2000 + day);
  expect(recovered.cards["writing:a"].intervalIndex).toBe(0);
});
