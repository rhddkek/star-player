// AI끼리(내 선수도 봇) 경기: 득점·AI 스킬 사용
const {chromium}=require('playwright'); const FILE=process.argv[2]; const N=+process.argv[3]||6;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async(N)=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  S.clubId='kr-1-0'; Object.keys(S.player.stats).forEach(k=>S.player.stats[k]=CLUBS[S.clubId].str); let G=0, sk={}, pg=0; let lastPS=null;
  const oU=aiSkUse; aiSkUse=function(pl,k,name){ sk[pl.team+'_'+k]=(sk[pl.team+'_'+k]||0)+1; if(k==='pass') lastPS={t:M.t,team:pl.team}; return oU.apply(this,arguments); };
  const oG=goalScored; goalScored=function(t){ const team=t===0?0:1; if(lastPS&&lastPS.team===team&&M.t-lastPS.t<8) pg++; return oG.apply(this,arguments); };
  for(let k=0;k<N;k++){ M=null; S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; { const ev=nextEvent(); ev.opp=CLUBS['kr-1-'+(1+k%5)]; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; } { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true; M.chanceReq=false; M.chance=null;
    const oFT=fullTime; let over=false; fullTime=function(){ over=true; M.over=true; }; let fr=0, t=performance.now();
    while(!over&&fr<9000){ t+=33.3; lastT=t-33.3; try{ loop(t); }catch(e){ return {err:String(e.stack).slice(0,300)}; } fr++; if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); M.chanceReq=false; }
    G+=M.score[0]+M.score[1]; fullTime=oFT; }
  return {'경기':N,'골/경기':+(G/N).toFixed(2),'AI 스킬':sk,'AI 스루 스킬 뒤 8초 안 골':pg}; },N);
 console.log(JSON.stringify(R)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
