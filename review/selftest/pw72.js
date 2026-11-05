const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  const r=await pg.evaluate(()=>{ proSkipAll(0); document.querySelectorAll('.hub-modal').forEach(m=>m.remove());
    const L=[{t:'유효 슈팅 1회',k:'onT',n:1,v:2,done:true},{t:'유효 슈팅 2회',k:'onT',n:2,v:2,done:true}], L2=[{t:'유효 슈팅 1회',k:'onT',n:1,v:1,done:true},{t:'유효 슈팅 2회',k:'onT',n:2,v:1,done:false}], L3=[{t:'유효 슈팅 1회',k:'onT',n:1,v:0,done:false},{t:'유효 슈팅 2회',k:'onT',n:2,v:0,done:false}];
    const strip=x=>x.replace(/<[^>]+>/g,''); return {a:strip(objPills(L)),b:strip(objPills(L2)),c:strip(objPills(L3)),j:josa('오도윤','과','와'),j2:josa('서현우','과','와'),goals:nextGoals(3)}; });
  console.log(JSON.stringify(r),errs); await b.close(); })();
