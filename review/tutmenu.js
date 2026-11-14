const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13']}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#go-create'); await pg.click('#btn-new'); await pg.waitForTimeout(700); await pg.click('#cut-skip'); await pg.waitForTimeout(600);
  // 건너뛰기 → 결승
  await pg.waitForTimeout(2200); await pg.click('#btn-prout'); await pg.waitForTimeout(600); console.log('skip',JSON.stringify(await pg.evaluate(()=>({pro:!!(M&&M.ev.pro),bar:el('tut-bar').hidden,tuting:el('screen-match').classList.contains('tuting'),n:M.players.length}))));
  await pg.evaluate(()=>{ if(el('tut-go')) el('tut-go').click(); M.score=[2,1]; M.stats.goals=1; M.min=90; M.over=true; concludeMatch(); }); await pg.waitForTimeout(400); await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); practiceMenu(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'tut_menu.png'});
  await pg.click('[data-pm="warm"]'); await pg.waitForTimeout(2600); console.log('menu start',JSON.stringify(await pg.evaluate(()=>({i:M.tut&&M.tut.i,out:el('btn-prout').textContent,me:M.me.name}))));
  await pg.click('#btn-prreset'); await pg.waitForTimeout(500); await pg.evaluate(()=>{ tutEnter(5,true); }); await pg.waitForTimeout(700); await pg.evaluate(()=>{ const d=M.tut.def; M.user.x=d.x; M.user.y=d.y+1.4; }); await pg.keyboard.press('z'); await pg.waitForTimeout(1700);
  console.log('fin',JSON.stringify(await pg.evaluate(()=>({go:el('wm-go')&&el('wm-go').textContent}))));
  await pg.click('#wm-again'); await pg.waitForTimeout(900); console.log('again',JSON.stringify(await pg.evaluate(()=>({i:M.tut&&M.tut.i,done:M.tut&&M.tut.done,n:M.players.length,bar:el('tut-bar').hidden}))));
  await pg.click('#btn-prout'); await pg.waitForTimeout(500); console.log('out',JSON.stringify(await pg.evaluate(()=>({hub:!el('screen-hub').hidden,M:!!M,bar:el('tut-bar').hidden,tuting:el('screen-match').classList.contains('tuting')}))));
  await pg.evaluate(()=>startPractice(null)); await pg.waitForTimeout(1800); console.log('free',JSON.stringify(await pg.evaluate(()=>({tut:!!M.tut,n:M.players.length,bar:el('tut-bar').hidden}))));
  console.log('errs',errs); await b.close(); })();
