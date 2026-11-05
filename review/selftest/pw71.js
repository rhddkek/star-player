const {chromium,devices}=require('playwright'); const fs=require('fs');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/fresh/';
const bot=fs.readFileSync('/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/selftest/bot.js','utf8');
const log=(...a)=>console.log(a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '));
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>{ errs.push(e.message); log('PAGEERROR',e.message); });
  const ov=()=>pg.evaluate(()=>{ const o=document.getElementById('m-overlay'); return o&&!o.hidden?o.innerText.replace(/\s+/g,' ').slice(0,300):''; });
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(700); await pg.click('#cut-skip'); await pg.waitForTimeout(1600); await pg.screenshot({path:D+'b1_warm.png'});
  await pg.evaluate(()=>warmDone()); await pg.waitForTimeout(900); await pg.screenshot({path:D+'b2_lineup.png'}); log('lineup',await ov());
  await pg.evaluate(()=>{ el('lu-go').click(); }); await pg.waitForTimeout(3500); await pg.screenshot({path:D+'b3_final.png'}); log('hud objs',await pg.evaluate(()=>el('objs').innerText));
  await pg.evaluate(()=>{ cancelAnimationFrame(raf); M=null; proSkipAll(0); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); });
  await pg.waitForTimeout(500);
  const cards=await pg.evaluate(()=>[...document.querySelectorAll('#tab-home > *, #tab-home .home-grid > *')].map(e=>e.className).slice(0,20)); log('home cards',cards);
  for(const [i,sel] of [['h1','.nm .stadium'],['h2','.nm .tstrip'],['h3','.nm .prep'],['h4','.wk-home'],['h5','.home-sub']].entries()){ await pg.evaluate(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); },sel[1]); await pg.waitForTimeout(200); await pg.screenshot({path:D+'b4_'+sel[0]+'.png'}); }
  log('tstrip',await pg.evaluate(()=>{ const e=document.querySelector('.tstrip'); return e&&e.innerText.replace(/\s+/g,' '); }), 'prep', await pg.evaluate(()=>{ const e=document.querySelector('.prep'); return e&&e.innerText.replace(/\s+/g,' '); }));
  await pg.evaluate(()=>{ window.scrollTo(0,0); document.querySelector('.nm').scrollIntoView(); document.getElementById('btn-go').click(); }); await pg.waitForTimeout(1000); log('debut lineup',await ov());
  await pg.evaluate(()=>{ el('lu-go').click(); }); await pg.waitForTimeout(3500); await pg.screenshot({path:D+'b5_debut.png'}); log('debut hud',await pg.evaluate(()=>el('objs').innerText));
  await pg.evaluate(bot+';botStep.s=null; window.__bot=setInterval(()=>{ try{ botStep(); }catch(e){} },33);');
  const t1=Date.now(); let ht=false; while(Date.now()-t1<330000){ await pg.waitForTimeout(3000); if(!(await pg.evaluate(()=>!!M))) break; const o=await ov(); if(o){ if(!ht){ ht=true; await pg.screenshot({path:D+'b6_ht.png'}); log('overlay',o); } await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); } }
  await pg.evaluate(()=>clearInterval(window.__bot)); await pg.waitForTimeout(1500); await pg.screenshot({path:D+'b7_result.png'});
  log('result',await pg.evaluate(()=>el('result-col').innerText.replace(/\s+/g,' ').slice(0,1000)));
  await pg.evaluate(()=>{ const e=document.querySelector('.res3'); if(e) e.scrollIntoView({block:'start'}); }); await pg.waitForTimeout(200); await pg.screenshot({path:D+'b8_result.png'});
  await pg.evaluate(()=>{ const e=document.querySelector('.res-go'); if(e) e.scrollIntoView({block:'end'}); }); await pg.waitForTimeout(200); await pg.screenshot({path:D+'b9_result.png'});
  log('errors',errs.length,errs.slice(0,5)); await b.close(); log('DONE'); })().catch(e=>{ console.log('FATAL',e.message); });
