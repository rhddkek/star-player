const {chromium}=require('playwright'); const OUT='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/v132/'; const tag=process.argv[2]||'a';
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/star-player/index.html'); await pg.waitForTimeout(500); await pg.tap('#go-create'); await pg.waitForTimeout(300);
 await pg.tap('[data-cm="chal"]'); await pg.waitForTimeout(400); await pg.screenshot({path:OUT+tag+'_chal.png'}); await pg.evaluate(()=>{ const x=document.querySelector('#chal-list .chl-x, #chal-list button'); el('chal-list').classList.remove('open'); }); await pg.tap('[data-cm="normal"]').catch(()=>{});
 await pg.tap('#btn-new'); await pg.waitForTimeout(400);
 await pg.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.player.points=9; S.player.money=900; for(let i=0;i<4;i++) autoMatch(true); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); tab='home'; renderHub(); }); await pg.waitForTimeout(1200); await pg.evaluate(()=>document.querySelectorAll('.hub-modal').forEach(m=>m.remove()));
 const shot=async n=>{ await pg.waitForTimeout(350); await pg.screenshot({path:OUT+tag+'_'+n+'.png'}); };
 const clr=()=>pg.evaluate(()=>document.querySelectorAll('.hub-modal').forEach(m=>m.remove()));
 await shot('home');
 await pg.evaluate(()=>goKey('player:stat')); await shot('stat');
 for(let i=0;i<3;i++){ await pg.evaluate(()=>goKey('player:stat')); await pg.evaluate(i=>document.querySelectorAll('.st3b')[i].click(),i); await shot(['coach','trait','arch'][i]); await clr(); }
 await pg.evaluate(()=>goKey('player:week')); await shot('week'); await pg.evaluate(()=>{ tab='home'; renderHub(); S.weekAct=null; weekSheet(); }); await shot('wksheet'); await clr();
 await pg.evaluate(()=>goKey('skill')); await shot('skill');
 for(const s of ['record','scout','transfer','staff']){ await pg.evaluate(s=>goKey('career:'+s),s); await shot('career_'+s); }
 for(const s of ['gear','life','endo','cos']){ await pg.evaluate(s=>goKey('shop:'+s),s); await shot('shop_'+s); }
 await pg.evaluate(()=>{ tab='league'; renderHub(); }); await shot('league');
 await pg.evaluate(()=>{ tab='home'; renderHub(); extraTrainModal(); }); await shot('extra_tr'); await clr();
 await pg.evaluate(()=>{ tab='home'; renderHub(); toast('캥페르 레종 FC 제안 거절 · 시장 4R 동안 다른 구단 연락 가능'); }); await shot('toast');
 await pg.evaluate(()=>{ document.getElementById('btn-settings').click(); }); await shot('settings'); await clr();
 await pg.evaluate(()=>{ tab='home'; renderHub(); startMatch(false); }); await pg.waitForTimeout(600); await shot('lineup');
 await pg.evaluate(()=>{ const g=el('lu-go'); g&&g.click(); }); await pg.waitForTimeout(3500); await shot('match'); await pg.evaluate(()=>{ el('btn-skip').click(); }); await shot('pause'); await pg.evaluate(()=>{ const b=[...document.querySelectorAll('#m-overlay button')].find(x=>/조작/.test(x.textContent)); b&&b.click(); }); await shot('help');
 console.log('errs',errs); await b.close(); })();
