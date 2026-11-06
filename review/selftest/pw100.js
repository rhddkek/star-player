const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui3/M_';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13 landscape']})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+process.argv[2]); await pg.click('#btn-new'); await pg.waitForTimeout(500);
 await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.noReplay=true; S.compIntro=false; S.player.rep=5000; S.trust=90; S.starter=true; save(); startMatch(false); }); await pg.waitForTimeout(900);
 await pg.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(450); await pg.screenshot({path:D+'intro.png'});
 await pg.waitForTimeout(3500); await pg.evaluate(()=>el('banner').classList.remove('show')); await pg.screenshot({path:D+'kick.png'});
 // 15초 실제 진행 (자동)
 await pg.evaluate(()=>{ M.user.autoT=0; }); await pg.waitForTimeout(6000); await pg.screenshot({path:D+'live.png'});
 // 다시 세로로
 await pg.setViewportSize({width:390,height:760}); await pg.waitForTimeout(800); await pg.screenshot({path:D+'portrait.png'});
 console.log(errs.slice(0,5)); await b.close(); })();
