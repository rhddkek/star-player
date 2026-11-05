const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/mo/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664},deviceScaleFactor:3})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ proSkipAll(0); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; startPractice(); });
  await pg.waitForTimeout(2500);
  await pg.evaluate(()=>{ M.freeze=0; prToggleDef(); M.paused=true; el('m-overlay').hidden=true; const u=M.user; u.x=W/2; u.y=40; M.cam.x=u.x; M.cam.y=u.y; actHint.off=true; S.noActHint=true; });
  const scr=()=>pg.evaluate(()=>{ const cw=cv._w,ch=cv._h, ppm=M.cam.ppm*(M.cam.z||1); let camx=clamp(M.cam.x,cw/M.cam.ppm/2-7,W-cw/M.cam.ppm/2+7), camy=clamp(M.cam.y,ch/M.cam.ppm/2-200/M.cam.ppm,H-ch/M.cam.ppm/2+8); const r=cv.getBoundingClientRect(); return {x:r.left+cw/2+(M.user.x-camx)*ppm, y:r.top+ch/2+(M.user.y-camy)*ppm, ppm}; });
  const frames=async(name,setup,n,dt)=>{ await pg.evaluate(setup); const p=await scr(); const out=[]; for(let i=0;i<n;i++){ await pg.evaluate(dt); await pg.waitForTimeout(60); await pg.screenshot({path:D+`h_${name}_${i}.png`,clip:{x:p.x-28,y:p.y-52,width:56,height:62}}); } return p; };
  const u='M.user';
  // 스프린트: 속도만 주고 위치 고정(일시정지)
  await frames('run',()=>{ const u=M.user; M.ball.owner=null; M.ball.x=3;M.ball.y=100; u.vx=0; u.vy=-9; u.fx=0; u.fy=-1; M.sprinting=false; },6,()=>{ M.user.runPh=(M.user.runPh||0)+0.9; });
  await frames('sprint',()=>{ M.sprinting=true; M.user.vy=-12.5; },6,()=>{ M.user.runPh=(M.user.runPh||0)+0.9; });
  await frames('dribble',()=>{ M.sprinting=false; const u=M.user; setOwner(u,{clean:true}); u.touchT=0; u.vy=-7.5; },6,()=>{ M.user.runPh=(M.user.runPh||0)+0.9; });
  await frames('shot',()=>{ const u=M.user; u.vx=u.vy=0; M.charge={type:'shot',dur:0}; },6,()=>{ if(M.charge){ M.charge.dur+=0.3; if(M.charge.dur>0.9){ M.charge=null; M.user.shotAnimT=0.46; } } else M.user.shotAnimT=Math.max(0.01,M.user.shotAnimT-0.12); });
  await frames('header',()=>{ const u=M.user; u.shotAnimT=0; M.ball.owner=null; M.ball.x=3; u.headT=0.35; },5,()=>{ M.user.headT=Math.max(0.01,M.user.headT-0.075); });
  await frames('trap',()=>{ const u=M.user; u.headT=0; u.trapT=0.34; },5,()=>{ M.user.trapT=Math.max(0.01,M.user.trapT-0.07); });
  console.log(errs); await b.close(); })();
