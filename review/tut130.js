const {chromium,devices}=require('playwright');
const FILE='file:///home/claude/star-player/index.html'; const mode=process.argv[2]||'pc';
(async()=>{ const b=await chromium.launch();
  const ctx=await b.newContext(mode==='pc'?{viewport:{width:620,height:920}}:mode==='land'?{viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{...devices['iPhone 13']});
  const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(FILE); await pg.click('#go-create'); await pg.click('#btn-new'); await pg.waitForTimeout(700); await pg.click('#cut-skip'); await pg.waitForTimeout(2600);
  const st=()=>pg.evaluate(()=>({i:M&&M.tut?M.tut.i:-1,done:M&&M.tut&&M.tut.done,own:M&&M.ball.owner?(M.ball.owner.isUser?'me':M.ball.owner.team===0?'mate':'opp'):'none',u:M?[+M.user.x.toFixed(1),+M.user.y.toFixed(1)]:0,mk:M&&M.tut&&M.tut.mk,bar:el('tut-bar').hidden?'':el('tut-bar').textContent,hl:[...document.querySelectorAll('.tut-hl')].map(x=>x.id),n:M?M.players.length:0,lab:['k-pass','k-shot','k-thru'].map(k=>el(k).querySelector('span').textContent),ov:!el('m-overlay').hidden,frz:M&&+M.freeze.toFixed(2),out:el('btn-prout').hidden?'':el('btn-prout').textContent}));
  const shot=n=>pg.screenshot({path:`tut_${mode}_${n}.png`});
  console.log('start',JSON.stringify(await st())); await shot(0);
  if(mode==='pc'){
    const steer=async(sprint,stop)=>{ for(let k=0;k<160;k++){ const d=await pg.evaluate(()=>{ const T=M.tut; if(!T.mk) return null; return {dx:T.mk.x-M.user.x,dy:T.mk.y-M.user.y,i:T.i}; }); if(!d||await stop()) break; for(const [key,on] of [['ArrowLeft',d.dx<-0.8],['ArrowRight',d.dx>0.8],['ArrowUp',d.dy<-0.8],['ArrowDown',d.dy>0.8]]){ if(on) await pg.keyboard.down(key); else await pg.keyboard.up(key); } if(sprint) await pg.keyboard.down('Space'); await pg.waitForTimeout(60); } for(const k of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space']) await pg.keyboard.up(k); };
    await steer(false,async()=>(await st()).i!==0); console.log('after move',JSON.stringify(await st()));
    // 달리기 없이 가 보기 → 다시 요구되는지
    await steer(false,async()=>{ const s=await st(); return s.i!==1||(s.mk&&s.mk.y>30); }); console.log('sprint w/o',JSON.stringify(await st()));
    await steer(true,async()=>(await st()).i!==1); console.log('after sprint',JSON.stringify(await st())); await shot(2);
    const until=async(f,ms=6000)=>{ const t0=Date.now(); while(Date.now()-t0<ms){ if(await f()) return true; await pg.waitForTimeout(80); } return false; };
    await pg.waitForTimeout(600); let pk=false; for(let r=0;r<4&&!pk;r++){ await until(async()=>{ const x=await st(); return x.own==='me'&&x.frz<=0; },5000); await pg.waitForTimeout(300); await pg.keyboard.press('z'); pk=await until(async()=>(await st()).i===3,2500); console.log('pass try',r,pk); } console.log('pass ok',pk,JSON.stringify(await st())); await shot(3);
    await pg.waitForTimeout(2500); console.log('mate holds?',JSON.stringify(await st()));
    await pg.keyboard.down('x'); await pg.waitForTimeout(80); await pg.keyboard.up('x'); console.log('req ok',await until(async()=>(await st()).i===4),JSON.stringify(await st())); await shot(4);
    for(let k=0;k<160;k++){ const y=await pg.evaluate(()=>M.user.y); const x=await pg.evaluate(()=>M.user.x-W/2); if(y<13) break; await pg.keyboard.down('ArrowUp'); if(x>1) await pg.keyboard.down('ArrowLeft'); else await pg.keyboard.up('ArrowLeft'); if(x<-1) await pg.keyboard.down('ArrowRight'); else await pg.keyboard.up('ArrowRight'); await pg.waitForTimeout(60); }
    await pg.keyboard.up('ArrowLeft'); await pg.keyboard.up('ArrowRight'); await pg.keyboard.down('x'); await pg.waitForTimeout(350); await pg.keyboard.up('x'); await pg.keyboard.up('ArrowUp');
    console.log('goal ok',await until(async()=>(await st()).i===5,5000),JSON.stringify(await st())); await pg.waitForTimeout(2200); console.log('tackle scene',JSON.stringify(await st())); await shot(5);
    for(let k=0;k<80;k++){ const d=await pg.evaluate(()=>M.tut&&M.tut.def?dist(M.user,M.tut.def):99); if(d<1.7) break; await pg.keyboard.down('ArrowUp'); await pg.waitForTimeout(60); }
    await pg.keyboard.up('ArrowUp'); await pg.keyboard.press('z'); console.log('tackle ok',await until(async()=>(await st()).ov,4000),JSON.stringify(await st())); await shot(6);
    await pg.click('#wm-go'); await pg.waitForTimeout(800); console.log('final',JSON.stringify(await pg.evaluate(()=>({pro:!!(M&&M.ev.pro),tut:!!(M&&M.tut),bar:el('tut-bar').hidden,hl:document.querySelectorAll('.tut-hl').length,warmDone:S.warmDone,n:M.players.length}))));
  } else {
    for(let i=0;i<6;i++){ await pg.waitForTimeout(700); await shot('s'+i); console.log(i,JSON.stringify(await st())); await pg.evaluate(()=>{ tutNext(); }); }
    await pg.waitForTimeout(1500); await shot('fin'); console.log('fin',JSON.stringify(await st()));
  }
  console.log('errs',errs.slice(0,5)); await b.close(); })();
