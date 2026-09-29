// storage.test.ts
import { expect, test } from "vitest";
import { loadProgress, saveProgress } from "./storage";
for (const raw of ['{broken', '{"version":99}', '{"version":1,"cards":null}']) {
  test("preserves unsafe stored data: " + raw, () => {
    let value = raw;
    const storage = { getItem: () => value, setItem: (_k: string, v: string) => { value = v; } };
    const loaded = loadProgress(storage);
    expect(loaded.canWrite).toBe(false);
    expect(saveProgress(storage, loaded.progress, loaded.canWrite)).toBe("read-only");
    expect(value).toBe(raw);
  });
}
test("blocked storage is a usable session with no save promise", () => {
  const storage = { getItem: (): string | null => { throw new Error("blocked"); },
    setItem: (): void => { throw new Error("blocked"); } };
  expect(loadProgress(storage).status).toBe("blocked");
});
test("quota failure is surfaced without corrupting session progress", () => {
 const loaded=loadProgress({getItem:()=>null,setItem:()=>{}});
 expect(saveProgress({getItem:()=>null,setItem:()=>{throw new Error('quota');}},loaded.progress,true)).toBe('blocked');
 expect(loaded.progress.version).toBe(1);
});
