// v91 점검: 수비가 붙은 측면 크로스 결과 + 동료가 띄운 공을 여유 있을 때 잡아 두는지
const {chromium}=require('playwright'); const FILE=process.argv[2]||'/home/claude/star-player/index.html'; const K=+process.argv[3]||60; const GAP=+process.argv[4]||1.6;
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async([K,GAP])=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  const ME='kr-1-0', OPP='kr-1-1'; S.clubId=ME; Object.keys(S.player.stats).forEach(k=>S.player.stats[k]=CLUBS[ME].str); S.player.pos='FW';
  S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; const ev=nextEvent(); ev.opp=CLUBS[OPP]; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.chanceReq=false; M.chance=null;
  fullTime=()=>{}; halfTime=()=>{}; let t=performance.now();
  const C={n:0,blocked:0,body:0,claim:0,first:{},att1st:0,shot:0,goal:0,headShot:0,userAgain:0};
  let cur=null; const oHead=header; header=function(pl,bb){ if(cur&&!cur.first) cur.first=pl.team===0?'attHead':'defHead'; return oHead.apply(this,arguments); };
  const oClaim=gkClaim; gkClaim=function(){ if(cur&&!cur.first) cur.first='claim'; return oClaim.apply(this,arguments); };
  const oPop=popup; popup=function(x,y,s){ if(cur){ if(/크로스 차단/.test(s)) cur.blk=1; if(/몸으로 막/.test(s)) cur.body=1; } return oPop.apply(this,arguments); };
  const oSO=setOwner; setOwner=function(pl){ if(cur&&cur.started&&!cur.first) cur.first=pl.team===0?'attCtrl':'defCtrl'; return oSO.apply(this,arguments); };
  const oGS=goalScored; goalScored=function(){ const s0=M.score[0]; const r=oGS.apply(this,arguments); if(cur&&M.score[0]>s0) cur.goal=true; return r; };
  const step=n=>{ for(let i=0;i<n;i++){ t+=33.3; lastT=t-33.3; loop(t); if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); } };
  step(30); const u=M.user;
  for(let k=0;k<K;k++){ M.freeze=0; M.setPiece=null; cur=null; const side=k%2?1:-1; const ux=W/2+side*rnd(20,27), uy=rnd(12,26);
    u.x=ux; u.y=uy; u.vx=u.vy=0; oSO(u,{clean:true}); u.protT=3; M.ball.z=0;
    const th=M.players.filter(q=>q.team===1&&q.role!=='GK'); const d=th.sort((a,bq)=>dist(a,u)-dist(bq,u))[0]; d.x=u.x-side*GAP*0.7; d.y=u.y-GAP*0.7; d.vx=d.vy=0;
    step(15); if(M.ball.owner!==u){ continue; } d.x=u.x-side*GAP*0.7; d.y=u.y-GAP*0.7;
    cur={started:true}; const s0=M.tstats[0].shots; userCross(u,0,0,0.9,null); const t0=M.t;
    for(let f=0;f<150;f++){ step(1); if(cur.goal||M.freeze>0) break; if(M.t-t0>4.5) break; }
    if(M.ball.owner===u) cur.userAgain=1;
    C.n++; if(cur.blk) C.blocked++; if(cur.body) C.body++; C.first[cur.first||'none']=(C.first[cur.first||'none']||0)+1; if(cur.first==='attHead'||cur.first==='attCtrl') C.att1st++; if(M.tstats[0].shots>s0) C.shot++; if(cur.goal) C.goal++; M.freeze=0; M.setPiece=null; }
  /* 동료가 띄워 준 공: 주변에 상대가 없으면 헤딩으로 걷어내지 않고 잡음 */
  const H2={n:0,ctrl:0}; for(let k=0;k<8;k++){ M.freeze=0; M.setPiece=null; cur=null; const cb=M.players.find(q=>q.team===0&&q.role==='DF'&&!q.isUser); const from=M.players.find(q=>q.team===0&&q.role==='MF'&&!q.isUser); cb.x=W/2+rnd(-10,10); cb.y=H-20; M.players.filter(q=>q.team===1).forEach(q=>{ if(dist(q,cb)<6) q.y=cb.y-12; }); const bb=M.ball; bb.owner=null; bb.x=cb.x; bb.y=cb.y-0.5; bb.z=2.5; bb.vx=0; bb.vy=6; bb.vz=-2; bb.lastKicker=from; bb.passTarget=cb; bb.isShot=false; bb.crossH=false; header(cb,bb); H2.n++; if(bb.owner===cb) H2.ctrl++; }
  C.hdr=H2; return C; },[K,GAP]);
 console.log(JSON.stringify(R)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
