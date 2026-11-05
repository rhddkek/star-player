const {chromium,devices}=require('playwright'); const fs=require('fs');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/fresh/';
const bot=fs.readFileSync('/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/selftest/bot.js','utf8');
const log=(...a)=>console.log(a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '));
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>{ errs.push(e.message); log('PAGEERROR',e.message); });
  let n=0; const shot=async(name)=>{ n++; await pg.screenshot({path:D+String(n).padStart(2,'0')+'_'+name+'.png'}); };
  const ovText=()=>pg.evaluate(()=>{ const o=document.getElementById('m-overlay'); return o&&!o.hidden?o.innerText.replace(/\s+/g,' ').slice(0,300):''; });
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.waitForTimeout(800); await shot('title');
  await pg.click('#btn-new'); await pg.waitForTimeout(1500); await shot('cut1'); await pg.waitForTimeout(3000); await shot('cut2');
  await pg.click('#cut-skip'); await pg.waitForTimeout(800); await shot('warm_start'); await pg.waitForTimeout(1800); await shot('warm_play'); log('warm overlay',await ovText());
  // 워밍업: 봇으로 실제 플레이
  await pg.evaluate(bot+';window.__bot=setInterval(()=>{ try{ botStep(); }catch(e){} },33);');
  for(let i=0;i<20;i++){ await pg.waitForTimeout(1500); const t=await ovText(); if(t.includes('워밍업 완료')) break; }
  await shot('warm_done'); log('warm done',await ovText());
  await pg.evaluate(()=>clearInterval(window.__bot));
  await pg.evaluate(()=>{ const x=document.getElementById('wm-go'); if(x) x.click(); }); await pg.waitForTimeout(1000); await shot('final_lineup'); log('lineup',await ovText());
  await pg.evaluate(()=>{ const x=document.getElementById('lu-go'); if(x) x.click(); }); await pg.waitForTimeout(1200); log('after lineup',await ovText()); await shot('final_after_lineup');
  await pg.evaluate(()=>{ const x=document.getElementById('tut-go'); if(x) x.click(); }); await pg.waitForTimeout(3500); await shot('final_play1');
  await pg.evaluate(()=>{ window.__bot=setInterval(()=>{ try{ botStep(); }catch(e){} },33); });
  await pg.waitForTimeout(8000); await shot('final_play2');
  const t0=Date.now(); while(Date.now()-t0<240000){ await pg.waitForTimeout(3000); const s=await pg.evaluate(()=>({m:!!M,scr:[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(',')})); if(!s.m||s.scr.includes('pro')) break; const o=await ovText(); if(o&&o.includes('하프')){ await shot('halftime'); log('HT',o); await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); } else if(o){ await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); } }
  await pg.evaluate(()=>clearInterval(window.__bot)); await pg.waitForTimeout(1500); await shot('offers'); log('offers screen',await pg.evaluate(()=>document.getElementById('pro-col')?document.getElementById('pro-col').innerText.replace(/\s+/g,' ').slice(0,500):''));
  await pg.evaluate(()=>{ document.getElementById('pro-col').parentElement.scrollTop=600; }); await pg.waitForTimeout(300); await shot('offers2');
  await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(1200); await shot('join_modal'); log('join modal',await pg.evaluate(()=>{ const m=document.querySelector('.hub-modal'); return m?m.innerText.replace(/\s+/g,' ').slice(0,300):''; }));
  await pg.evaluate(()=>{ const x=document.getElementById('ci-ok'); if(x) x.click(); }); await pg.waitForTimeout(800); await shot('home1');
  for(let y of [500,1000,1500,2000]){ await pg.evaluate(y=>{ const s=document.querySelector('#screen-hub .scroll')||document.scrollingElement; window.scrollTo(0,y); document.querySelectorAll('main,.hub-body,#tab-home').forEach(e=>e.scrollTop=y); },y); await pg.waitForTimeout(250); await shot('home_y'+y); }
  log('home text',await pg.evaluate(()=>el('tab-home').innerText.replace(/\s+/g,' ').slice(0,900)));
  // 데뷔전 직접
  await pg.evaluate(()=>{ window.scrollTo(0,0); document.querySelectorAll('#tab-home').forEach(e=>e.scrollTop=0); }); await pg.evaluate(()=>document.getElementById('btn-go').click()); await pg.waitForTimeout(1200); log('debut pre',await ovText()); await shot('debut_lineup');
  await pg.evaluate(()=>{ const x=document.getElementById('lu-go'); if(x) x.click(); }); await pg.waitForTimeout(3000); await shot('debut_play'); log('debut overlay',await ovText());
  await pg.evaluate(()=>{ botStep.s=null; window.__bot=setInterval(()=>{ try{ botStep(); }catch(e){} },33); });
  const t1=Date.now(); while(Date.now()-t1<300000){ await pg.waitForTimeout(3000); const s=await pg.evaluate(()=>!!M); if(!s) break; const o=await ovText(); if(o) await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); }
  await pg.evaluate(()=>clearInterval(window.__bot)); await pg.waitForTimeout(1500); await shot('result1');
  log('result',await pg.evaluate(()=>el('result-col').innerText.replace(/\s+/g,' ').slice(0,900)));
  await pg.evaluate(()=>{ el('result-col').parentElement.scrollTop=700; window.scrollTo(0,700); }); await pg.waitForTimeout(300); await shot('result2');
  log('errors',errs.length,errs.slice(0,5)); await b.close(); log('DONE'); })().catch(e=>{ console.log('FATAL',e.message); });
