import type {SignId} from "../content/types";
export type PracticeSkill = "recognition" | "writing";
export interface ReviewCard { signId: SignId; skill: PracticeSkill; intervalIndex: number; dueAt: number; retry: boolean }
export interface Progress { version: 1; completedLessonIds: string[]; cursor: {lessonId:string;step:number}|null; cards:Record<string,ReviewCard>; stats:Record<string,{successes:number;failures:number}>;recentAttemptIds:string[] }
export interface Outcome { attemptId:string;signId:SignId;skill:PracticeSkill;correct:boolean;now:number;extra:boolean }
