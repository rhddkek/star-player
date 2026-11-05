const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/selftest/';
const log=(...a)=>console.log(a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '));
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>{ errs.push(e.message); log('PAGEERROR',e.message); });
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ S.prologue={stage:'offers',r:{my:2,op:1,win:true,pk:false,rating:7.6,goals:1,assists:0},offers:proOffers({rating:7.6,goals:1,assists:0})}; showProOffers(); });
  await pg.waitForTimeout(600); await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(700); await pg.evaluate(()=>{ const x=document.getElementById('ci-ok'); if(x) x.click(); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; });
  // 주간 요청: round 맞추기
  await pg.evaluate(()=>{ let r=1; while(((r)+(S.season)*7)%3!==0) r++; S.round=r; tab='home'; renderHub(); }); await pg.waitForTimeout(300);
  log('요청',await pg.evaluate(()=>({req:weekReq(),btn:!!document.querySelector('.wk-home [data-q=req]'),txt:(document.querySelector('.wk-home [data-q=req]')||{}).textContent})));
  await pg.evaluate(()=>{ document.querySelector('.wk-home').scrollIntoView({block:'center'}); }); await pg.screenshot({path:D+'50_req.png'});
  const before=await pg.evaluate(()=>({cond:S.player.cond,trust:S.trust,rep:S.player.rep,money:S.player.money,chem:S.buddy&&S.buddy.chem}));
  await pg.click('.wk-home [data-q=req]'); await pg.waitForTimeout(300); log('요청 수락',before,await pg.evaluate(()=>({cond:S.player.cond,trust:S.trust,rep:S.player.rep,money:S.player.money,chem:S.buddy&&S.buddy.chem,act:S.weekAct,msg:S.weekMsg})));
  // 연습장 메뉴
  await pg.evaluate(()=>{ S.weekAct=null; renderHub(); }); await pg.click('#btn-practice'); await pg.waitForTimeout(300); await pg.screenshot({path:D+'51_prmenu.png'});
  log('메뉴',await pg.evaluate(()=>[...document.querySelectorAll('.hub-modal [data-pm]')].map(b=>b.textContent.trim().slice(0,40))));
  await pg.click('.hub-modal [data-pm=last]'); await pg.waitForTimeout(1800); await pg.screenshot({path:D+'52_chal_last.png'});
  log('마지막 공격',await pg.evaluate(()=>({chal:M.chal&&{id:M.chal.id,prog:M.chal.prog,t:Math.round(M.chal.t)},defs:M.players.filter(q=>q.team===1).length,sct:el('sc-t').textContent,objs:el('objs').textContent})));
  // 골 넣기 시뮬
  await pg.evaluate(()=>{ M.freeze=0; M.paused=false; M.players.filter(q=>q.team===1).forEach(q=>{ q.x=5; q.y=50; q.catchT=0; }); const u=M.user,b=M.ball; b.owner=null; u.x=W/2; u.y=8; b.x=W/2; b.y=1; b.vx=0; b.vy=-30; b.z=0.2; b.lastKicker=u; b.isShot=true; }); await pg.waitForTimeout(1800);
  log('골 후',await pg.evaluate(()=>({score:M&&M.score,prog:M&&M.chal.prog,over:M&&M.chal.over,ov:!el('m-overlay').hidden,txt:el('m-overlay').textContent.replace(/\s+/g,' ').slice(0,120),money:S.player.money,chal:S.chal})));
  await pg.screenshot({path:D+'53_chal_win.png'});
  // 다른 도전: 압박 탈출 — 시간 종료
  await pg.click('#ch-menu'); await pg.waitForTimeout(300); await pg.click('.hub-modal [data-pm=escape]'); await pg.waitForTimeout(1500);
  log('압박 탈출 배치',await pg.evaluate(()=>{ const u=M.user; return {defs:M.players.filter(q=>q.team===1&&q.role!=='GK').map(q=>[Math.round(q.x-u.x),Math.round(q.y-u.y)]),owner:M.ball.owner===u,sct:el('sc-t').textContent}; }));
  await pg.evaluate(()=>{ M.chal.t=M.chal.time-0.5; M.freeze=0; }); await pg.waitForTimeout(1500); log('시간 종료',await pg.evaluate(()=>({ov:!el('m-overlay').hidden,txt:el('m-overlay').textContent.replace(/\s+/g,' ').slice(0,140)}))); await pg.screenshot({path:D+'54_chal_fail.png'});
  await pg.click('#ch-again'); await pg.waitForTimeout(500); log('재도전',await pg.evaluate(()=>({t:M.chal.t,prog:M.chal.prog,over:M.chal.over,ov:!el('m-overlay').hidden})));
  await pg.evaluate(()=>{ chalProg(); }); await pg.waitForTimeout(100); await pg.evaluate(()=>{ chalProg(); chalProg(); }); await pg.waitForTimeout(1200); log('탈출 완료',await pg.evaluate(()=>({txt:el('m-overlay').textContent.replace(/\s+/g,' ').slice(0,100),chal:S.chal})));
  // 원투 도전: walls 증가 + 박스 진입
  await pg.click('#ch-menu'); await pg.waitForTimeout(300); await pg.click('.hub-modal [data-pm=onetwo]'); await pg.waitForTimeout(1500);
  await pg.evaluate(()=>{ M.freeze=0; M.stats.walls=(M.stats.walls||0)+1; }); await pg.waitForTimeout(200); await pg.evaluate(()=>{ const u=M.user; u.x=W/2; u.y=14; setOwner(u,{clean:true}); }); await pg.waitForTimeout(600);
  log('원투 진행',await pg.evaluate(()=>({prog:M.chal.prog,w0:M.chalW0}))); await pg.evaluate(()=>endPractice()); await pg.waitForTimeout(300);
  // 결과 화면 버튼 (가짜 r)
  await pg.evaluate(()=>{ const ev=nextEvent(); const r={venue:null,home:true,opp:ev.opp,ga:1,gb:2,goals:0,assists:0,rating:6.2,auto:false,shots:2,passes:8,passOk:5,tackles:1,events:[],cards:0,ev,touches:20,playedFrac:1,objRes:[{t:'유효 슈팅 1회',done:false}],onT:0,keyPass:0,quickLoss:3,recvPress:4,walls:0,headers:0,pressWins:0,chem:null,buddyPlayed:true}; S.player.money=5000; renderResult(r,{xp:50,rep:10,money:80,lvls:[],myG:1,oppG:2,motm:false,notes:[],trust:{d:-2,v:58},buddy:null,titles:[]}); });
  await pg.waitForTimeout(300); log('결과 버튼',await pg.evaluate(()=>[...document.querySelectorAll('.res-go button')].map(b=>b.textContent))); await pg.evaluate(()=>{ document.querySelector('.res-go').scrollIntoView(); }); await pg.screenshot({path:D+'55_res_btns.png'});
  await pg.click('#res-chal'); await pg.waitForTimeout(1500); log('결과→도전',await pg.evaluate(()=>({chal:M&&M.chal&&M.chal.id,screen:[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(',')})));
  log('페이지 오류',errs.length,errs.slice(0,5)); await b.close(); log('DONE'); })().catch(e=>{ console.log('FATAL',e.message); });
