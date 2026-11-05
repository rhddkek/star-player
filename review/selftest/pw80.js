const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/mo/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664},deviceScaleFactor:2})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ proSkipAll(0); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; startPractice(); });
  await pg.waitForTimeout(2500);
  const st=async(name,fn,wait=120)=>{ await pg.evaluate(fn); await pg.waitForTimeout(wait); const r=await pg.evaluate(()=>{ const a=animFor(M.user); return a.an+':'+a.dir; }); const box=await pg.evaluate(()=>{ const cw=cv._w,ch=cv._h; return {x:cw/2-70,y:ch/2-90}; }); await pg.screenshot({path:D+'g_'+name+'.png',clip:{x:box.x,y:box.y,width:140,height:150}}); return r; };
  const res={};
  await pg.evaluate(()=>{ M.freeze=0; M.players.filter(q=>q.team===1).forEach(q=>{ q.x=2; q.y=80; }); });
  // sprint with ball → sprint; set no ball for pure sprint
  res.sprint=await st('sprint',()=>{ const u=M.user; M.ball.owner=null; M.ball.x=5; M.ball.y=100; input.joyActive=true; input.jx=0.7; input.jy=-0.7; input.sprint=true; },700);
  res.run=await st('run',()=>{ input.sprint=false; },700);
  res.dribble=await st('dribble',()=>{ const u=M.user; setOwner(u,{clean:true}); u.touchT=0; input.jx=1; input.jy=0; },700);
  res.charge=await st('charge',()=>{ input.joyActive=false; input.jx=input.jy=0; M.user.vx=M.user.vy=0; M.charge={type:'shot',dur:0.7}; },250);
  res.shot=await st('shot',()=>{ M.charge=null; const u=M.user; u.fx=0; u.fy=-1; shoot(u,W/2,0,{power:0.9}); },180);
  res.header=await st('header',()=>{ const u=M.user; u.headT=0.2; u.shotAnimT=0; },30);
  res.trap=await st('trap',()=>{ const u=M.user; u.headT=0; u.trapT=0.2; u.vx=u.vy=0; },30);
  // AI variant sprint
  res.ai=await pg.evaluate(()=>{ const q=M.players.find(p=>!p.isUser&&p.role!=='GK'); q.vx=12; q.vy=0; q.fx=1; q.fy=0; return animFor(q).ch+':'+animFor(q).an; });
  console.log(JSON.stringify(res),errs); await b.close(); })();
