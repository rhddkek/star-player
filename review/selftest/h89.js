// 봇으로 경기 N번 (헤드리스) — 밸런스·멈춤·오류 확인
const fs=require('fs'); const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/';
let base=fs.readFileSync(D+'hbase2.js','utf8'); const bot=fs.readFileSync(D+'selftest/bot.js','utf8');
base=base.replace("const src=fs.readFileSync(process.env.SPJS||'sp.js','utf8')+`","const src=fs.readFileSync(process.env.SPJS||'"+D+"sp.js','utf8')+"+JSON.stringify('\n'+bot+'\n')+"+`").replace(";globalThis.T={",";globalThis.T={botStep,get M2(){return M},nearest,skCost,finishMatch,concludeMatch,");
let seed=+(process.env.SEED||7); Math.random=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
eval(base);
const P=T.S.player; P.mpMax=100; P.equip=[process.env.EQ0||'dash','fire','split','delivery']; if(!P.skills.includes('delivery')) P.skills.push('delivery','split');
const N=+(process.env.N||4); const res=[]; let errs=[];
for(let m=0;m<N;m++){ T.botStep.s=null; let M; try{ T.startMatch(false); M=T.M; M.paused=false; M.freeze=0; M.introT=0; }catch(e){ errs.push('start:'+e.message); continue; }
  let now=Date.now(), last=null, sameOwner=0, prevOwner=null, maxSame=0, frames=0, mpLog=[];
  while(T.M&&frames<30*60*8){ now+=33; frames++; try{ T.botStep(); T.loop(now); }catch(e){ errs.push(e.message.slice(0,120)); break; } const MM=T.M; if(!MM) break; last={stats:{...MM.stats},score:[...MM.score],min:MM.min,mp:MM.mp,ultN:MM.ultN,log:T.botStep.s&&T.botStep.s.log,bench:MM.bench};
    if(MM.ball.owner===prevOwner&&MM.ball.owner) sameOwner++; else { maxSame=Math.max(maxSame,sameOwner); sameOwner=0; } prevOwner=MM.ball.owner; if(frames%300===0) mpLog.push(Math.round(MM.mp)); if(MM.over&&frames>30*60*7) break; }
  res.push({m,frames,min:last&&Math.round(last.min),score:last&&last.score,goals:last&&last.stats.goals,shots:last&&last.stats.shots,onT:last&&last.stats.onT,passes:last&&(last.stats.passOk+'/'+last.stats.passes),tackles:last&&last.stats.tackles,touches:last&&last.stats.touches,skills:last&&last.log&&last.log.sk,mpMin:last&&Math.round(last.log.mpMin),mpLog,maxHoldSec:+(maxSame/30).toFixed(1),bench:last&&last.bench,rating:T.S.history.length?T.S.history[T.S.history.length-1].rating:null}); }
console.log(JSON.stringify(res,null,0)); console.log('errors',errs.slice(0,5));
