const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui3/'+(process.argv[3]||'L')+'_';
(async()=>{ const b=await chromium.launch(); const dev=devices['iPhone 13 landscape']; const pg=await (await b.newContext({...dev})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.argv[2]); await pg.click('#btn-new'); await pg.waitForTimeout(500);
 await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.noReplay=true; S.compIntro=false; S.player.rep=2000; save(); startMatch(false); }); await pg.waitForTimeout(900);
 await pg.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(600); await pg.screenshot({path:D+'intro.png'});
 await pg.waitForTimeout(3000); await pg.evaluate(()=>el('banner').classList.remove('show')); await pg.screenshot({path:D+'play.png'});
 // 조이스틱 오른쪽 → 공격 방향(위쪽 = y 감소)으로 이동하는지
 const r=await pg.evaluate(()=>{ const u=M.user; const y0=u.y, x0=u.x; return {y0,x0,land:isLand(),ppm:M.cam.ppm}; });
 await pg.mouse.move(200,300); await pg.mouse.down(); await pg.mouse.move(260,300,{steps:4}); await pg.waitForTimeout(900);
 const r2=await pg.evaluate(()=>({y:M.user.y,x:M.user.x,fx:M.user.fx,fy:M.user.fy}));
 await pg.screenshot({path:D+'run.png'}); await pg.mouse.up();
 // 상대 진영 공격 장면
 await pg.evaluate(()=>{ const u=M.user; u.x=W/2+6; u.y=22; M.ball.owner=null; setOwner(u,{clean:true}); M.cam.x=u.x; M.cam.y=u.y; });
 await pg.waitForTimeout(700); await pg.screenshot({path:D+'attack.png'});
 // 골키퍼 캐치
 await pg.evaluate(()=>{ const gk=M.players.find(q=>q.team===1&&q.role==='GK'); const u=M.user; u.x=W/2+2; u.y=14; M.cam.x=W/2; M.cam.y=12; gk.x=W/2; gk.y=1.5; M.ball.owner=null; M.ball.x=W/2+0.3; M.ball.y=6; M.ball.z=0.4; M.ball.vx=0; M.ball.vy=-16; M.ball.vz=0; M.ball.lastKicker=u; M.ball.saveChecked=false; M.ball.isShot=true; });
 await pg.waitForTimeout(450); await pg.screenshot({path:D+'gk.png'});
 const chk=await pg.evaluate(()=>({ swapped:VLAND, ux:M.user.x, uy:M.user.y, inb:M.players.every(q=>q.x>-3&&q.x<W+3&&q.y>-3&&q.y<H+3) }));
 console.log(JSON.stringify({r,r2,chk}),errs.slice(0,5)); await b.close(); })();
