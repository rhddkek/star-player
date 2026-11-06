const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui6/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13']})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/star-player.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
 await pg.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.trust=90; S.starter=true; for(let i=0;i<6;i++) autoMatch(true); S.weekAct=null; doWeekAct('shot'); S.ach={recvAct:40}; S.player.level=5; save(); tab='home'; renderHub(); });
 await pg.waitForTimeout(300); await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal .btn.primary').forEach(b=>b.click()); document.querySelectorAll('.hub-modal,.sk-unlock,.toast').forEach(m=>m.remove()); renderHub(); });
 await pg.screenshot({path:D+'r2_home.png'});
 const home=await pg.evaluate(()=>({drill:!!el('go-drill'),drillS:S.drill}));
 await pg.evaluate(()=>{ tab='league'; renderHub(); }); await pg.waitForTimeout(200); await pg.screenshot({path:D+'r2_league.png'});
 const lg=await pg.evaluate(()=>({poy:!!document.querySelector('.poy-race'),txt:(document.querySelector('.poy-race')||{}).innerText}));
 await pg.evaluate(()=>{ const got=achAdd({recvAct:0}); window._got=got; tab='player'; renderHub(); }); await pg.waitForTimeout(200); await pg.screenshot({path:D+'r2_trait.png'});
 const tr=await pg.evaluate(()=>({un:S.player.traitsUn,btn:[...document.querySelectorAll('[data-tr2]')].map(b=>b.textContent)}));
 // 드릴 실행
 await pg.evaluate(()=>{ startPractice('drill_shot'); }); await pg.waitForTimeout(1200);
 const dr=await pg.evaluate(()=>({chal:M.chal&&M.chal.id,need:M.chal&&M.chal.need,time:M.chal&&M.chal.time}));
 await pg.evaluate(()=>{ for(let i=0;i<5;i++) chalProg(); }); await pg.waitForTimeout(1200); await pg.screenshot({path:D+'r2_drill.png'});
 const dr2=await pg.evaluate(()=>({done:S.drill&&S.drill.done,tg:S.player.tg,txt:el('m-overlay').innerText.slice(0,120)}));
 await pg.evaluate(()=>{ endPractice(); });
 // 경기: 스킬 무브 · 교체 · 눈
 await pg.evaluate(()=>{ S.noReplay=true; S.round=12; startMatch(false); }); await pg.waitForTimeout(800); await pg.evaluate(()=>{ el('lu-go').click(); }); await pg.waitForTimeout(3500);
 const mv=await pg.evaluate(()=>{ const u=M.user; el('banner').classList.remove('show'); setOwner(u,{clean:true}); M.ball.x=u.x; M.ball.y=u.y; M.turnCd=0; M._pj={jx:0,jy:-1}; M.joyRaw=null; input.joyActive=true; input.jx=0; input.jy=1; updateUser(1/30); const turned=(M.stats.moves||0)>=1; M._spDown=false; M.feintCd=0; input.jx=1; input.jy=0; input.sprint=true; updateUser(1/30); input.sprint=false; updateUser(1/30); M._spTap=M.t; input.sprint=true; updateUser(1/30); const feinted=(M.stats.moves||0)>=2; input.sprint=false; return {turned,feinted,moves:M.stats.moves}; });
 await pg.evaluate(()=>{ M.weather='snow'; M.players.forEach(q=>{ if(q.team===0&&!q.isUser&&q.sta!=null) q.sta=0.25; }); M.score=[0,1]; halftimeShow(); }); await pg.waitForTimeout(300); await pg.screenshot({path:D+'r2_half.png'});
 const sb=await pg.evaluate(()=>{ const btns=document.querySelectorAll('[data-htsub]'); btns[0].click(); return {n:btns.length,picked:M._subPick&&M._subPick.size}; });
 await pg.evaluate(()=>{ el('ht-go').click(); }); await pg.waitForTimeout(500);
 const sb2=await pg.evaluate(()=>({subbed:M.players.filter(q=>q.subbed).length,tl:M.tl.slice(-3).map(x=>x.t),sw:M.tacSwT>M.t,weather:M.weather}));
 await pg.screenshot({path:D+'r2_snow.png'});
 console.log(JSON.stringify({home,lg,tr,dr,dr2,mv,sb,sb2})); console.log(errs.slice(0,4)); await b.close(); })();
