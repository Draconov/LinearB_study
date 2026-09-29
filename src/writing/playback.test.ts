import {expect,it} from 'vitest';
import {guidePlayback} from './playback';
it('pauses and resumes without completing or restarting a stroke',()=>{let s=guidePlayback({step:0,elapsed:0,playing:false},{type:'play'},4);s=guidePlayback(s,{type:'tick',ms:350},4);s=guidePlayback(s,{type:'pause'},4);expect(s.elapsed).toBe(350);s=guidePlayback(s,{type:'play'},4);s=guidePlayback(s,{type:'tick',ms:200},4);expect(s.elapsed).toBe(550);});
it('replay restarts even during the first segment',()=>{expect(guidePlayback({step:0,elapsed:500,playing:true},{type:'replay'},4)).toEqual({step:0,elapsed:0,playing:true});});
it('finishes on the last segment and never advances past it',()=>{expect(guidePlayback({step:2,elapsed:1000,playing:true},{type:'tick',ms:3000},4)).toEqual({step:3,elapsed:1400,playing:false});});
