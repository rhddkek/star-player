const {chromium,devices}=require('playwright');
const OUT='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui7/';
const FILE=process.argv[2]||'file:///home/claude/star-player.html';
(async()=>{ const b=await chromium.launch();
 for(const [nm,opt] of [['L',{viewport:{width:1280,height:720}}],['P',{...devices['iPhone 13']}]]){
  const ctx=await b.newContext(opt); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error') errs.push('c:'+m.text()); });
  await pg.goto(FILE); await pg.waitForTimeout(900); await pg.screenshot({path:OUT+nm+'01_title.png'});
  await pg.click('#go-create'); await pg.waitForTimeout(600); await pg.screenshot({path:OUT+nm+'03_create.png'});
  await pg.click('#btn-new'); await pg.waitForTimeout(400);
  await pg.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.noReplay=true; S.compIntro=false; for(let i=0;i<6;i++) autoMatch(true); S.player.points=4; tab='home'; renderHub(); });
  await pg.waitForTimeout(500); await pg.evaluate(()=>document.querySelectorAll('.hub-modal').forEach(m=>m.remove())); await pg.waitForTimeout(300); await pg.screenshot({path:OUT+nm+'02_home.png'});
  const shots=[['04_stat',"tab='player';renderPlayer.sub='stat'"],['05_week',"S.weekAct=null;tab='player';renderPlayer.sub='week'"],['07_skill',"tab='skill'"],['14_league',"tab='league'"],['19_record',"tab='career';renderCareer.sub='record'"],['15_scout',"tab='career';renderCareer.sub='scout'"],['xx_transfer',"tab='transfer'"],['xx_endo',"tab='shop';renderShop.sub='endo'"],['xx_gear',"tab='shop';renderShop.sub='gear'"]];
  for(const [f,code] of shots){ await pg.evaluate(code+';renderHub();document.querySelectorAll(".hub-modal").forEach(m=>m.remove());'); await pg.waitForTimeout(500); await pg.screenshot({path:OUT+nm+f+'.png'}); }
  await pg.evaluate(()=>{ clubProfile(Object.keys(S.scout.f)[0]||'kr-1-0'); }); await pg.waitForTimeout(500); await pg.screenshot({path:OUT+nm+'16_club.png'}); await pg.evaluate(()=>document.querySelectorAll('.hub-modal').forEach(m=>m.remove()));
  await pg.evaluate(()=>{ S.offers=makeOffers(); S.offersFor='end'; tab='transfer'; renderHub(); }); await pg.waitForTimeout(500); await pg.screenshot({path:OUT+nm+'17_offers.png'});
  await pg.evaluate(()=>{ negotiate(0); }); await pg.waitForTimeout(500); await pg.screenshot({path:OUT+nm+'18_neg.png'}); await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.offers=[]; S.offersFor=null; });
  await pg.evaluate(()=>{ tab='home'; renderHub(); startMatch(false); }); await pg.waitForTimeout(900); await pg.screenshot({path:OUT+nm+'10_lineup.png'});
  await pg.evaluate(()=>{ el('m-overlay').hidden=true; M.paused=false; }); await pg.waitForTimeout(1500); await pg.screenshot({path:OUT+nm+'11_match.png'});
  await pg.evaluate(()=>{ M.htSkip=false; halftimeShow(); }); await pg.waitForTimeout(500); await pg.screenshot({path:OUT+nm+'12_half.png'});
  await pg.evaluate(()=>{ el('m-overlay').hidden=true; skipRest&&skipRest(); }); await pg.waitForTimeout(3500); await pg.screenshot({path:OUT+nm+'13_result.png'});
  console.log(nm,'errs',JSON.stringify(errs.slice(0,8)));
  await ctx.close(); }
 await b.close(); })();
