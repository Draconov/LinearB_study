import {expect,it} from 'vitest';
import {lessons,lessonStepLimit} from './lessons';
import {workshops,chapters} from './workshops';
import {studioExercises} from './studio';
import {tabletPassages} from './tablets';
import {loadProgress} from '../progress/storage';
import {emptyProgress} from '../progress/review';
it('extends the course with ten complete sourced workshops',()=>{expect(lessons).toHaveLength(28);expect(workshops).toHaveLength(10);expect(chapters).toHaveLength(5);for(const w of workshops){expect(w.options).toContain(w.answer);expect(w.sourceUrl).toMatch(/^https:/);if(w.tabletId)expect(tabletPassages.some(p=>p.id===w.tabletId)).toBe(true);if(w.writingId)expect(studioExercises.some(p=>p.id===w.writingId)).toBe(true);expect(lessonStepLimit(lessons.find(l=>l.id===w.id)!)).toBe(2);}});
it('loads existing course saves and resumes new workshop steps',()=>{const old=emptyProgress();old.completedLessonIds=['intro','vowels'];old.cursor={lessonId:'k',step:13};const storage={getItem:()=>JSON.stringify(old),setItem:()=>{}};expect(loadProgress(storage).status).toBe('ok');old.cursor={lessonId:'spelling-final',step:2};expect(loadProgress(storage).status).toBe('ok');old.cursor.step=3;expect(loadProgress(storage).status).toBe('invalid');});
