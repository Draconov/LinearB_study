export type SignId = string;
export type SourceId = "unicode-syllabary" | "unicode-core" | "cambridge";
export interface Sign { id: SignId; glyph: string; codePoint: number; number: string; family: string; note: string; sourceIds: SourceId[] }
export type Lesson = {id:string;kind:"workshop";title:string;workshopId:string} | { id: string; kind: "intro"; title: string; paragraphs: string[] } | { id: string; kind: "signs"; title: string; signIds: SignId[]; paragraphs: string[] } | { id: string; kind: "reading"; title: string; readingId: string };
export interface Reading { id: string; title: string; signIds: SignId[]; transliteration: string; interpretation: string; explanation: string; sourceId: "cambridge"; prerequisiteLessonIds: string[] }

