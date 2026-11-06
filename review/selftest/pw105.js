const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui6/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13']})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/star-player.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
 await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.compIntro=false; S.trust=90; S.starter=true; S.player.rep=600; for(let i=0;i<3;i++) autoMatch(true); S.buddy.chem=75; S.weekEvt=weekEvent(); save(); tab='home'; renderHub(); }); await pg.waitForTimeout(300); await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal .btn.primary').forEach(b=>b.click()); document.querySelectorAll('.hub-modal,.sk-unlock').forEach(m=>m.remove()); S.trustIntro=true; S.roleIntro=true; save(); renderHub(); });
 await pg.waitForTimeout(300); await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove())); await pg.screenshot({path:D+'home_evt.png'});
 const ev=await pg.evaluate(()=>({evt:S.weekEvt&&S.weekEvt.t,btn:document.querySelectorAll('[data-we]').length}));
 await pg.evaluate(()=>{ document.querySelector('[data-we="0"]').click(); }); await pg.waitForTimeout(200);
 const ev2=await pg.evaluate(()=>({evt:S.weekEvt}));
 // 경기: 라인업 성향, 코너 침투, 텔레파시
 await pg.evaluate(()=>{ S.noReplay=true; startMatch(false); }); await pg.waitForTimeout(800);
 const lu=await pg.evaluate(()=>{ const d=[...document.querySelectorAll('.lu-dot')].slice(0,12).map(x=>x.dataset.ps); const styles=M.players.filter(q=>!q.isUser&&q.role!=='GK').map(q=>q.style); return {d,styles,n:styles.filter(Boolean).length}; });
 await pg.evaluate(()=>{ document.querySelectorAll('.lu-dot')[13].click(); }); await pg.waitForTimeout(200); await pg.screenshot({path:D+'lineup.png'});
 await pg.evaluate(()=>{ el('lu-go').click(); }); await pg.waitForTimeout(3500);
 await pg.evaluate(()=>{ el('banner').classList.remove('show'); M.ball.owner=null; startSetPieceNow('corner',0,{x:W-0.5,y:0.5}); M.freeze=0; }); await pg.waitForTimeout(400);
 const cr=await pg.evaluate(()=>({run:!!M.cornerRun,ux:Math.round(M.user.x),uy:Math.round(M.user.y),taker:M.setPiece&&M.setPiece.taker.isUser}));
 await pg.screenshot({path:D+'corner.png'});
 await pg.waitForTimeout(2600); const cr2=await pg.evaluate(()=>({own:M.ball.owner?(M.ball.owner.isUser?'me':'other'):'none',pt:M.ball.passTarget&&M.ball.passTarget.isUser}));
 // 체력
 await pg.evaluate(()=>{ M.min=80; M.players.forEach(q=>{ if(q.sta!=null&&q.team===1) q.sta=0.3; }); }); await pg.waitForTimeout(600); await pg.screenshot({path:D+'tired.png'});
 const st=await pg.evaluate(()=>({sta:M.players.filter(q=>!q.isUser&&q.sta!=null).map(q=>+q.sta.toFixed(2)).slice(0,6),ms:+maxSpeed(M.players.find(q=>q.team===1&&q.role==='FW')).toFixed(2)}));
 // 커리어 카드
 await pg.evaluate(()=>{ ambience(false); cancelAnimationFrame(raf); M=null; show('screen-hub'); const cv=careerCardPNG(false); document.body.innerHTML=''; cv.style.width='390px'; document.body.append(cv); document.body.style.background='#000'; });
 await pg.waitForTimeout(300); await pg.screenshot({path:D+'card.png',fullPage:true});
 console.log(JSON.stringify({ev,ev2:ev2.evt,lu:lu.d.slice(0,5),nStyles:lu.n,cr,cr2,st})); console.log(errs.slice(0,4)); await b.close(); })();
