// 내 크로스 시나리오: 내 선수를 측면에 두고 hold초 뒤 높은 크로스 → 4초 관찰. 동료 헤딩 슛·골 비율
const {chromium}=require('playwright'); const FILE=process.argv[2]; const N=+process.argv[3]||40; const HOLD=+process.argv[4]||1.2;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async([N,HOLD])=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  const C={n:0,box0:0,boxAtCross:0,head:0,goal:0,def:0,none:0}; let cur=null;
  const oH=header; header=function(pl,b){ const wasX=b.crossH; const r=oH.apply(this,arguments); if(cur&&wasX&&!cur.done){ cur.done=1; const k=M.ball.lastKicker; if(k&&k.team===0&&(M.ball.hdr||M.ball.pHead)){ C.head++; cur.head=1; } else if(k&&k.team===1) C.def++; } return r; };
  const oG=goalScored; goalScored=function(){ if(cur&&cur.head&&!cur.g){ cur.g=1; C.goal++; } return oG.apply(this,arguments); };
  S.clubId='kr-1-0'; Object.keys(S.player.stats).forEach(k=>S.player.stats[k]=CLUBS[S.clubId].str); S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; { const ev=nextEvent(); ev.opp=CLUBS['kr-1-1']; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; } { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.chanceReq=false; M.chance=null; const oFT=fullTime; fullTime=function(){}; let t=performance.now();
  const step=sec=>{ const n=Math.round(sec*30); for(let i=0;i<n;i++){ t+=33.3; lastT=t-33.3; loop(t); if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); M.freeze=Math.min(M.freeze||0,0); M.min=Math.min(M.min,40); } };
  step(3);
  for(let k=0;k<N;k++){ const side=k%2?1:-1; M.setPiece=null; M.freeze=0; const u=M.user; u.stun=0; u.x=W/2+side*(W/2-7); u.y=24; u.vx=u.vy=0; setOwner(u); M.ball.x=u.x; M.ball.y=u.y; M.ball.z=0; M.ball.vx=M.ball.vy=M.ball.vz=0;
    M.players.forEach(q=>{ if(q===u||q.role==='GK') return; q.stun=0; const dir=q.team===0?-1:1; if(q.team===0){ q.x=clamp(q.hx,4,W-4); q.y=clamp(24+(q.hy-H*0.5)*0.55+10,20,70); } else { q.x=clamp(W/2+(q.hx-W/2)*0.7,6,W-6); q.y=clamp(6+(H-q.hy)*0.32,5,40); } q.vx=q.vy=0; q.runT=0; q.thruT=0; }); M.t+=0; 
    step(0.1); C.box0+=boxMates().length; for(let i=0;i<Math.round(HOLD*30);i++){ if(M.ball.owner!==u){ setOwner(u); } u.x=W/2+side*(W/2-7); u.y=Math.max(14,24-i*0.2); M.ball.x=u.x; M.ball.y=u.y; step(1/30); }
    if(M.ball.owner!==u) setOwner(u); C.n++; C.boxAtCross+=boxMates().length; cur={}; u.touchT=0; u.kickCd=0; userCross(u,0,0,0.9,'high'); step(4); if(!cur.done) C.none++; cur=null; }
  fullTime=oFT; const o={n:C.n,'크로스 순간 박스 안 동료(평균)':+(C.boxAtCross/C.n).toFixed(2),'동료 헤딩슛 %':Math.round(C.head/C.n*100),'헤딩골 %':Math.round(C.goal/C.n*100),'수비가 걷어냄 %':Math.round(C.def/C.n*100),'아무도 못 닿음 %':Math.round(C.none/C.n*100)}; return o; },[N,HOLD]);
 console.log(JSON.stringify(R)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
