import type { SourceId } from "./types";
export const sources: Record<SourceId, {title: string; url: string}> = {
 "unicode-syllabary": { title: "Unicode · Linear B syllabary", url: "https://www.unicode.org/charts/PDF/U10000.pdf" },
 "unicode-core": { title: "Unicode · About Linear B", url: "https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-8/" },
 cambridge: { title: "Cambridge · The decipherment of Linear B", url: "https://www.classics.cam.ac.uk/system/files/documents/process.pdf" }
};
