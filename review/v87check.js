// v87 점검: 코너킥 40번 → 공중볼 경합·슈팅·골 비율 + 패스 속도·새 찬스 종류
const {chromium}=require('playwright'); const FILE=process.argv[2]; const K=+process.argv[3]||40; const TYPE=process.argv[4]||'corner';
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async([K,TYPE])=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  const ME='kr-1-0', OPP='kr-1-1'; S.clubId=ME; Object.keys(S.player.stats).forEach(k=>S.player.stats[k]=CLUBS[ME].str);
  S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; const ev=nextEvent(); ev.opp=CLUBS[OPP]; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true; M.chanceReq=false; M.chance=null;
  const real=M.user; real.isUser=false; M.user={x:-60,y:-60,vx:0,vy:0,fx:0,fy:-1,team:0,i:99,role:'FW',isUser:true,st:{...real.st},hx:-60,hy:-60,ai:{},sta:1};
  fullTime=()=>{}; halfTime=()=>{}; let t=performance.now();
  const C={n:0,land:{},first:{},shot:0,headShot:0,goal:0,headGoal:0,out:0,cornerAgain:0,claim:0,clearH:0,attHead:0,defHead:0,none:0,saved:0};
  let cur=null; const oHead=header; header=function(pl,bb){ const s0=M.tstats[0].shots+M.tstats[1].shots; const r=oHead.apply(this,arguments); const who=M.lastHeaderTeam; if(cur&&!cur.first){ cur.first=who===cur.team?'attHead':'defHead'; } if(cur&&(M.tstats[0].shots+M.tstats[1].shots)>s0&&who===cur.team){ cur.headShot=true; } return r; };
  const oClaim=gkClaim; gkClaim=function(){ if(cur&&!cur.first) cur.first='claim'; return oClaim.apply(this,arguments); };
  const oGS=goalScored; goalScored=function(){ const s0=M.score[cur?cur.team:0]; const r=oGS.apply(this,arguments); if(cur&&M.score[cur.team]>s0){ cur.goal=true; if(M.lastHeaderT&&M.t-M.lastHeaderT<2.2&&M.lastHeaderTeam===cur.team) cur.headGoal=true; } return r; };
  const oSv=gkSave; gkSave=function(){ if(cur) cur.saved=true; return oSv.apply(this,arguments); };
  const oSPN=startSetPieceNow; let restarted=null; startSetPieceNow=function(type){ if(cur&&cur.started) restarted=type; return oSPN.apply(this,arguments); };
  const step=n=>{ for(let i=0;i<n;i++){ t+=33.3; lastT=t-33.3; loop(t); if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); } };
  step(60);
  for(let k=0;k<K;k++){ const team=k%2; M.freeze=0; M.setPiece=null; restarted=null; const gy=goalOf(team).y; const sx=Math.random()<0.5?0.6:W-0.6; const pos=TYPE==='corner'?{x:sx,y:team===0?0.6:H-0.6}:{x:W/2+rnd(-14,14),y:gy+(team===0?1:-1)*rnd(24,32)};
    cur={team,started:false}; startSetPieceNow(TYPE,team,pos,TYPE==='fk'?{indirect:true}:{}); const s0=M.tstats[team].shots; let landed=false; const t0=M.t;
    for(let f=0;f<240;f++){ step(1); if(!cur.started&&M.ball.lastKicker&&!M.ball.owner&&M.t>t0+0.1) { cur.started=true; cur.kt=M.t; }
      if(cur.started&&!landed){ const bb=M.ball; if(Math.abs(bb.y-gy)<13&&Math.abs(bb.x-W/2)<13&&bb.vz<0&&bb.z<4){ landed=true; cur.landZ=bb.z<1.8?'low':bb.z<3.2?'head':'high'; } }
      if(cur.started&&(restarted||(M.t-cur.kt>6))) break; if(M.freeze>0&&cur.goal) break; }
    C.n++; C.land[cur.landZ||'none']=(C.land[cur.landZ||'none']||0)+1; C.first[cur.first||'none']=(C.first[cur.first||'none']||0)+1; if(M.tstats[team].shots>s0) C.shot++; if(cur.headShot) C.headShot++; if(cur.goal) C.goal++; if(cur.headGoal) C.headGoal++; if(cur.saved) C.saved++; if(restarted==='corner') C.cornerAgain++;
    M.freeze=0; M.setPiece=null; }
  C.passK=typeof PASS_K!=='undefined'?PASS_K:0; C.chNames=Object.keys(CH_NAME); return C; },[K,TYPE]);
 console.log(JSON.stringify(R)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
