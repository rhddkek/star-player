const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13']})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/star-player.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
 await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.noReplay=true; S.compIntro=false; save(); startMatch(false); }); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(3300);
 await pg.evaluate(()=>{ el('banner').classList.remove('show'); const gk=M.players.find(q=>q.team===1&&q.role==='GK'); const u=M.user; u.x=W/2+2; u.y=14; M.cam.x=W/2; M.cam.y=12; gk.x=W/2; gk.y=1.5; M.ball.owner=null; M.ball.x=W/2+0.3; M.ball.y=6; M.ball.z=0.4; M.ball.vx=0; M.ball.vy=-16; M.ball.vz=0; M.ball.lastKicker=u; M.ball.saveChecked=false; M.ball.isShot=true; });
 await pg.waitForTimeout(700); await pg.screenshot({path:'ui3/gk_hold.png'});
 const st=await pg.evaluate(()=>{ const gk=M.players.find(q=>q.team===1&&q.role==='GK'); return {own:M.ball.owner===gk,hold:+(gk.gkHoldUntil-M.t||0).toFixed(2),saves:M.saveKinds,last:M.lastSave}; });
 console.log(JSON.stringify(st),errs); await b.close(); })();
