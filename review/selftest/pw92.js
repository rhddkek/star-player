const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); const pg=await ctx.newPage();
 const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.argv[2]); await pg.click('#btn-new'); await pg.waitForTimeout(700);
 await pg.evaluate(()=>{ S.tutSeen=true; S.noReplay=true; S.compIntro=false; save(); renderHub(); startMatch(false); }); await pg.waitForTimeout(900);
 await pg.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(3000);
 const info=await pg.evaluate(()=>({tier:M.venue&&M.venue.tier,pro:!!M.ev.pro,name:M.venue&&M.venue.name}));
 console.log('first match',JSON.stringify(info));
 // venueOf 2부 샘플
 const tiers=await pg.evaluate(()=>{ const r=[]; try{ for(const st of [40,55,60,70,85]){ r.push(st); } }catch(e){} return r; });
 for(const [t,rep,tag,ux,uy] of [[1,400,'t1',6,30],[2,1500,'t2',6,40],[3,5000,'t3',30,4],[4,6500,'t4',6,52]]){
  await pg.evaluate(([t,rep,ux,uy])=>{ S.player.rep=rep; M.home=true; M.venue={...M.venue,tier:t,fill:[0,0.28,0.52,0.8,0.96][t]}; M.vgfx=venueGfx(M.venue); M.night=false; M.user.x=ux; M.user.y=uy; M.ball.x=ux+1; M.ball.y=uy; el('banner').classList.remove('show'); },[t,rep,ux,uy]);
  await pg.waitForTimeout(500); await pg.screenshot({path:'ui3/venue_'+tag+'.png'});
 }
 console.log('errs',errs.slice(0,5)); await b.close(); })();
