const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  pg.on('pageerror',e=>console.log('PAGEERROR',e.stack.slice(0,700)));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ S.prologue={stage:'offers',r:{my:2,op:1,win:true,pk:false,rating:7.6,goals:1,assists:0},offers:proOffers({rating:7.6,goals:1,assists:0})}; showProOffers(); });
  await pg.waitForTimeout(1500); await b.close(); })();
