// 스타 플레이어 회귀 테스트 — 업데이트할 때마다 실행
// node regress.js [html경로]
const {chromium,devices}=require('playwright');
const FILE='file://'+(process.argv[2]||'/home/claude/star-player.html');
const results=[]; const ok=(name,cond,info='')=>{ results.push([cond?'통과':'실패',name,info]); };
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({...devices['iPhone 13']}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(FILE); await pg.click('#btn-new'); await pg.waitForTimeout(700);
  // 프롤로그: 오프닝 애니메이션 → 건너뛰기 → 고교 결승 → 스카우트 제안 → 입단 → 주전 경쟁
  { const p0=await pg.evaluate(()=>({cut:!el('screen-cut').hidden,skip:!!el('cut-skip'),stage:S.prologue&&S.prologue.stage}));
    await pg.click('#cut-skip'); await pg.waitForTimeout(500);
    const pw=await pg.evaluate(()=>({warm:!!(M&&M.practice&&M.chal&&M.chal.id==='warm'),defs:M?M.players.filter(q=>q.team===1&&q.role!=='GK').length:-1,me:M&&M.me.name,mateHas:!!(M&&M.ball.owner&&M.ball.owner.team===0&&!M.ball.owner.isUser)}));
    await pg.evaluate(()=>warmDone()); await pg.waitForTimeout(500);
    const p1=await pg.evaluate(()=>({match:!el('screen-match').hidden,pro:!!(M&&M.ev.pro),me:M&&M.me.name,bench:!!(M&&M.bench),warmDone:S.warmDone}));
    ok('프롤로그 워밍업: 컷신 뒤 수비 없는 연습(동료 패스 → 슛) → 결승전으로', pw.warm&&pw.defs===0&&pw.me==='칠성고'&&pw.mateHas&&p1.warmDone===true, JSON.stringify(pw));
    await pg.evaluate(()=>{ if(el('tut-go')) el('tut-go').click(); M.score=[2,1]; M.stats.goals=1; M.min=90; M.over=true; concludeMatch(); }); await pg.waitForTimeout(400);
    const p2=await pg.evaluate(()=>({pro:!el('screen-pro').hidden,offers:document.querySelectorAll('#pro-col [data-pj]').length,kr:S.prologue.offers.every(o=>CLUBS[o.club].country==='kr')}));
    await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(500);
    const p3=await pg.evaluate(()=>{ const o=S.proDone; return {hub:!el('screen-hub').hidden,club:S.clubId,trust:S.trust,comp:!!(S.comp&&S.comp.name),modal:!!document.querySelector('.ci-card'),strip:!!document.querySelector('#tab-home .tstrip'),pro:S.prologue}; });
    ok('프롤로그: 오프닝 애니메이션(건너뛰기) → 고교 결승 → 국내 스카우트 제안 → 입단 → 주전 경쟁 안내', p0.cut&&p0.skip&&p0.stage==='intro'&&p1.match&&p1.pro&&p1.me==='칠성고'&&!p1.bench&&p2.pro&&p2.offers>=2&&p2.kr&&p3.hub&&p3.trust>0&&p3.comp&&p3.modal&&p3.strip&&p3.pro==null, JSON.stringify({p0,p1,p2,p3}));
    await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); }); }
  // 감독 신뢰: 활약하면 선발 확정, 부진하면 벤치
  { const tr=await pg.evaluate(()=>{ S.trust=55; S.starter=false; const a=trustAfterMatch({rating:7.6,goals:1,assists:0,objRes:[{done:true}]},{type:'league'}); const b0=isBenched(); let n=0, d=null; while(S.starter&&n<8){ d=trustAfterMatch({rating:4.8,goals:0,assists:0},{type:'league'}); n++; } const b1=isBenched();
      S.weekAct=null; S.player.injury=0; const t0=S.trust; doWeekAct('shot'); const tTrain=S.trust-t0; S.weekAct=null; S.player.rep=Math.max(S.player.rep,200); const t1=S.trust; doWeekAct('ad'); const tAd=S.trust-t1; S.weekAct=null; return {up:a.up,b0,down:d&&d.down,b1,n,tTrain,tAd}; });
    ok('감독 신뢰: 활약 → 선발 확정, 연속 부진 → 벤치, 훈련 +2 · 광고 −2', tr.up&&!tr.b0&&tr.down&&tr.b1&&tr.tTrain===2&&tr.tAd===-2, JSON.stringify(tr)); }
  await pg.evaluate(()=>{ S.trust=70; S.starter=true; S.tutSeen=true; S.noReplay=true; save(); renderHub(); });

  // 1) 능력치 배분 → 취소 → 적용
  await pg.evaluate(()=>{ S.player.points=4; save(); renderHub(); });
  await pg.click('#tabs button[data-tab="player"]'); await pg.waitForTimeout(250);
  const before=await pg.evaluate(()=>({pts:S.player.points,st:{...S.player.stats}}));
  const plus=await pg.$$('button[data-p]'); if(plus[0]){ await plus[0].click(); await pg.waitForTimeout(80); }
  const plus2=await pg.$$('button[data-p]'); if(plus2[0]){ await plus2[0].click(); await pg.waitForTimeout(80); }
  await pg.click('#pt-undo'); await pg.waitForTimeout(120);
  const afterUndo=await pg.evaluate(()=>({pts:S.player.points,st:{...S.player.stats},pend:Object.values(renderPlayer.pend||{}).reduce((a,c)=>a+c,0)}));
  ok('능력치 취소: 포인트·능력치 그대로', afterUndo.pts===before.pts&&JSON.stringify(afterUndo.st)===JSON.stringify(before.st)&&afterUndo.pend===0, JSON.stringify(afterUndo.pend));
  const p3=await pg.$$('button[data-p]'); if(p3[0]){ await p3[0].click(); await pg.waitForTimeout(60); } const p4=await pg.$$('button[data-p]'); if(p4[0]){ await p4[0].click(); await pg.waitForTimeout(60); }
  await pg.click('#pt-apply'); await pg.waitForTimeout(150);
  const afterApply=await pg.evaluate(()=>({pts:S.player.points,sum:Object.values(S.player.stats).reduce((a,c)=>a+c,0)}));
  const sumBefore=Object.values(before.st).reduce((a,c)=>a+c,0);
  ok('능력치 적용: 2포인트 차감·합계 +2', afterApply.pts===before.pts-2&&afterApply.sum===sumBefore+2, `pts ${before.pts}→${afterApply.pts}, 합 ${sumBefore}→${afterApply.sum}`);

  // 2) 스킬 구매 → 강화 → 장착 교체
  await pg.evaluate(()=>{ S.player.money=99999; S.player.level=12; save(); renderSkill.sel='fire'; renderSkill.f='all'; renderHub(); });
  await pg.click('#tabs button[data-tab="skill"]'); await pg.waitForTimeout(250);
  const m0=await pg.evaluate(()=>S.player.money);
  await pg.click('#sk-buy'); await pg.waitForTimeout(200);
  const bought=await pg.evaluate(()=>({has:S.player.skills.includes('fire'),money:S.player.money,eq:S.player.equip.slice()}));
  ok('스킬 구매: 보유 추가·가격만큼 차감', bought.has&&m0-bought.money===600, `차감 ${m0-bought.money}`);
  const br=await pg.$('button[data-br="a"]'); if(br){ await br.click(); await pg.waitForTimeout(120); }
  const m1=await pg.evaluate(()=>S.player.money); const upBtn=await pg.$('#sk-up'); if(upBtn){ await upBtn.click(); await pg.waitForTimeout(200); }
  const up=await pg.evaluate(()=>({lv:(S.player.skillUp.fire||{}).lv,path:(S.player.skillUp.fire||{}).path,money:S.player.money}));
  ok('스킬 강화: Lv.2·위력 경로·비용 차감', up.lv===2&&up.path==='a'&&m1-up.money>0, JSON.stringify(up));
  await pg.click('#sk-pick'); await pg.waitForTimeout(120); await pg.click('button[data-slot="1"]',{force:true}); await pg.waitForTimeout(150);
  const eq=await pg.evaluate(()=>S.player.equip.slice());
  ok('장착 위치 변경: 2번 칸에 화염 슛, 중복 없음', eq[1]==='fire'&&eq.filter(x=>x==='fire').length===1, JSON.stringify(eq));

  // 3) 경기 진행 → 결과 → 다음 경기, HUD 초기화
  await pg.click('#tabs button[data-tab="home"]'); await pg.waitForTimeout(200);
  const round0=await pg.evaluate(()=>S.round||S.week||0);
  await pg.click('#btn-go'); await pg.waitForTimeout(500); const lu=await pg.$('#lu-go'); if(lu) await lu.click(); await pg.waitForTimeout(1500);
  const live=await pg.evaluate(()=>!!M&&!M.over); ok('경기 시작', live);
  // 실제 조작 몇 가지: 스루·크로스·슛 버튼 누르기
  await pg.evaluate(()=>{ el('banner').classList.remove('show'); M.freeze=0; M.restart=null; M.setPiece=null; M.introT=0; const u=M.user; u.x=60; u.y=20; setOwner(u); u.touchT=0; u.protT=5; });
  const crossLbl=await pg.evaluate(()=>{ draw(); return el('k-pass').querySelector('span').textContent; });
  await pg.waitForTimeout(150); const crossLbl2=await pg.evaluate(()=>el('k-pass').querySelector('span').textContent);
  ok('측면 깊은 곳에서 패스 버튼 = 크로스', crossLbl2==='크로스', crossLbl2);
  await pg.dispatchEvent('#k-pass','pointerdown',{pointerId:1}); await pg.waitForTimeout(500); await pg.dispatchEvent('#k-pass','pointerup',{pointerId:1}); await pg.waitForTimeout(300);
  const crossed=await pg.evaluate(()=>(M.stats.crosses||0)); ok('크로스 실행', crossed>=1, String(crossed));
  await pg.evaluate(()=>{ M.freeze=0; M.restart=null; M.setPiece=null; const u=M.user; u.x=34; u.y=50; setOwner(u); u.touchT=0; u.protT=5; const fw=M.players.find(p=>p.team===0&&!p.isUser&&p.role==='FW'); fw.x=38; fw.y=40; fw.vy=-6; });
  await pg.dispatchEvent('#k-thru','pointerdown',{pointerId:2}); await pg.waitForTimeout(150); await pg.dispatchEvent('#k-thru','pointerup',{pointerId:2}); await pg.waitForTimeout(200);
  const thru=await pg.evaluate(()=>(M.stats.thru||0)); ok('스루패스 실행', thru>=1, String(thru));
  await pg.evaluate(()=>{ M.freeze=0; M.restart=null; M.setPiece=null; const u=M.user; u.x=34; u.y=14; setOwner(u); u.touchT=0; u.protT=5; });
  const box=await pg.$eval('#k-shot',e=>{ const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; });
  const sh0=await pg.evaluate(()=>M.stats.shots);
  await pg.mouse.move(box.x,box.y); await pg.mouse.down(); await pg.mouse.move(box.x,box.y-45,{steps:4}); await pg.mouse.up(); await pg.waitForTimeout(250);
  const chip=await pg.evaluate(()=>({shots:M.stats.shots,lob:!!M.ball.chipLob}));
  ok('슛 버튼 위로 밀기 = 칩/로빙슛', chip.shots===sh0+1&&chip.lob, JSON.stringify(chip));
  // 남은 경기 넘기기
  await pg.evaluate(()=>{ M.paused=false; }); await pg.click('#btn-skip'); await pg.waitForTimeout(300); const sk=await pg.$('#pz-skip'); if(sk) await sk.click(); await pg.waitForTimeout(200); const yes=await pg.$('#ov-yes'); if(yes) await yes.click();
  await pg.waitForTimeout(4000);
  let onResult=await pg.evaluate(()=>!el('result-col').closest('.screen').hidden);
  for(let i=0;i<10&&!onResult;i++){ await pg.waitForTimeout(800); onResult=await pg.evaluate(()=>!el('result-col').closest('.screen').hidden); }
  ok('경기 종료 → 결과 화면', onResult);
  for(let i=0;i<10;i++){ const home=await pg.evaluate(()=>!el('btn-go').closest('.screen').hidden&&el('m-overlay').hidden); if(home) break; await pg.evaluate(()=>{ const bs=[...document.querySelectorAll('#result-col button.btn.primary, .overlay:not([hidden]) button.btn.primary, .overlay:not([hidden]) button.btn')].filter(b=>b.offsetParent); if(bs[0]) bs[0].click(); }); await pg.waitForTimeout(500); }
  const hub=await pg.evaluate(()=>({round:S.round||S.week||0,M:typeof M!=='undefined'&&M?{over:M.over}:null}));
  ok('결과 → 홈 복귀·라운드 진행', hub.round>round0, `라운드 ${round0}→${hub.round}`);
  await pg.click('#btn-go').catch(()=>{}); await pg.waitForTimeout(500); const lu2=await pg.$('#lu-go'); if(lu2) await lu2.click(); await pg.waitForTimeout(1200);
  const hud=await pg.evaluate(()=>({min:M.min,score:M.score.join('-'),mp:Math.round(M.mp),sta:Math.round(M.sta),ult:JSON.stringify(M.ultN||{}),stats:M.stats.shots}));
  ok('다음 경기 HUD 초기화(시간·점수·슈팅·필살기 횟수)', hud.min<5&&hud.score==='0-0'&&hud.stats===0&&hud.ult==='{}', JSON.stringify(hud));
  // 달리기·체력·기력
  await pg.evaluate(()=>{ M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; M.ball.owner=null; M.ball.x=60; M.ball.y=100; const u=M.user; u.x=34; u.y=80; u.vx=u.vy=0; input.joyActive=true; input.jx=0; input.jy=-1; });
  await pg.waitForTimeout(900); const walk=await pg.evaluate(()=>Math.hypot(M.user.vx,M.user.vy));
  await pg.dispatchEvent('#k-sprint','pointerdown',{pointerId:3}); await pg.waitForTimeout(900);
  const run=await pg.evaluate(()=>({v:Math.hypot(M.user.vx,M.user.vy),on:M.sprinting,sta:M.sta,mp:M.mp,an:animFor(M.user).an}));
  await pg.dispatchEvent('#k-sprint','pointerup',{pointerId:3}); await pg.evaluate(()=>{ input.joyActive=false; input.jx=input.jy=0; });
  ok('달리기 버튼: 속도 30% 이상 증가 + 전력 질주 모션', run.on&&run.v>walk*1.3&&run.an==='sprint', `${walk.toFixed(1)}→${run.v.toFixed(1)}m/s ${run.an}`);
  { const sp=await pg.evaluate(()=>{ const u=M.user; M.freeze=0; M.restart=null; M.setPiece=null; u.x=34; u.y=60; setOwner(u,{clean:true}); u.touchT=0; u.protT=3; M.decisionT=0; for(let i=0;i<40;i++){ u.vx=u.vy=0; updateAI(1/30); M.players.forEach(q=>{ if(!q.isUser){ q.x+=q.vx/30; q.y+=q.vy/30; } }); M.t+=1/30; } return {sup:(M.uSup||[]).length,spots:(M.uSpots||[]).length,d:(M.uSup||[]).map(q=>+dist(q,u).toFixed(1))}; });
    ok('내 선수 지원: 공을 잡으면 동료 2명이 서로 다른 빈 각도(9~16m)로 이동', sp.sup===2&&sp.spots===2&&sp.d.every(x=>x>5&&x<20), JSON.stringify(sp)); }
  { const mo=await pg.evaluate(()=>{ const D8=['south','south-east','east','north-east','north','north-west','west','south-west']; const full=['field','f2','f3','f4'].every(c=>['sprint','shoot','dribble','header','trap'].every(a=>SPRITE_DATA[c][a]&&D8.every(d=>(SPRITE_DATA[c][a][d]||[]).length>=4)));
      const u=M.user, sv={vx:u.vx,vy:u.vy,sp:M.sprinting}; const r={full}; M.sprinting=false; setOwner(u,{clean:true}); u.touchT=0; u.vx=7; u.vy=0; r.drib=animFor(u).an; M.charge={type:'shot',dur:0.4}; u.vx=0; r.charge=animFor(u).an; M.charge=null; u.shotAnimT=0.3; r.shot=animFor(u).an; u.shotAnimT=0; u.headT=0.2; r.head=animFor(u).an; u.headT=0; u.trapT=0.2; r.trap=animFor(u).an; u.trapT=0; Object.assign(u,{vx:sv.vx,vy:sv.vy}); M.sprinting=sv.sp; return r; });
    ok('세부 모션: 4체형×8방향 (질주·슛·드리블·헤딩·트래핑) · 드리블/슛 와인드업/팔로스루/헤딩/트래핑 상태 전환', mo.full&&mo.drib==='dribble'&&mo.charge==='shoot'&&mo.shot==='shoot'&&mo.head==='header'&&mo.trap==='trap', JSON.stringify(mo)); }
  ok('체력·기력 숫자 정상(NaN 아님)·달리면 체력 감소', Number.isFinite(run.sta)&&Number.isFinite(run.mp)&&run.sta<100, `체력 ${run.sta&&run.sta.toFixed(0)} 기력 ${run.mp&&run.mp.toFixed(0)}`);
  await pg.evaluate(()=>{ M.paused=true; });

  // 4) 저장 → 새로고침 → 이어하기
  const snap=await pg.evaluate(()=>{ save(); return JSON.stringify({club:S.clubId,round:S.round,season:S.season,cEnd:S.contractEnd,lv:S.player.level,skills:S.player.skills,equip:S.player.equip,apps:S.player.career.apps}); });
  await pg.reload(); await pg.waitForTimeout(700); const cont=await pg.$('#btn-continue'); if(cont) await cont.click(); await pg.waitForTimeout(600);
  const snap2=await pg.evaluate(()=>JSON.stringify({club:S.clubId,round:S.round,season:S.season,cEnd:S.contractEnd,lv:S.player.level,skills:S.player.skills,equip:S.player.equip,apps:S.player.career.apps}));
  ok('저장 → 새로고침 → 이어하기: 기록 보존', snap===snap2, snap===snap2?'':snap+' / '+snap2);

  // 6) 특성: Lv.5 해금 → 무료 선택 → 변경은 유료
  await pg.evaluate(()=>{ S.player.level=6; S.player.money=1000; S.player.trait=null; save(); renderHub(); });
  await pg.click('#tabs button[data-tab="player"]'); await pg.waitForTimeout(250);
  await pg.click('button[data-tr2="soft"]'); await pg.waitForTimeout(150);
  const t1=await pg.evaluate(()=>({t:S.player.trait,m:S.player.money}));
  await pg.click('button[data-tr2="runner"]'); await pg.waitForTimeout(150);
  const t2=await pg.evaluate(()=>({t:S.player.trait,m:S.player.money}));
  ok('특성: 첫 선택 무료, 변경 시 300만 차감', t1.t==='soft'&&t1.m===1000&&t2.t==='runner'&&t2.m===700, JSON.stringify([t1,t2]));

  // 6b) 상황 도전: 마지막 공격 진입 → 수비 3 + 타이머 → 골 → 성공 오버레이·보상
  { await pg.click('#tabs button[data-tab="home"]'); await pg.waitForTimeout(200); await pg.evaluate(()=>{ S.tutSeen=true; startPractice('last'); }); await pg.waitForTimeout(1500);
    const c1=await pg.evaluate(()=>({id:M.chal&&M.chal.id,defs:M.players.filter(q=>q.team===1&&q.role!=='GK').length,hud:el('sc-t').textContent}));
    await pg.evaluate(()=>{ M.freeze=0; M.paused=false; M.players.filter(q=>q.team===1).forEach(q=>{ q.x=5; q.y=50; q.catchT=0; }); const u=M.user,b=M.ball; b.owner=null; u.x=W/2; u.y=8; b.x=W/2; b.y=1; b.vx=0; b.vy=-30; b.z=0.2; b.lastKicker=u; b.isShot=true; const m0=S.player.money; window.__m0=m0; }); await pg.waitForTimeout(1800);
    const c2=await pg.evaluate(()=>({over:M&&M.chal.over,ov:!el('m-overlay').hidden,txt:el('m-overlay').textContent,gain:S.player.money-window.__m0,cl:S.chal&&S.chal.last}));
    await pg.evaluate(()=>endPractice()); await pg.waitForTimeout(200);
    ok('상황 도전(마지막 공격): 수비 3·타이머 HUD → 골 → 성공 오버레이 + 첫 클리어 +150만', c1.id==='last'&&c1.defs===3&&/초/.test(c1.hud)&&c2.over&&c2.ov&&/도전 성공/.test(c2.txt)&&c2.gain===150&&c2.cl===1, JSON.stringify([c1,c2])); }
  // 7) 연습장: 들어가서 슛 → 공 다시 받기 → 나와도 기록·라운드 그대로
  await pg.click('#tabs button[data-tab="home"]'); await pg.waitForTimeout(200);
  const pre=await pg.evaluate(()=>JSON.stringify({r:S.round,h:(S.history||[]).length,xp:S.player.xp,apps:S.player.career.apps}));
  await pg.click('#btn-practice'); await pg.waitForTimeout(300); const pmN=await pg.evaluate(()=>document.querySelectorAll('.hub-modal [data-pm]').length); await pg.click('.hub-modal [data-pm=free]'); await pg.waitForTimeout(1500);
  const pr1=await pg.evaluate(()=>({practice:!!(M&&M.practice),n:M.players.length,own:M.ball.owner===M.user}));
  ok('연습장 입장(메뉴: 자유+도전 3): 소수 인원·내 공으로 시작', pmN===4&&pr1.practice&&pr1.n<=6&&pr1.own, JSON.stringify(pr1)+' menu='+pmN);
  await pg.evaluate(()=>{ el('banner').classList.remove('show'); M.freeze=0; const u=M.user; u.x=34; u.y=16; setOwner(u); u.touchT=0; u.protT=2; input.shotHold=true; });
  await pg.waitForTimeout(400); await pg.evaluate(()=>{ input.shotRelease=true; }); await pg.waitForTimeout(4500);
  const pr2=await pg.evaluate(()=>({own:M.ball.owner===M.user,resets:M.prResets||0,shots:M.stats.shots,min:M.min,over:M.over}));
  ok('연습장: 슛 후 다시 내 공으로 리셋·시간 멈춤', pr2.resets>=1&&pr2.shots>=1&&pr2.min===10&&!pr2.over, JSON.stringify(pr2));
  const nsk=await pg.evaluate(async()=>{ const out={}; const NEW=['knuckle','nolook','rainbow','intercept','header','leader'];
    NEW.forEach(id=>{ if(!S.player.skills.includes(id)) S.player.skills.push(id); });
    out.defs=NEW.every(id=>SKILLS.find(s=>s.id===id)&&SK_PARAM[id]&&SK_EX[id]&&ICO[id]!=null&&!!ART.icons[ICO[id]]);
    out.sfx=['sk_knuckle','sk_rainbow','sk_nolook','sk_intercept','sk_leader','sk_dash','ult_sting'].every(k=>!!SFX_DATA[k]);
    const u=M.user; M.freeze=0; S.player.equip[0]='knuckle'; M.cds[0]=0; M.mp=100; u.x=34;u.y=28; setOwner(u,{clean:true}); u.touchT=0; useSkill(0,true,0,0);
    out.knuckle=M.ball.knuckle===true; out.vfx=(M.vfx||[]).length;
    await new Promise(r=>setTimeout(r,400)); out.img=Object.values(VFX_IMG).filter(i=>i.complete&&i.naturalWidth>0).length;
    S.player.equip[0]='leader'; M.cds[0]=0; M.mp=100; const m=M.players.find(p=>p.team===0&&!p.isUser&&p.role!=='GK'); const b0=m?m.st.pass:0; useSkill(0,false,0,0); out.leader=m?m.st.pass-b0:15;
    return out; });
  const gp=await pg.evaluate(()=>{ const out={}; out.btns=!el('btn-prreset').hidden&&!el('btn-prdef').hidden; prToggleDef(); out.noDef=M.players.filter(q=>q.team===1&&q.role!=='GK').length===0; prToggleDef(); out.def=M.players.filter(q=>q.team===1&&q.role!=='GK').length>0;
    const u=M.user; M.freeze=0; u.x=34;u.y=22; setOwner(u,{clean:true}); u.touchT=0; shoot(u,34,0,{power:0.7}); out.shot=!!M.prShot&&M.prShot.d>0; return out; });
  ok('연습장: 리셋·수비 빼기/넣기 버튼, 직전 슛 기록', gp.btns&&gp.noDef&&gp.def&&gp.shot, JSON.stringify(gp));
  ok('새 스킬 6종: 데이터·아이콘·효과음·이펙트 동작', nsk.defs&&nsk.sfx&&nsk.knuckle&&nsk.vfx>0&&nsk.img>0&&nsk.leader===15, JSON.stringify(nsk));
  await pg.click('#btn-skip'); await pg.waitForTimeout(200); await pg.click('#pr-end'); await pg.waitForTimeout(400);
  const post=await pg.evaluate(()=>JSON.stringify({r:S.round,h:(S.history||[]).length,xp:S.player.xp,apps:S.player.career.apps}));
  const onHub=await pg.evaluate(()=>!el('screen-hub').hidden&&!M);
  ok('연습 끝내기: 홈 복귀·라운드/기록/경험치 변화 없음', onHub&&pre===post, pre+' / '+post);

  // 8) 백업 내보내기 → 새 커리어 경고 → 불러오기
  const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:5000}).catch(()=>null), pg.evaluate(()=>{ save(); exportSave(); })]);
  let bkPath=null; if(dl){ bkPath='/tmp/sp_backup_test.json'; await dl.saveAs(bkPath); }
  ok('백업 내보내기: 파일 다운로드', !!dl, dl?dl.suggestedFilename():'다운로드 없음');
  const name0=await pg.evaluate(()=>S.player.name);
  await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); await pg.waitForTimeout(200);
  await pg.click('#btn-new'); await pg.waitForTimeout(250);
  const warn=await pg.$('#nw-x'); ok('저장 있을 때 새 커리어 → 덮어쓰기 경고', !!warn);
  if(warn){ await pg.click('#nw-go'); await pg.waitForTimeout(400); await pg.evaluate(()=>{ proSkipAll(); }); await pg.waitForTimeout(400); await pg.evaluate(()=>document.querySelectorAll('.hub-modal').forEach(m=>m.remove())); }
  if(bkPath){ await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); const [fc]=await Promise.all([pg.waitForEvent('filechooser'), pg.click('#btn-import')]); await fc.setFiles(bkPath); await pg.waitForTimeout(500);
    const back=await pg.evaluate(()=>{ const o=load(); return o&&o.player&&o.player.level; }); ok('백업 불러오기: 이전 커리어 복원', back===6, 'Lv.'+back); }
  { await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); const c2=await pg.$('#btn-continue'); if(c2) await c2.click(); await pg.waitForTimeout(600); }

  // 5) 모바일 각 탭: 가로 넘침·잘림
  for(const t of ['home','player','skill','shop','league','transfer']){ const btn=await pg.$(`#tabs button[data-tab="${t}"]`); if(!btn) continue; await btn.click(); await pg.waitForTimeout(250);
    const r=await pg.evaluate(()=>{ const W=window.innerWidth; const bad=[]; document.querySelectorAll('.screen:not([hidden]) *').forEach(e=>{ if(e.closest('.lg-co')) return; const b=e.getBoundingClientRect(); if(b.width>0&&b.right>W+1&&getComputedStyle(e).position!=='fixed') bad.push((e.id||e.className||e.tagName).toString().slice(0,30)+':'+Math.round(b.right)); }); return {scroll:document.documentElement.scrollWidth>W,bad:bad.slice(0,4)}; });
    ok(`모바일 ${t} 탭: 가로 넘침 없음`, !r.scroll&&r.bad.length===0, r.bad.join(', ')); }
  { const ln=await pg.evaluate(()=>{ S.number=9; save(); M=null; startMatch(false); const nums=M.players.filter(p=>p.team===0).map(p=>p.isUser?S.number:shirtNo(p)); const dup=nums.filter((n,i)=>nums.indexOf(n)!==i); const sc=el('sc-h').querySelector('span').textContent; cancelAnimationFrame(raf); ambience(false); M=null; el('m-overlay').hidden=true; show('screen-hub'); renderHub(); return {dup,sc}; });
    ok('라인업 등번호 중복 없음 · 점수판 한글 약칭', ln.dup.length===0&&/[가-힣]/.test(ln.sc), JSON.stringify(ln)); }
  { const sk=await pg.evaluate(()=>{ S.player.level=2; renderSkill.full=false; renderSkill.f='all'; tab='skill'; renderHub(); const n1=document.querySelectorAll('#tab-skill .skgrid button.sk').length; const btn=!!document.getElementById('sk-full'); renderSkill.full=true; renderHub(); const n2=document.querySelectorAll('#tab-skill .skgrid button.sk').length; renderSkill.full=false; renderHub(); return {n1,n2,btn}; });
    ok('스킬 화면: 기본은 쓸 수 있는 것+다음 해금만, 전체 보기 펼치기', sk.btn&&sk.n1<sk.n2, JSON.stringify(sk)); }
  { const lg=await pg.evaluate(()=>({n:Object.keys(S.divs).length, it:S.divs['it-1'].clubs.length, fr:S.divs['fr-1'].clubs.length, star:clubStars(CLUBS['en-1-1']), low:clubStars(CLUBS['kr-2-0']), v:S.v}));
    ok('7개국 리그(이탈리아·프랑스 포함) · 별 등급', lg.n===19&&lg.it===20&&lg.fr===18&&lg.star>=4.5&&lg.low<=1&&lg.v===4, JSON.stringify(lg)); }
  // 리그 화면: 나라 → 1·2부 → 팀/선수 순위 → 기록 종류
  { const lg2=await pg.evaluate(()=>{ for(let i=0;i<3;i++) autoMatch(true); tab='league'; renderLeague.cur=null; renderLeague.view='players'; renderLeague.pf='kp'; renderHub(); const W=innerWidth; const bad=[]; document.querySelectorAll('#tab-league *').forEach(e=>{ if(e.closest('.lg-co')) return; /* 나라 줄은 의도된 가로 스크롤 */ const b=e.getBoundingClientRect(); if(b.width>0&&b.right>W+1) bad.push((e.className||e.tagName).toString().slice(0,20)); });
      const rows=document.querySelectorAll('#tab-league table tr').length; const kpN=Object.values(S.pstats).filter(v=>v.kp>0).length, csN=Object.values(S.pstats).filter(v=>v.cs>0).length; const co=document.querySelectorAll('.lg-co button').length; renderLeague.view='table'; renderHub(); return {bad,rows,kpN,csN,co}; });
    ok('리그 화면: 나라 8칸·선수 순위(기회창출·클린시트) · 가로 넘침 없음', lg2.bad.length===0&&lg2.rows>3&&lg2.kpN>20&&lg2.csN>3&&lg2.co===8, JSON.stringify(lg2)); }
  // 3부 · 한글 약칭 · 엠블럼 · 기존 세이브 변환
  { const t3=await pg.evaluate(()=>{ const d3=['en','es','it','de','fr'].map(co=>S.divs[co+'-3']?S.divs[co+'-3'].clubs.length:0); const all=Object.values(CLUBS).filter(c=>!c.nat); const latin=all.filter(c=>/[A-Za-z]/.test(c.short)).length; const noEmb=all.filter(c=>EMB_IDX[c.id]==null).length; const shorts=['맨체스터 레드','맨체스터 스카이','강릉 파도 FC'].map(n=>all.find(c=>c.name===n).short);
      tab='league'; renderLeague.cur='en-3'; renderLeague.view='table'; renderHub(); const embs=document.querySelectorAll('#tab-league .emb').length; const sheetOk=getComputedStyle(document.documentElement).getPropertyValue('--emb').includes('data:image/png');
      const keep=JSON.stringify(S); ['en','es','it','de','fr'].forEach(co=>{ delete S.divs[co+'-3']; delete S.tables[co+'-3']; delete S.fixtures[co+'-3']; }); S.v=3; migrateV4(); const mig={v:S.v,n:Object.keys(S.divs).length,p:standings('en-3')[0].p,r:S.round}; S=JSON.parse(keep); save(); renderLeague.cur=null; renderHub();
      return {d3,latin,noEmb,shorts,embs,sheetOk,mig}; });
    ok('3부 리그(5개국) · 한글 약칭 · 엠블럼 · 기존 세이브에 3부 추가', t3.d3.join()==='24,20,20,20,18'&&t3.latin===0&&t3.noEmb===0&&t3.shorts.join()==='맨레드,맨스카이,강릉'&&t3.embs>=24&&t3.sheetOk&&t3.mig.v===4&&t3.mig.n===19&&t3.mig.p===t3.mig.r-1, JSON.stringify(t3)); }
  // 패스 엔진: 롱패스·대지를 가르는 패스·버튼
  { const pe=await pg.evaluate(async()=>{ S.noReplay=true; S.player.level=8; if(!S.player.skills.includes('split')) S.player.skills.push('split'); M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null;
      const u=M.user; u.x=16; u.y=74; setOwner(u,{clean:true}); u.touchT=0; const q=M.players.find(p=>p.team===0&&!p.isUser&&p.role!=='GK'); q.x=54; q.y=40; passTo(u,q,{power:0.95,long:true}); const b=M.ball; let zmax=0; const L=landPt(b);
      for(let i=0;i<40;i++){ updateBall(1/30); zmax=Math.max(zmax,b.z); if(b.z<=0&&i>5) break; }
      const icon=!!pxi('split'), eyeIco=ICO.eye===5&&ART.icons.length===64; const o=M.players.find(p=>p.team===1&&p.role!=='GK'); setOwner(o,{clean:true}); M._objT=0; updateHUD&&updateHUD(); const lab=el('k-shot').querySelector('span').textContent;
      cancelAnimationFrame(raf); ambience(false); M=null; show('screen-hub'); renderHub(); return {zmax:+zmax.toFixed(1),landErr:+Math.hypot(L.x-54,L.y-40).toFixed(1),icon,eyeIco,lab,gest:!!document.querySelector('#k-pass .gest')}; });
    ok('패스 엔진: 롱패스가 높이 떠서 동료 근처에 떨어짐 · 새 스킬 아이콘 · 상대 공일 때 따라가기 버튼', pe.zmax>6&&pe.landErr<9&&pe.icon&&pe.eyeIco&&pe.lab==='따라가기'&&pe.gest, JSON.stringify(pe)); }
  // 스타숍: 스폰서 계약 · 꾸미기 · 광고 촬영
  { const sh=await pg.evaluate(()=>{ endoInit(); S.player.rep=1500; S.player.money=50000; S.endo.offers=[]; S.endo.active=[]; let g=0; while(!S.endo.offers.length&&g++<20) endoMakeOffers(); const n=S.endo.offers.length; const o=S.endo.offers[0]; const m0=S.player.money; endoAccept(0);
      const signed=S.player.money-m0; const a=S.endo.active[0]; a.kpi={k:'goals',n:3,m:8,t:'test'}; const notes=[]; const pay=endoAfterMatch({goals:3,assists:3,tackles:12,rating:8,injured:false},{type:'league'},notes);
      const cats=new Set(S.endo.active.map(x=>x.cat)).size===S.endo.active.length; return {n,signed,sign:o.sign,pay,base:o.pay,done:a.done,notes:notes.length,cats,brands:ENDO_BRANDS.filter(b=>b.rep<=1500).length}; });
    ok('스폰서: 제안 생성·계약금·경기당 광고비·보너스 조건', sh.n>0&&sh.signed===sh.sign&&sh.pay>=sh.base&&sh.done&&sh.cats, JSON.stringify(sh)); }
  { await pg.evaluate(()=>{ renderShop.sub='cos'; tab='shop'; renderHub(); }); const m0=await pg.evaluate(()=>S.player.money); await pg.click('button[data-cb="b_pink"]'); await pg.waitForTimeout(150);
    const cs=await pg.evaluate(()=>({own:S.cos.owned.includes('b_pink'),eq:S.cos.eq.boot,boot:bootColor(),m:S.player.money}));
    ok('꾸미기: 핑크 축구화 구입·착용 → 경기 축구화 색', cs.own&&cs.eq==='b_pink'&&cs.boot==='#ff3fa4'&&m0-cs.m===30, JSON.stringify(cs)); }
  for(const sub of ['endo','gear','cos','life']){ const r=await pg.evaluate(sub=>{ renderShop.sub=sub; tab='shop'; renderHub(); const W=window.innerWidth; const bad=[]; document.querySelectorAll('#tab-shop *').forEach(e=>{ const b=e.getBoundingClientRect(); if(b.width>0&&b.right>W+1) bad.push((e.id||e.className||e.tagName).toString().slice(0,30)); }); return {bad,txt:el('tab-shop').textContent.length}; },sub);
    ok(`모바일 스타숍 ${sub}: 가로 넘침 없음`, r.bad.length===0&&r.txt>50, r.bad.slice(0,3).join(', ')); }
  { const ad=await pg.evaluate(()=>{ S.weekAct=null; S.player.injury=0; S.player.cond=90; tab='home'; renderHub(); document.querySelector('[data-row=week]').click(); const b=document.querySelector('.wk-sheet button[data-tr="ad"]'); if(!b) return {btn:false}; const m0=S.player.money, c0=S.player.cond; b.click(); return {btn:true,act:S.weekAct,dm:S.player.money-m0,dc:S.player.cond-c0,gone:!document.querySelector('.wk-sheet')}; });
    ok('주간 광고 촬영(홈 › 이번 주 준비 시트): 돈 +, 컨디션 -8, 시트 닫힘', ad.btn&&ad.act==='ad'&&ad.dm>0&&ad.dc<=0&&ad.gone, JSON.stringify(ad)); }
  // 첫 경기 조작법: 작은 아이폰(사파리 툴바 포함 높이)에서도 킥오프 버튼이 눌림
  // 가로 화면: 경기장 가로 렌더 · 조이스틱 오른쪽 = 공격 방향 · 그린 뒤 좌표 원상복구
  { const c3=await b.newContext({...devices['iPhone 13 landscape']}); const p3=await c3.newPage(); const e3=[]; p3.on('pageerror',e=>e3.push(e.message)); await p3.goto(FILE); await p3.click('#btn-new'); await p3.waitForTimeout(500);
    await p3.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.noReplay=true; S.compIntro=false; save(); startMatch(false); }); await p3.waitForTimeout(700);
    await p3.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await p3.waitForTimeout(3500);
    const L0=await p3.evaluate(()=>{ const u=M.user; M.ball.owner=null; M.ball.x=5; M.ball.y=90; u.x=W/2; u.y=60; return {land:isLand(),y:u.y,x:u.x}; });
    await p3.mouse.move(250,300); await p3.mouse.down(); await p3.mouse.move(310,300,{steps:4}); await p3.waitForTimeout(700); await p3.mouse.up();
    const L1=await p3.evaluate(()=>({y:M.user.y,x:M.user.x,vl:VLAND,inb:M.players.every(q=>q.x>-3&&q.x<W+3&&q.y>-3&&q.y<H+3)}));
    ok('가로 화면: 경기장 가로 · 조이스틱 오른쪽 → 앞(상대 골문)으로 이동 · 그린 뒤 좌표 원상복구 · 오류 없음', L0.land&&L1.y<L0.y-2&&Math.abs(L1.x-L0.x)<2.5&&!L1.vl&&L1.inb&&e3.length===0, JSON.stringify({L0,L1,e3:e3.slice(0,2)}));
    await c3.close(); }
  { const c2=await b.newContext({...devices['iPhone SE'],viewport:{width:375,height:548}}); const p2=await c2.newPage(); await p2.goto(FILE); await p2.click('#btn-new'); await p2.waitForTimeout(600);
    await p2.evaluate(()=>{ proSkipAll(); S.compIntro=false; S.trust=70; S.starter=true; S.tutSeen=false; S.noReplay=true; startMatch(false); }); await p2.waitForTimeout(300);
    const box=await p2.evaluate(()=>{ const c=el('m-overlay').querySelector('.card').getBoundingClientRect(); const g=el('tut-go').getBoundingClientRect(); return {top:Math.round(c.top),h:Math.round(c.height),btnB:Math.round(g.bottom),vh:innerHeight}; });
    let clicked=true; try{ await p2.click('#tut-go',{timeout:3000}); }catch(e){ clicked=false; } await p2.waitForTimeout(150);
    const st=await p2.evaluate(()=>({paused:M.paused,seen:S.tutSeen}));
    ok('첫 경기 조작법: 짧고 화면 안, 킥오프 눌림', clicked&&!st.paused&&st.seen&&box.top>=0&&box.btnB<=box.vh, JSON.stringify({...box,...st})); await c2.close(); }
  // UX 정리: 경기 안내 하나 · 버튼 상태 · 따라가기 잠금 · 평점 이유
  { const mu=await pg.evaluate(()=>{ S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; M.introT=0;
      const u=M.user; const r={};
      popup(u.x,u.y-2.4,'패스 옵니다!','#fff'); r.dup=!M.upop; popup(u.x,u.y-1.5,'요청!','#fff'); popup(u.x,u.y-1.8,'좋은 침투','#fff'); r.one=!!M.upop&&M.upop.t==='좋은 침투'&&!M.popups.some(p=>Math.abs(p.x-u.x)<1.6);
      const o=M.players.find(p=>p.team===1&&p.role!=='GK'); setOwner(o,{clean:true}); M._objT=1; updateHUD(); r.def=document.querySelector('.ctl .mainrow').dataset.st;
      const q=M.players.find(p=>p.team===0&&!p.isUser&&p.role!=='GK'); setOwner(q,{clean:true}); M._objT=1; updateHUD(); r.sup=document.querySelector('.ctl .mainrow').dataset.st; r.passDim=el('k-pass').classList.contains('dim');
      u.x=o.x+0.8; u.y=o.y+0.8; setOwner(o,{clean:true}); input.shotHold=true; updateUser(1/60); r.chase=M.chasing; r.noCharge=!M.charge;
      setOwner(u,{clean:true}); updateUser(1/60); r.lock=!!M.chaseLock; const sh0=M.stats.shots; input.shotRelease=true; updateUser(1/60); updateUser(1/60); r.noShot=M.stats.shots===sh0&&!M.chaseLock&&M.ball.owner===u;
      M.min=30; M._objT=0; M._lr=null; updateHUD(); M.stats.passOk+=5; M.stats.passes+=5; M._objT=0; updateHUD(); r.why=el('live-rt').textContent;
      cancelAnimationFrame(raf); ambience(false); M=null; input.shotHold=false; show('screen-hub'); renderHub(); return r; });
    ok('경기 안내: 중복 팝업 버림·선수 위 한 칸 · 버튼 상태(수비/지원) · 따라가기로 잡아도 자동 슛 없음 · 평점 변화 이유', mu.dup&&mu.one&&mu.def==='def'&&mu.sup==='sup'&&mu.passDim&&mu.chase&&mu.noCharge&&mu.lock&&mu.noShot&&/패스 성공 \+/.test(mu.why), JSON.stringify(mu)); }
  // UX 정리: 홈 · 성장 · 스킬 · 스타숍 · 기록
  { const ux=await pg.evaluate(()=>{ const r={}; S.weekAct=null; S.player.injury=0; S.endo.offers=[]; tab='home'; renderHub(); const go=el('btn-go'); r.go=!!go; { const vh=window.innerHeight, gb=go.getBoundingClientRect(); const t=el('tab-home').innerText; r.first=gb.bottom<vh-60&&/다음 경기/.test(t)&&/선발 출전|투입 예정/.test(t)&&/오늘 목표/.test(t)&&/컨디션/.test(t); r.firstInfo=Math.round(gb.bottom)+'/'+vh; r.yellow=[...el('tab-home').querySelectorAll('.btn.primary')].length; r.weekRow=!!el('tab-home').querySelector('[data-row=week]'); } r.modes=document.querySelectorAll('#sel-mode [data-mode]').length>=3; r.noMarket=!el('tab-home').textContent.includes('시장 가치');
      tab='player'; renderPlayer.sub='stat'; renderPlayer.pend={shot:2}; S.player.points=Math.max(3,S.player.points); renderHub(); r.apply=el('pt-apply').textContent; r.sinfo=document.querySelector('.sinfo').textContent; r.wkDup=!!el('tab-player').querySelector('#wk-card'); const sh=weekSheet(); r.wk=sh.querySelectorAll('#wk-card .wk-o').length; r.wkTxt=/게이지 \+\d+ · 100이 차면 \+1 확정/.test(sh.textContent)&&/연계 훈련|휴식/.test(sh.textContent); sh.remove(); renderPlayer.pend={};
      renderPlayer.sub='profile'; renderHub(); r.prof=el('tab-player').textContent.includes('이번 시즌')&&el('tab-player').textContent.includes('시장 가치');
      renderPlayer.sub='records'; renderHub(); r.rs=document.querySelectorAll('#tab-player .rs').length>0||!(S.history||[]).length;
      tab='skill'; renderSkill.sel=null; renderSkill.f='all'; renderHub(); document.querySelector('#tab-skill [data-f="tackle"]').click(); const sel=SKILLS.find(x=>x.id===renderSkill.sel); r.fsel=sel&&sel.type==='tackle'; r.sit=!!document.querySelector('#tab-skill .sk-sit'); const ls=[...document.querySelectorAll('#tab-skill .sk')].map(b=>SKILLS.find(x=>x.id===b.dataset.sk).lvl); r.sorted=ls.every((v,i)=>!i||ls[i-1]<=v); renderSkill.f='all';
      tab='shop'; renderShop.sub='endo'; renderHub(); r.now=!!document.querySelector('#tab-shop [data-ad]')||S.player.rep<100; r.brandFold=S.player.rep>=2500||!!document.querySelector('#tab-shop details');
      renderShop.sub='gear'; renderHub(); r.buy=[...document.querySelectorAll('#tab-shop [data-gb]')].some(b=>/^구매 · |부족$/.test(b.textContent));
      renderShop.sub='cos'; renderCos.prev=null; renderHub(); document.querySelector('#tab-shop [data-cv="b_gold"]').click(); r.prev=renderCos.prev==='b_gold'&&!!document.querySelector('.cos-pv canvas')&&/맞춤|축구화/.test(document.querySelector('.cos-pv').textContent); renderCos.prev=null; tab='home'; renderHub(); return r; });
    ok('홈 첫 화면(상태→다음 경기→선발 여부→오늘 목표→경기 시작, 노란 버튼 1개, 이번 주 준비는 한 줄) · 성장(전→후·주간 활동은 시트 하나로) · 스킬(분류↔선택·레벨순·상황 먼저) · 스타숍(지금 할 수 있는 것·구매·미리보기) · 기록(승무패)', ux.go&&ux.first&&ux.yellow===1&&ux.weekRow&&!ux.wkDup&&ux.wk>=4&&ux.wkTxt&&ux.apply&&ux.prof&&ux.rs&&ux.fsel&&ux.sit&&ux.sorted&&ux.now&&ux.buy&&ux.prev&&/2포인트 적용 · 남은/.test(ux.apply)&&/→/.test(ux.sinfo), JSON.stringify(ux)); }
  // 골키퍼 캐치 · 동료 패스 · 원투 침투 · 스루 강약 · 스킬 연출 · 새 필살기
  { const g2=await pg.evaluate(()=>{ S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf); const r={};
      const gk=M.players.find(p=>p.team===1&&p.role==='GK'); const u=M.user; let caught=0, hold=0;
      for(let i=0;i<12;i++){ M.players.forEach(q=>{ if(q.team===1&&q.role!=='GK'){ q.x=5; q.y=60; } }); gk.x=W/2; gk.y=1.2; gk.vx=gk.vy=0; gk.diveT=0; gk.catchT=0; u.x=W/2+0.3; u.y=17; setOwner(u,{clean:true}); u.touchT=0; shoot(u,gk.x,0,{power:0.35}); for(let f=0;f<60;f++){ updateBall(1/60); M.players.forEach(q=>{ if(q.catchT>0) q.catchT-=1/60; }); if(M.ball.owner===gk){ caught++; if(animFor(gk).an==='catch') hold++; break; } if(M.ball.y<0) break; } }
      r.caught=caught; r.hold=hold; r.sprites=!!(SPR.gk&&SPR.gk.catch&&SPR.gk.throw);
      // 동료 패스: 세고 정확하게 내 발로
      let got=0; for(let i=0;i<10;i++){ const q=M.players.find(p=>p.team===0&&!p.isUser&&p.role==='MF'); q.x=20; q.y=70; u.x=40; u.y=60; u.vx=u.vy=0; M.players.forEach(z=>{ if(z.team===1){ z.x=60; z.y=100; } }); M.freeze=0; M.restart=null; M.setPiece=null; M.over=false; setOwner(q,{clean:true}); q.touchT=0; q.st={...q.st,pass:35}; passTo(q,u,{power:0.5}); for(let f=0;f<120;f++){ updateBall(1/60); updatePossession&&updatePossession(1/60); if(M.ball.owner===u){ got++; break; } } }
      r.passGot=got;
      // 원투 침투
      const mt=M.players.find(p=>p.team===0&&!p.isUser&&p.role==='MF'); u.x=30; u.y=60; mt.x=36; mt.y=56; setOwner(u,{clean:true}); u.touchT=0; passTo(u,mt,{power:0.5}); r.gg=!!M.giveGo; setOwner(mt,{clean:true}); mt.touchT=0; u.vy=-7; u.vx=0; M.decisionT=0; M.freeze=0; M.restart=null; M.t+=0.5; M.reqThru=1.5; updateAI(1/60); r.ggBall=!!(M.ball.passTarget===u&&M.ball.thru);
      { const opp=M.players.filter(q=>q.team===1&&q.role!=='GK'), th=M.players.filter(q=>q.team===1); const save=opp.map(q=>[q.x,q.y]); const R0=Math.random; const P=(setup)=>{ setup(); let k=0; for(let i=0;i<400;i++){ M.lastGG=0; M.reqThru=0; M.request=0; if(ggDecide(mt,th).ok) k++; } return k/400; };
        opp.forEach(q=>{ q.x=2; q.y=100; });
        r.ggPress=P(()=>{ mt.x=36; mt.y=56; u.x=34; u.y=46; opp[0].x=37.2; opp[0].y=55; opp[1].x=36; opp[1].y=52; });
        r.ggFree=P(()=>{ opp.forEach(q=>{ q.x=2; q.y=100; }); mt.x=36; mt.y=56; u.x=34; u.y=62; });
        r.ggMarked=P(()=>{ opp.forEach(q=>{ q.x=2; q.y=100; }); mt.x=36; mt.y=56; u.x=34; u.y=46; opp[0].x=34.8; opp[0].y=46.5; opp[1].x=36.5; opp[1].y=53; });
        opp.forEach(q=>{ q.x=2; q.y=100; }); mt.x=36; mt.y=56; u.x=34; u.y=46; M.reqThru=1; r.ggReq=(()=>{ let k=0; for(let i=0;i<200;i++){ M.lastGG=0; M.reqThru=1; if(ggDecide(mt,th).ok) k++; } return k/200; })(); M.reqThru=0;
        opp.forEach((q,i)=>{ q.x=save[i][0]; q.y=save[i][1]; }); }
      // 스루 강약
      const q2=M.players.find(p=>p.team===0&&p.role==='FW'); q2.x=30; q2.y=40; q2.vx=0; q2.vy=-3; const a=thruPoint(q2,0.45), b2=thruPoint(q2,1); r.thruSpan=+Math.hypot(a.x-b2.x,a.y-b2.y).toFixed(1);
      // 스킬 연출 + 새 필살기
      S.player.skills.push('dash','tornado','triple'); S.player.equip=['dash','tornado','triple',null]; S.player.level=Math.max(S.player.level,12); M.mp=100; M.cds=[0,0,0,0]; u.x=34; u.y=50; setOwner(u,{clean:true}); u.touchT=0; useSkill(0,true,0,-1); r.ban=!!M.skBan&&M.dashT>0;
      M.mp=100; M.dashT=0; const ds=M.players.filter(p=>p.team===1&&p.role!=='GK').slice(0,3); ds.forEach((d,i)=>{ d.x=u.x+[2,-2,0][i]; d.y=u.y+[0,0,2][i]; d.stun=0; }); setOwner(u,{clean:true}); useSkill(1,true,0,-1); for(let f=0;f<80;f++) updateUser(1/60); r.torn=ds.filter(d=>d.stun>0.2||d.tornHit).length; r.tornBall=M.ball.owner===u; r.tornDash=M.dashT>0;
      M.mp=100; M.cds=[0,0,0,0]; u.x=34; u.y=24; setOwner(u,{clean:true}); u.touchT=0; useSkill(2,true,0,-1); r.triple=!!M.ball.triple&&!M.ball.owner;
      ambience(false); M=null; show('screen-hub'); renderHub(); return r; });
    ok('골키퍼 정면 슛 캐치·안고 있는 동작 · 동료 패스 정확도 · 원투 침투(상황 판단: 압박받으면 리턴·앞이 비면 직접 전진·내가 마크당하면 안 줌·요청하면 줌) · 스루 강약 · 스킬 발동 연출 · 토네이도 드리블 · 분신 슛', g2.sprites&&g2.caught>=2&&g2.hold>=g2.caught-1&&g2.passGot>=8&&g2.gg&&g2.ggBall&&g2.ggPress>0.6&&g2.ggFree<0.15&&g2.ggMarked<0.25&&g2.ggReq>0.85&&g2.thruSpan>=7&&g2.ban&&g2.torn>=2&&g2.tornBall&&g2.tornDash&&g2.triple, JSON.stringify(g2)); }
  // 기력 한도·수련 · 만화풍 연출 · 택배 크로스 · 대지 균열
  { const mp=await pg.evaluate(()=>{ const r={}; S.player.mpMax=100; S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf);
      const u=M.user; M.mp=40; for(let f=0;f<600;f++) updateUser(1/60); r.regen10s=+(M.mp-40).toFixed(1); M.stats.goals++; updateUser(1/60); r.goalGain=Math.round(M.mp-40-r.regen10s); r.max=M.mpMax;
      S.player.skills.push('delivery','split'); S.player.equip=['delivery','split',null,null]; S.player.level=Math.max(S.player.level,12); M.mp=100; M.cds=[0,0,0,0]; M.ultN={};
      const mates=M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK'); M.players.filter(q=>q.team===1&&q.role!=='GK').forEach(q=>{ q.x=60; q.y=100; }); mates.forEach(q=>{ q.x=8; q.y=90; }); const fw=mates[0]; fw.x=W/2+2; fw.y=12; fw.vx=fw.vy=0;
      u.x=8; u.y=40; setOwner(u,{clean:true}); u.touchT=0; useSkill(0,true,0,-1); r.del=!!M.ball.delivery&&M.ball.passTarget===fw&&!M.ball.owner; r.comic=(M.comics||[]).length>0;
      M.mp=100; u.x=30; u.y=80; setOwner(u,{clean:true}); u.touchT=0; fw.x=40; fw.y=30; useSkill(1,true,0,-1); r.crack=(M.cracks||[]).some(c=>!c.star&&c.pts.length>4);
      ambience(false); M=null; show('screen-hub'); renderHub();
      S.weekAct=null; S.player.injury=0; const b0=S.player.mpMax||100; S.player.tgMp=0; doWeekAct('mp'); S.weekAct=null; doWeekAct('mp'); r.train=(S.player.mpMax||100)-b0; r.gauge=S.player.tgMp; S.weekAct=null; return r; });
    ok('기력: 경기 중 거의 안 참(10초 +2 미만) · 골 +25 · 기력 수련으로 최대치 +4 · 택배 크로스(박스 안 동료) · 대지를 가르는 패스 균열 · 의성어 연출', mp.regen10s<2&&mp.goalGain===25&&mp.max===100&&mp.train===4&&mp.del&&mp.comic&&mp.crack, JSON.stringify(mp)); }
  // 실전 전술: 게겐프레싱·윙백 오버래핑 · 경기장 등급 · 탭별 노란 버튼 하나
  { const t=await pg.evaluate(()=>{ const r={}; S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf);
      const own=M.players.find(q=>q.team===0&&!q.isUser&&q.role==='MF'); own.x=W/2; own.y=H/2; setOwner(own,{clean:true}); M.lostT=M.lostT||[-99,-99]; M.lostT[1]=M.t; updateAI(1/60); r.gegen=M.gegen&&M.gegen[1]; r.hi=(M.hiLine&&M.hiLine[1])||0; M.lostT[1]=M.t-20; updateAI(1/60); r.gegenOff=M.gegen[1];
      let ov=0; for(let k=0;k<40;k++){ const fb=M.players.filter(q=>q.team===0&&subRole(q)==='FB'); if(!fb.length) break; const wm=M.players.filter(q=>q.team===0&&!q.isUser&&['WM','WF'].includes(subRole(q)))[0]||own; const f=fb[0]; const side=f.x<W/2?-1:1; wm.x=W/2+side*(W/2-4); wm.y=H*0.35; f.x=W/2+side*(W/2-10); f.y=H*0.5; f.ovCd=0; f.ovT=0; setOwner(wm,{clean:true}); for(let i=0;i<30;i++){ M.t+=1/60; updateAI(1/60); } if(fb.some(q=>q.ovT>M.t)) ov++; }
      r.ov=ov; ambience(false); M=null; show('screen-hub');
      const lg=Object.values(CLUBS).filter(c=>!c.nat&&divOf(c.id)); r.minTier=Math.min(...lg.map(c=>venueOf({type:'league',home:true,me:c,opp:c}).tier)); r.proTier=venueOf({type:'pro',pro:true,home:true,me:HS_ME,opp:HS_OPP}).tier;
      const ys={}; for(const tb of ['shop','league','transfer']){ tab=tb; renderHub(); ys[tb]=[...document.querySelectorAll('#tab-'+tb+' .btn.primary')].filter(b=>b.offsetParent).length; } r.ys=ys; tab='league'; renderHub(); r.lgCard=!!leagueStatus(); r.need=/✓|부족/.test(needTxt(nextTargets()[0]));
      tab='home'; renderHub(); return r; });
    ok('실전 전술: 공 잃은 직후 게겐프레싱(라인 올림)·시간 지나면 해제 · 측면 공격 때 풀백 오버래핑 · 프로 리그는 잔디 구장(흙은 고교만) · 스타숍/리그/이적 노란 버튼 1개 이하 · 리그 내 순위 카드 · 이적 조건 ✓/부족 표시', t.gegen===1&&t.hi>0&&t.gegenOff===0&&t.ov>=4&&t.minTier>=1&&t.proTier===0&&Object.values(t.ys).every(n=>n<=1)&&t.lgCard&&t.need, JSON.stringify(t)); }
  // 골키퍼 캐치 후 안고 있기 · 패스 속도 · 압박 인원 제한 · 결과 알림 짧게 · 스킬 해금 팝업
  { const k=await pg.evaluate(()=>{ const r={}; S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf);
      const gk=M.players.find(q=>q.team===0&&q.role==='GK'), fw=M.players.find(q=>q.team===1&&q.role==='FW'); M.ball.lastKicker=fw; setOwner(gk,{clean:true}); r.hold=+(gk.gkHoldUntil-M.t).toFixed(2);
      for(let i=0;i<30;i++){ M.t+=1/30; updateAI(1/30); } r.still=M.ball.owner===gk; for(let i=0;i<90;i++){ M.t+=1/30; M.decisionT=0; updateAI(1/30); } r.released=M.ball.owner!==gk;
      const a=M.players.find(q=>q.team===0&&q.role==='MF'&&!q.isUser), t2=M.players.find(q=>q.team===0&&q.role==='FW'&&!q.isUser); a.x=30; a.y=60; t2.x=30; t2.y=45; t2.vx=t2.vy=0; setOwner(a,{clean:true}); a.touchT=0; M.weather='clear'; passTo(a,t2,{power:0.5}); r.passSp=+Math.hypot(M.ball.vx,M.ball.vy).toFixed(1);
      const o=M.players.find(q=>q.team===1&&q.role==='MF'); o.x=W/2; o.y=H*0.3; setOwner(o,{clean:true}); M.lostT=[-99,-99]; M.prevOwnTeam=1; M.tactic[0]='poss'; M.setPiece=null; M.restart=null; M.freeze=0; M.players.forEach(q=>q.pressing=false); M.ball.vx=M.ball.vy=M.ball.vz=0; M.ball.z=0; M.ball.x=o.x; M.ball.y=o.y; M.user.x=5; M.user.y=H-5; for(let i=0;i<5;i++){ M.t+=1/30; updateAI(1/30); } r.press=M.players.filter(q=>q.team===0&&!q.isUser&&q.pressing).length;
      ambience(false); M=null; show('screen-hub');
      r.notes=resNotes(['👀 부산 갈매기 FC 스카우트: 무난했다는 평가 (34)','이번 주 활동을 고르지 않아 휴식으로 처리 (컨디션 +15)','📨 광고 제안 1건 도착 — 스타숍에서 확인','👀 전주 비빔 FC 관심 상승 (10→28) — 이번 시즌 한 번 더 지켜볼 예정']);
      const pop=skillUnlockPop(SKILLS.filter(s=>s.lvl===4).slice(0,2),4,()=>{}); r.pop=!!document.querySelector('.sk-unlock .btn.primary'); pop.remove(); return r; });
    ok('골키퍼가 잡은 공을 1~2초 안고 있다가 배급 · 땅볼 패스 15m 22m/s 이상 · 상대 진영 공은 압박 1명만 · 결과 알림 짧게(휴식 처리 숨김·관심 n→m) · 스킬 해금 팝업', k.hold>=1.2&&k.still&&k.released&&k.passSp>=22&&k.press<=1&&k.notes.length===2&&!k.notes.some(n=>/휴식|—/.test(n))&&k.pop, JSON.stringify(k)); }
  // 실전 요소: 중계 자막·타임라인·경기 흐름·하프타임 지시·경기 중 전술 / 중복 UI 정리
  { const q=await pg.evaluate(()=>{ const r={}; S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf);
      tick('⚽ 테스트'); r.tl=M.tl.length===1&&el('ticker').classList.contains('show'); for(let i=0;i<60;i++) momTick(1/30); r.mom=typeof M.mom==='number';
      M.score=[0,1]; halftimeShow(); r.htOpts=el('m-overlay').querySelectorAll('[data-ht]').length; r.rec=!!el('m-overlay').querySelector('[data-ht="atk"] .pill'); el('m-overlay').querySelector('[data-ht="atk"]').click(); el('ht-go').click(); r.tac=M.tactic[0]; r.resumed=!M.paused;
      el('btn-skip').click(); r.tabs=el('m-overlay').querySelectorAll('[data-pt]').length; el('m-overlay').querySelector('[data-tac="poss"]').click(); r.tac2=M.tactic[0]; r.ids=['pz-go','pz-help','pz-skip','pz-mute','pz-bs'].every(id=>!!el(id)); el('pz-go').click();
      ambience(false); M=null; show('screen-hub');
      S.introSk='pending'; tab='skill'; renderSkill.sel=null; renderHub(); r.gift=!!el('sk-gift')&&!document.querySelector('#tab-skill [data-gift]'); S.introSk='none';
      tab='player'; renderHub(); r.noWeekDup=!document.querySelector('#tab-player [data-row="week"]');
      tab='transfer'; renderHub(); r.seg=S.offers.length?true:document.querySelectorAll('#tab-transfer [data-tt]').length===2;
      renderShop.sub='endo'; tab='shop'; renderHub(); r.oneSp=!/기본 후원/.test(el('tab-shop').innerText)&&/에이전시/.test(el('tab-shop').innerText);
      tab='home'; renderHub(); return r; });
    ok('실전 요소: 중계 자막·타임라인 · 경기 흐름 바 · 하프타임 기록+감독 지시(지고 있으면 공격 추천→압박) · 일시정지 탭(경기/기록/설정)+경기 중 전술 · 입문 스킬 선물은 스킬 목록에 합침 · 이번 주 준비는 홈 한 곳 · 이적 탭 · 후원 한 카드', q.tl&&q.mom&&q.htOpts===3&&q.rec&&q.tac==='press'&&q.resumed&&q.tabs===3&&q.tac2==='poss'&&q.ids&&q.gift&&q.noWeekDup&&q.seg&&q.oneSp, JSON.stringify(q)); }
  // 시즌 시상식 · 트로피 진열장 · 리그 역대 · 명예의 전당
  { await pg.evaluate(()=>{ show('screen-hub'); finishAllLeagues(); const me=S.pstats.me=S.pstats.me||{g:0,a:0,club:S.clubId}; me.g=40; me.a=15; me.kp=45; endSeason(); });
    await pg.waitForTimeout(300); const c1=await pg.evaluate(()=>({vis:!el('screen-cer').hidden,noms:document.querySelectorAll('.cer-nom').length}));
    await pg.click('#cer-skip'); await pg.waitForTimeout(200); await pg.click('#cer-go'); await pg.waitForTimeout(400);
    const c2=await pg.evaluate(()=>{ const r={hub:!el('screen-hub').hidden,tab,offers:S.offers.length,tro:(S.trophies||[]).length,top:(S.trophies||[]).some(t=>t.kind==='top'),hist:Object.keys(S.leagueHist||{}).length}; tab='player'; renderPlayer.sub='records'; renderHub(); r.cab=document.querySelectorAll('.cab-i').length; tab='league'; renderLeague.view='hist'; renderLeague.cur=null; renderHub(); r.histRows=document.querySelectorAll('#tab-league table tr').length; renderLeague.view='table'; S.player.career.apps=80; const n0=hofLoad().length; retire(true); r.hof=hofLoad().length-n0; return r; });
    ok('시즌 시상식(후보·발표) → 트로피 진열장 · 리그 역대 · 명예의 전당', c1.vis&&c1.noms===3&&c2.hub&&c2.tab==='transfer'&&c2.offers>0&&c2.top&&c2.cab>=3&&c2.hist===19&&c2.histRows>=2&&c2.hof===1, JSON.stringify({c1,c2})); }
  ok('페이지 오류 없음', errs.length===0, errs.slice(0,3).join(' / '));
  await b.close();
  const fail=results.filter(r=>r[0]==='실패').length;
  results.forEach(r=>console.log(`${r[0]==='통과'?'✅':'❌'} ${r[1]}${r[2]?'  — '+r[2]:''}`));
  console.log(`\n${results.length-fail}/${results.length} 통과`);
})();
