const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui5/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13']})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/star-player.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
 await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.compIntro=false; S.trust=90; S.starter=true; S.player.money=1500; S.player.rep=900; S.introSk='pending'; S.player.level=2; for(let i=0;i<4;i++) autoMatch(true); S.introSk='pending'; document.querySelectorAll('.hub-modal,.sk-unlock').forEach(m=>m.remove()); save(); });
 const shot=async(n)=>{ await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(m=>m.remove())); await pg.waitForTimeout(250); await pg.screenshot({path:D+n+'.png'}); };
 for(const t of ['skill','shop','transfer','league']){ await pg.evaluate(t=>{ tab=t; renderShop.sub='endo'; renderHub(); window.scrollTo(0,0); },t); await shot('hub_'+t); }
 await pg.evaluate(()=>{ renderTransfer.t='target'; tab='transfer'; renderHub(); }); await shot('hub_transfer2');
 // 경기
 await pg.evaluate(()=>{ S.noReplay=true; startMatch(false); }); await pg.waitForTimeout(800); await pg.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(3500);
 await pg.evaluate(()=>{ el('banner').classList.remove('show'); M.mom=0.55; tick('⚽ 김광우 · 도움 신예준 — 1:0'); M.tl.push({min:12,t:'🟨 박지훈 (용인)'}); M.tl.push({min:31,t:'🧤 선방 — 이도윤'}); });
 await pg.waitForTimeout(700); await shot('m_ticker');
 await pg.evaluate(()=>{ M.tstats[0].shots=6; M.tstats[1].shots=3; M.tstats[0].onT=3; M.tstats[1].onT=1; M.tstats[0].poss=600; M.tstats[1].poss=400; M._lr=7.2; halftimeShow(); }); await shot('m_half');
 await pg.evaluate(()=>{ el('ht-go').click(); }); await pg.waitForTimeout(300);
 await pg.evaluate(()=>el('btn-skip').click()); await shot('m_pause_g');
 await pg.evaluate(()=>document.querySelector('[data-pt="r"]').click()); await shot('m_pause_r');
 await pg.evaluate(()=>document.querySelector('[data-pt="s"]').click()); await shot('m_pause_s');
 console.log(JSON.stringify(await pg.evaluate(()=>({tac:M.tactic[0],tl:M.tl.length,ord:M.htOrder})))); console.log(errs); await b.close(); })();
