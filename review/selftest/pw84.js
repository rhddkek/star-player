const {chromium,devices}=require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ proSkipAll(0); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; document.getElementById('btn-go').click(); });
  await pg.waitForTimeout(800); await pg.evaluate(()=>{ const g=document.getElementById('lu-go'); if(g) g.click(); });
  await pg.waitForTimeout(3000);
  const r=await pg.evaluate(async()=>{ const out={tries:0,ret:0,why:{},hints:{}}; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    for(let k=0;k<40;k++){ if(!M) break; M.restart=null; M.setPiece=null; M.freeze=0; el('m-overlay').hidden=true; M.paused=false;
      const u=M.user; const opp=M.players.filter(q=>q.team===1&&q.role!=='GK');
      u.x=10+Math.random()*48; u.y=30+Math.random()*50; const mates=M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK').sort((a,c)=>dist(a,u)-dist(c,u)); const mt=mates[0]; mt.x=clamp(u.x+(Math.random()<0.5?-1:1)*(6+Math.random()*6),4,64); mt.y=u.y-2-Math.random()*6;
      setOwner(u,{clean:true}); u.touchT=0; u.fx=0; u.fy=-1; passTo(u,mt,{power:0.5}); out.tries++; let got=false, seenWhy=null, hint=null;
      for(let t=0;t<60;t++){ input.joyActive=true; input.jx=0; input.jy=-1; await sleep(50); if(!M) break; if(M.giveGo&&M.giveGo.dec===false&&M.giveGo.why) seenWhy=M.giveGo.why; const ah=actHint(); if(ah&&/리턴/.test(ah.t)) hint=ah.t; if(M.ball.passTarget===u&&M.ball.lastKicker===mt){ got=true; break; } if(M.ball.owner&&M.ball.owner!==mt&&M.ball.owner!==u&&t>10) break; }
      input.joyActive=false; if(got) out.ret++; if(seenWhy) out.why[seenWhy]=(out.why[seenWhy]||0)+1; if(hint) out.hints[hint]=(out.hints[hint]||0)+1; await sleep(300); }
    return out; });
  console.log(JSON.stringify(r),errs); await b.close(); })();
