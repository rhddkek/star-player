const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); const pg=await ctx.newPage();
 const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.argv[2]); await pg.click('#btn-new'); await pg.waitForTimeout(700);
 await pg.evaluate(()=>{ S.tutSeen=true; S.noReplay=true; S.compIntro=false; save(); renderHub(); startMatch(false); }); await pg.waitForTimeout(900);
 await pg.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(3200);
 for(const [t,rep,tag] of [[1,400,'i1'],[2,1500,'i2'],[4,6500,'i4']]){
  await pg.evaluate(([t,rep])=>{ S.player.rep=rep; M.home=true; M.venue={...M.venue,tier:t,fill:[0,0.28,0.52,0.8,0.96][t]}; M.vgfx=venueGfx(M.venue); M.night=t===4; M.introT=2.6; M.freeze=2.6; el('banner').classList.remove('show'); },[t,rep]);
  await pg.waitForTimeout(350); await pg.screenshot({path:'ui3/venue_'+tag+'.png'});
 }
 // 사이드라인 근처 플레이 화면
 await pg.evaluate(()=>{ M.introT=0; M.freeze=0; M.night=false; M.venue={...M.venue,tier:3,fill:0.8}; M.vgfx=venueGfx(M.venue); S.player.rep=5000; M.user.x=2; M.user.y=60; M.ball.owner=null; M.ball.x=3; M.ball.y=60; M.cam.x=2; M.cam.y=60; });
 await pg.waitForTimeout(700); await pg.screenshot({path:'ui3/venue_side.png'});
 console.log('errs',errs.slice(0,5)); await b.close(); })();
