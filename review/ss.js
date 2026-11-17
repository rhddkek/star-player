// 슈퍼 세이브 빈도: 리그 수준별 (내 팀·상대 모두 같은 리그 구단)
const {chromium}=require('playwright'); const FILE=process.argv[2]; const N=+process.argv[3]||6; const LG=(process.argv[4]||'kr-2,kr-1,en-1').split(',');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async([N,LG])=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  const out={}; let cnt=0; const oA=aiSkUse; aiSkUse=function(pl,k){ if(k==='save') cnt++; return oA.apply(this,arguments); };
  for(const lg of LG){ const ids=Object.keys(CLUBS).filter(id=>id.startsWith(lg+'-')); let ss=0, onT=0, goals=0;
    for(let k=0;k<N;k++){ M=null; S.clubId=ids[k%ids.length]; Object.keys(S.player.stats).forEach(s=>S.player.stats[s]=CLUBS[S.clubId].str); S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; { const ev=nextEvent(); ev.opp=CLUBS[ids[(k+3)%ids.length]]; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; } { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true; M.chanceReq=false; M.chance=null; cnt=0;
      const oFT=fullTime; let over=false; fullTime=function(){ over=true; M.over=true; }; let fr=0, t=performance.now();
      while(!over&&fr<9000){ t+=33.3; lastT=t-33.3; try{ loop(t); }catch(e){ return {err:String(e.stack).slice(0,300)}; } fr++; if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); M.chanceReq=false; }
      ss+=cnt; onT+=M.tstats[0].onT+M.tstats[1].onT; goals+=M.score[0]+M.score[1]; fullTime=oFT; }
    out[lg]={'경기':N,'슈퍼 세이브/경기':+(ss/N).toFixed(2),'유효 슛/경기':+(onT/N).toFixed(1),'골/경기':+(goals/N).toFixed(2)}; }
  return out; },[N,LG]);
 console.log(JSON.stringify(R)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
