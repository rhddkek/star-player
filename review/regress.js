// 스타 플레이어 회귀 테스트 — 업데이트할 때마다 실행
// node regress.js [html경로]
const {chromium,devices}=require('playwright');
const FILE='file://'+(process.argv[2]||'/home/claude/star-player.html');
const results=[]; const ok=(name,cond,info='')=>{ results.push([cond?'통과':'실패',name,info]); };
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({...devices['iPhone 13']}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(FILE); await pg.click('#go-create'); await pg.click('#btn-new'); await pg.waitForTimeout(700);
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
  const round0=await pg.evaluate(()=>{ S.lastMode='play'; renderHome.mode='play'; renderHub(); return S.round||S.week||0; }); await pg.waitForTimeout(200);
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
  const hud=await pg.evaluate(()=>({min:M.min,score:M.score.join('-'),mp:Math.round(M.mp),sta:Math.round(M.sta),ult:JSON.stringify(M.ultN||{}),stats:M.stats.shots,bench:!!M.bench}));
  ok('다음 경기 HUD 초기화(시간·점수·슈팅·필살기 횟수 · 벤치 출발이면 60분부터)', (hud.bench?hud.min>=59&&hud.min<62:hud.min<5&&hud.score==='0-0')&&hud.stats===0&&hud.ult==='{}', JSON.stringify(hud));
  // 달리기·체력·기력
  await pg.evaluate(()=>{ M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; { const g=M.players.find(q=>q.team===1&&q.role==='GK'); M.ball.owner=g; g.gkHoldUntil=M.t+30; g.protT=30; M.ball.x=g.x; M.ball.y=g.y; } /* 공은 멀리 상대 키퍼 손에: 동료 패스가 끼어들지 않게 */ const u=M.user; u.x=34; u.y=80; u.vx=u.vy=0; input.joyActive=true; input.jx=0; input.jy=-1; });
  await pg.waitForTimeout(900); const walk=await pg.evaluate(()=>Math.hypot(M.user.vx,M.user.vy));
  await pg.dispatchEvent('#k-sprint','pointerdown',{pointerId:3}); await pg.waitForTimeout(900);
  const run=await pg.evaluate(()=>({v:Math.hypot(M.user.vx,M.user.vy),on:M.sprinting,sta:M.sta,mp:M.mp,an:animFor(M.user).an}));
  await pg.dispatchEvent('#k-sprint','pointerup',{pointerId:3}); await pg.evaluate(()=>{ input.joyActive=false; input.jx=input.jy=0; });
  ok('달리기 버튼: 속도 30% 이상 증가 + 전력 질주 모션', run.on&&run.v>walk*1.3&&run.an==='sprint', `${walk.toFixed(1)}→${run.v.toFixed(1)}m/s ${run.an}`);
  { const sp=await pg.evaluate(()=>{ const u=M.user; M.freeze=0; M.restart=null; M.setPiece=null; u.x=34; u.y=60; setOwner(u,{clean:true}); u.touchT=0; u.protT=3; M.decisionT=0; for(let i=0;i<120;i++){ u.vx=u.vy=0; updateAI(1/30); M.players.forEach(q=>{ if(!q.isUser){ q.x+=q.vx/30; q.y+=q.vy/30; } }); M.t+=1/30; } return {sup:(M.uSup||[]).length,spots:(M.uSpots||[]).length,d:(M.uSup||[]).map(q=>+dist(q,u).toFixed(1))}; });
    ok('내 선수 지원: 공을 잡으면 동료 2명이 서로 다른 빈 각도(9~16m)로 이동', sp.sup===2&&sp.spots===2&&sp.d.every(x=>x>3.5&&x<24), JSON.stringify(sp)); }
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
  ok('연습장 입장(메뉴: 10초 공격 3 + 자유 + 도전 3): 소수 인원·내 공으로 시작', pmN===7&&pr1.practice&&pr1.n<=6&&pr1.own, JSON.stringify(pr1)+' menu='+pmN);
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
  await pg.click('#go-create'); await pg.click('#btn-new'); await pg.waitForTimeout(250);
  const warn=await pg.$('#nw-x'); ok('저장 있을 때 새 커리어 → 덮어쓰기 경고', !!warn);
  if(warn){ await pg.click('#nw-go'); await pg.waitForTimeout(400); await pg.evaluate(()=>{ proSkipAll(); }); await pg.waitForTimeout(400); await pg.evaluate(()=>document.querySelectorAll('.hub-modal').forEach(m=>m.remove())); }
  if(bkPath){ await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); const [fc]=await Promise.all([pg.waitForEvent('filechooser'), pg.click('#btn-import')]); await fc.setFiles(bkPath); await pg.waitForTimeout(500);
    const back=await pg.evaluate(()=>{ const o=load(); return o&&o.player&&o.player.level; }); ok('백업 불러오기: 이전 커리어 복원', back===6, 'Lv.'+back); }
  { await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); const c2=await pg.$('#btn-continue'); if(c2) await c2.click(); await pg.waitForTimeout(600); }

  // 5) 모바일 각 탭: 가로 넘침·잘림
  for(const t of ['home','player','skill','league','career']){ const btn=await pg.$(`#tabs button[data-tab="${t}"]`); if(!btn) continue; await btn.click(); await pg.waitForTimeout(250);
    const r=await pg.evaluate(()=>{ const W=window.innerWidth; const bad=[]; document.querySelectorAll('.screen:not([hidden]) *').forEach(e=>{ if(e.closest('.lg-co')) return; const b=e.getBoundingClientRect(); if(b.width>0&&b.right>W+1&&getComputedStyle(e).position!=='fixed') bad.push((e.id||e.className||e.tagName).toString().slice(0,30)+':'+Math.round(b.right)); }); return {scroll:document.documentElement.scrollWidth>W,bad:bad.slice(0,4)}; });
    ok(`모바일 ${t} 탭: 가로 넘침 없음`, !r.scroll&&r.bad.length===0, r.bad.join(', ')); }
  { const ln=await pg.evaluate(()=>{ S.number=9; save(); M=null; startMatch(false); const nums=M.players.filter(p=>p.team===0).map(p=>p.isUser?S.number:shirtNo(p)); const dup=nums.filter((n,i)=>nums.indexOf(n)!==i); const sc=el('sc-h').querySelector('span').textContent; cancelAnimationFrame(raf); ambience(false); M=null; el('m-overlay').hidden=true; show('screen-hub'); renderHub(); return {dup,sc}; });
    ok('라인업 등번호 중복 없음 · 점수판 한글 약칭', ln.dup.length===0&&/[가-힣]/.test(ln.sc), JSON.stringify(ln)); }
  { const sk=await pg.evaluate(()=>{ S.player.level=2; renderSkill.full=false; renderSkill.f='all'; tab='skill'; renderHub(); const n1=document.querySelectorAll('#tab-skill .skgrid button.sk').length; const btn=!!document.getElementById('sk-full'); renderSkill.full=true; renderHub(); const n2=document.querySelectorAll('#tab-skill .skgrid button.sk').length; renderSkill.full=false; renderHub(); return {n1,n2,btn}; });
    ok('스킬 화면: 기본은 쓸 수 있는 것+다음 해금만, 전체 보기 펼치기', sk.btn&&sk.n1<sk.n2, JSON.stringify(sk)); }
  { const lg=await pg.evaluate(()=>({n:Object.keys(S.divs).length, it:S.divs['it-1'].clubs.length, fr:S.divs['fr-1'].clubs.length, star:clubStars(CLUBS['en-1-1']), low:clubStars(CLUBS['kr-2-0']), v:S.v}));
    ok('7개국 리그(이탈리아·프랑스 포함) · 별 등급', lg.n===37&&lg.it===20&&lg.fr===18&&lg.star>=4.5&&lg.low<=1&&lg.v>=5, JSON.stringify(lg)); }
  // 리그 화면: 나라 → 1·2부 → 팀/선수 순위 → 기록 종류
  { const lg2=await pg.evaluate(()=>{ for(let i=0;i<3;i++) autoMatch(true); tab='league'; renderLeague.cur=null; renderLeague.view='players'; renderLeague.pf='kp'; renderHub(); const W=innerWidth; const bad=[]; document.querySelectorAll('#tab-league *').forEach(e=>{ if(e.closest('.lg-co')) return; /* 나라 줄은 의도된 가로 스크롤 */ const b=e.getBoundingClientRect(); if(b.width>0&&b.right>W+1) bad.push((e.className||e.tagName).toString().slice(0,20)); });
      const rows=document.querySelectorAll('#tab-league table tr').length; const kpN=Object.values(S.pstats).filter(v=>v.kp>0).length, csN=Object.values(S.pstats).filter(v=>v.cs>0).length; const co=!!el('lg-open')&&document.querySelectorAll('#tab-league .lg-kind button').length===6; renderLeague.view='table'; renderHub(); return {bad,rows,kpN,csN,co}; });
    ok('리그 화면: 리그 선택 버튼·탭 한 줄·선수 순위(기회창출·클린시트) · 가로 넘침 없음', lg2.bad.length===0&&lg2.rows>3&&lg2.kpN>20&&lg2.csN>3&&lg2.co===true, JSON.stringify(lg2)); }
  // 3부 · 한글 약칭 · 엠블럼 · 기존 세이브 변환
  { const t3=await pg.evaluate(()=>{ const d3=['en','es','it','de','fr'].map(co=>S.divs[co+'-3']?S.divs[co+'-3'].clubs.length:0); const all=Object.values(CLUBS).filter(c=>!c.nat); const latin=all.filter(c=>/[A-Za-z]/.test(c.short)).length; const noEmb=all.filter(c=>EMB_IDX[c.id]==null&&CLUB_DATA[c.homeDiv]).length; const shorts=['맨체스터 레드','맨체스터 스카이','강릉 파도 FC'].map(n=>all.find(c=>c.name===n).short);
      tab='league'; renderLeague.cur='en-3'; renderLeague.view='table'; renderHub(); const embs=document.querySelectorAll('#tab-league .emb').length; const sheetOk=getComputedStyle(document.documentElement).getPropertyValue('--emb').includes('data:image/png');
      const keep=JSON.stringify(S); ['en','es','it','de','fr'].forEach(co=>{ delete S.divs[co+'-3']; delete S.tables[co+'-3']; delete S.fixtures[co+'-3']; }); S.v=3; migrateV4(); const mig={v:S.v,n:Object.keys(S.divs).length,p:standings('en-3')[0].p,r:S.round}; S=JSON.parse(keep); save(); renderLeague.cur=null; renderHub();
      return {d3,latin,noEmb,shorts,embs,sheetOk,mig}; });
    ok('3부 리그(5개국) · 한글 약칭 · 엠블럼 · 기존 세이브에 3부 추가', t3.d3.join()==='24,20,20,20,18'&&t3.latin===0&&t3.noEmb===0&&t3.shorts.join()==='맨레드,맨스카이,강릉'&&t3.embs>=24&&t3.sheetOk&&t3.mig.v===4&&t3.mig.n===37&&t3.mig.p===t3.mig.r-1, JSON.stringify(t3)); }
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
  { const c3=await b.newContext({...devices['iPhone 13 landscape']}); const p3=await c3.newPage(); const e3=[]; p3.on('pageerror',e=>e3.push(e.message)); await p3.goto(FILE); await p3.click('#go-create'); await p3.click('#btn-new'); await p3.waitForTimeout(500);
    await p3.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.noReplay=true; S.compIntro=false; save(); startMatch(false); }); await p3.waitForTimeout(700);
    await p3.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await p3.waitForTimeout(3500);
    const L0=await p3.evaluate(()=>{ const u=M.user; M.ball.owner=null; M.ball.x=5; M.ball.y=90; u.x=W/2; u.y=60; return {land:isLand(),y:u.y,x:u.x}; });
    await p3.mouse.move(250,300); await p3.mouse.down(); await p3.mouse.move(310,300,{steps:4}); await p3.waitForTimeout(700); await p3.mouse.up();
    const L1=await p3.evaluate(()=>({y:M.user.y,x:M.user.x,vl:VLAND,inb:M.players.every(q=>q.x>-3&&q.x<W+3&&q.y>-3&&q.y<H+3)}));
    ok('가로 화면: 경기장 가로 · 조이스틱 오른쪽 → 앞(상대 골문)으로 이동 · 그린 뒤 좌표 원상복구 · 오류 없음', L0.land&&L1.y<L0.y-2&&Math.abs(L1.x-L0.x)<2.5&&!L1.vl&&L1.inb&&e3.length===0, JSON.stringify({L0,L1,e3:e3.slice(0,2)}));
    // v67: 원근 시점 · 중계 HUD · 프리킥 벽/조준 · 골 세리머니
    const T0=await p3.evaluate(()=>{ const sm=el('screen-match'); const pj=PJ(cv._w/2,cv._h); const top=PJ(0,0); return {tilt:sm.classList.contains('tilt')&&cv._tilt,land:sm.classList.contains('land'),tall:cv.clientHeight>sm.clientHeight*1.1,ov:getComputedStyle(el('cv2')).display==='block',bot:Math.round(pj.y)===Math.round(sm.clientHeight),topIn:top.y<=2&&top.x>0,sit:el('sit').textContent.length>0,crest:!!el('sc-h').querySelector('.emb,.emb-x'),dej:!!(SPR.field&&SPR.field.dejected&&SPR.f3&&SPR.f3.walljump)}; });
    ok('가로 원근 시점: 캔버스 기울임(아래 기준) · 덮개 캔버스 · 상황 칩 · 엠블럼 점수판 · 새 스프라이트', T0.tilt&&T0.land&&T0.tall&&T0.ov&&T0.bot&&T0.topIn&&T0.sit&&T0.crest&&T0.dej, JSON.stringify(T0));
    const F0=await p3.evaluate(()=>{ const pts=[]; const R=fkSolve(W/2-6,22,W/2+2.5,2.1,0,1,0.66,80,pts); const last=pts[pts.length-1]; const R2=fkSolve(W/2+5,24,W/2-2,1.8,0,0,0.6,70,null); const pts2=[]; fkSolve(W/2+5,24,W/2-2,1.8,0,0,0.6,70,pts2); const l2=pts2[pts2.length-1];
      M.freeze=0; M.restart=null; M.trans=null; const v=M.user; v.x=W/2-6; v.y=22; M.ball.x=v.x; M.ball.y=v.y; setOwner(v); startSetPiece('fk',0,{x:v.x,y:v.y},{taker:v,instant:true}); if(M.trans) transFinish(); M.freeze=0; if(M.restart){ const r=M.restart; M.restart=null; r(); }
      return {dx:Math.abs(last[0]-(W/2+2.5)),dz:Math.abs(last[2]-2.1),dx2:Math.abs(l2[0]-(W/2-2)),dz2:Math.abs(l2[2]-1.8),fk:!!M.fk,wall:(M.wallPl||[]).length,sp:M.setPiece&&M.setPiece.type}; });
    await p3.waitForTimeout(300);
    const F1=await p3.evaluate(()=>({panel:!el('fkp').hidden,lab:el('k-shot').textContent.includes('프리킥'),sit:el('sit').textContent,bars:getComputedStyle(document.querySelector('#screen-match .bars')).visibility}));
    await p3.evaluate(()=>{ M.fk.ax=0.8; M.fk.spin=1; input.shotHold=true; }); await p3.waitForTimeout(700); await p3.evaluate(()=>{ input.shotRelease=true; }); await p3.waitForTimeout(250);
    const F2=await p3.evaluate(()=>({shot:!!M.ball.isShot||!!(M.dbg&&M.dbg.wall),free:!M.setPiece&&!M.fk,jump:M.players.some(p=>p.jumpT>0),panel:el('fkp').hidden,sh:M.stats.fkShots||0}));
    await p3.waitForTimeout(1600);
    ok('프리킥: 벽 세우기 · 조준 패널 · 회전/파워 → 감아차기, 벽 점프 · 궤적 계산 정확(±0.35m)', F0.dx<0.35&&F0.dz<0.35&&F0.dx2<0.35&&F0.dz2<0.35&&F0.fk&&F0.wall>=2&&F0.sp==='fk'&&F1.panel&&F1.lab&&/프리킥/.test(F1.sit)&&F1.bars==='hidden'&&F2.shot&&F2.free&&F2.jump&&F2.panel&&F2.sh===1, JSON.stringify({F0,F1,F2}));
    for(let k=0;k<25;k++){ const busy=await p3.evaluate(()=>!!(M.restart||M.ball.isShot||M.celebT>0||(M.ball.owner&&M.ball.owner.role==='GK'))); if(!busy) break; await p3.waitForTimeout(200); } // 프리킥 슛이 끝난 뒤(골·세이브 정리 후) 측정
    const G0=await p3.evaluate(()=>{ M.freeze=0; M.restart=null; M.setPiece=null; M.trans=null; const u=M.user; u.x=W/2; u.y=5; M.ball.owner=null; M.ball.x=W/2; M.ball.y=0.6; M.ball.vx=0; M.ball.vy=-18; M.ball.z=0.4; M.ball.vz=0; M.ball.lastKicker=u; const gk=M.players.find(q=>q.team===1&&q.role==='GK'); if(gk){ gk.x=W/2+12; gk.y=3; gk.stun=2; } return M.score[0]; }); // 키퍼가 막을 수 있는 자리면 결과가 들쭉날쭉 → 키퍼를 비켜 세움
    await p3.waitForTimeout(600);
    const G1=await p3.evaluate(()=>({st:M.state,fr:+(M.freeze||0).toFixed(2),rs:!!M.restart,rp:!!M.replay,ri:M.replayIn,sp:M.setPiece&&M.setPiece.type,bx:+M.ball.x.toFixed(1),by:+M.ball.y.toFixed(1),bo:M.ball.owner&&M.ball.owner.role,ch:!!M.chance,pa:M.paused,g:M.score[0],dej:M.players.filter(p=>p.team===1&&p.dejT>0).length,run:M.players.filter(p=>p.team===0&&(p.celebRun||p.celebT>0)).length,ban:el('banner').classList.contains('show')}));
    ok('골 세리머니: 상대 낙담 · 동료가 달려와 함께 세리머니 · 골 배너', G1.g===G0+1&&G1.dej>=8&&G1.run>=2&&G1.ban, JSON.stringify({G0,G1}));
    const T1=await p3.evaluate(()=>{ S.noTilt=true; resize(); const a=el('screen-match').classList.contains('tilt'); S.noTilt=false; resize(); const b2=el('screen-match').classList.contains('tilt'); return {off:!a,on:b2}; });
    ok('원근 시점 끄기/켜기 설정 · 오류 없음', T1.off&&T1.on&&e3.length===0, JSON.stringify({T1,e3:e3.slice(0,3)}));
    await c3.close(); }
  { const c2=await b.newContext({...devices['iPhone SE'],viewport:{width:375,height:548}}); const p2=await c2.newPage(); await p2.goto(FILE); await p2.click('#go-create'); await p2.click('#btn-new'); await p2.waitForTimeout(600);
    await p2.evaluate(()=>{ proSkipAll(); S.compIntro=false; S.trust=70; S.starter=true; S.tutSeen=false; S.noReplay=true; startMatch(false); }); await p2.waitForTimeout(300);
    const box=await p2.evaluate(()=>{ const c=el('m-overlay').querySelector('.card').getBoundingClientRect(); const g=el('tut-go').getBoundingClientRect(); return {top:Math.round(c.top),h:Math.round(c.height),btnB:Math.round(g.bottom),vh:innerHeight}; });
    let clicked=true; try{ await p2.click('#tut-go',{timeout:3000}); }catch(e){ clicked=false; } await p2.waitForTimeout(150);
    const st=await p2.evaluate(()=>({paused:M.paused,seen:S.tutSeen}));
    ok('첫 경기 조작법: 짧고 화면 안, 킥오프 눌림', clicked&&!st.paused&&st.seen&&box.top>=0&&box.btnB<=box.vh, JSON.stringify({...box,...st})); await c2.close(); }
  // UX 정리: 경기 안내 하나 · 버튼 상태 · 따라가기 잠금 · 평점 이유
  { const mu=await pg.evaluate(()=>{ S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; M.introT=0;
      const u=M.user; const r={};
      popup(u.x,u.y-2.4,'패스 와요!','#fff'); r.dup=!M.upop; popup(u.x,u.y-1.5,'요청!','#fff'); popup(u.x,u.y-1.8,'좋은 침투','#fff'); r.one=!!M.upop&&M.upop.t==='좋은 침투'&&!M.popups.some(p=>Math.abs(p.x-u.x)<1.6);
      const o=M.players.find(p=>p.team===1&&p.role!=='GK'); setOwner(o,{clean:true}); M._objT=1; updateHUD(); r.def=document.querySelector('.ctl .mainrow').dataset.st;
      const q=M.players.find(p=>p.team===0&&!p.isUser&&p.role!=='GK'); setOwner(q,{clean:true}); M._objT=1; updateHUD(); r.sup=document.querySelector('.ctl .mainrow').dataset.st; r.passDim=el('k-pass').classList.contains('dim');
      u.x=o.x+0.8; u.y=o.y+0.8; setOwner(o,{clean:true}); input.shotHold=true; updateUser(1/60); r.chase=M.chasing; r.noCharge=!M.charge;
      setOwner(u,{clean:true}); updateUser(1/60); r.lock=!!M.chaseLock; const sh0=M.stats.shots; input.shotRelease=true; updateUser(1/60); updateUser(1/60); r.noShot=M.stats.shots===sh0&&!M.chaseLock&&M.ball.owner===u;
      M.min=30; M._objT=0; M._lr=null; updateHUD(); M.stats.passOk+=5; M.stats.passes+=5; M._objT=0; updateHUD(); r.why=el('live-rt').textContent;
      cancelAnimationFrame(raf); ambience(false); M=null; input.shotHold=false; show('screen-hub'); renderHub(); return r; });
    ok('경기 안내: 중복 팝업 버림·선수 위 한 칸 · 버튼 상태(수비/지원) · 따라가기로 잡아도 자동 슛 없음 · 평점 변화 이유', mu.dup&&mu.one&&mu.def==='def'&&mu.sup==='sup'&&mu.passDim&&mu.chase&&mu.noCharge&&mu.lock&&mu.noShot&&/패스 성공 \+/.test(mu.why), JSON.stringify(mu)); }
  // UX 정리: 홈 · 성장 · 스킬 · 스타숍 · 기록
  { const ux=await pg.evaluate(()=>{ const r={}; S.weekAct=null; S.player.injury=0; S.endo.offers=[]; tab='home'; renderHub(); const go=el('btn-go'); r.go=!!go; { const vh=window.innerHeight, gb=go.getBoundingClientRect(); const t=el('tab-home').innerText; r.first=gb.bottom<vh-60&&/다음 경기/.test(t)&&/선발 출전|투입 예정/.test(t)&&/오늘 목표/.test(t)&&/컨디션/.test(t); r.firstInfo=Math.round(gb.bottom)+'/'+vh; r.yellow=[...el('tab-home').querySelectorAll('.btn.primary')].length; r.weekRow=!!el('tab-home').querySelector('[data-row=week]'); } r.modes=document.querySelectorAll('#sel-mode [data-mode]').length>=3; r.noMarket=!el('tab-home').textContent.includes('시장 가치');
      tab='player'; renderPlayer.sub='stat'; renderPlayer.pend={shot:2}; S.player.points=Math.max(3,S.player.points); renderHub(); r.apply=el('pt-apply').textContent; r.sinfo=document.querySelector('.sinfo').textContent; r.wkDup=!!el('tab-player').querySelector('#wk-card'); const sh=weekSheet(); r.wk=sh.querySelectorAll('#wk-card .wk-o').length; r.wkTxt=/게이지 \+\d+ · (100이|다) 차면 \+1 확정/.test(sh.textContent)&&/연계 훈련|휴식/.test(sh.textContent); sh.remove(); renderPlayer.pend={};
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
      let ov=0; for(let k=0;k<40;k++){ const fb=M.players.filter(q=>q.team===0&&subRole(q)==='FB'); if(!fb.length) break; const wm=M.players.filter(q=>q.team===0&&!q.isUser&&['WM','WF'].includes(subRole(q)))[0]||own; const f=fb[0]; f.style='overlap'; const side=f.x<W/2?-1:1; wm.x=W/2+side*(W/2-4); wm.y=H*0.35; f.x=W/2+side*(W/2-10); f.y=H*0.5; f.ovCd=0; f.ovT=0; setOwner(wm,{clean:true}); for(let i=0;i<30;i++){ M.t+=1/60; updateAI(1/60); } if(fb.some(q=>q.ovT>M.t)) ov++; }
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
      el('btn-skip').click(); r.tabs=el('m-overlay').querySelectorAll('[data-pt]').length; el('m-overlay').querySelector('[data-tac="poss"]').click(); r.tac2=M.tactic[0]; r.ids=['pz-go','pz-help','pz-skip','pz-mute','pz-bs','pz-ps'].every(id=>!!el(id)); const ps0=S.pSize; el('pz-ps').click(); r.ps=S.pSize===((ps0!=null?ps0:1)+1)%3; S.pSize=1; r.psz=psz(); el('pz-go').click();
      ambience(false); M=null; show('screen-hub');
      S.introSk='pending'; tab='skill'; renderSkill.sel=null; renderHub(); r.gift=!!el('sk-gift')&&!document.querySelector('#tab-skill [data-gift]'); S.introSk='none';
      tab='player'; renderHub(); r.noWeekDup=!document.querySelector('#tab-player [data-row="week"]');
      tab='transfer'; renderHub(); r.seg=S.offers.length?true:document.querySelectorAll('#tab-transfer [data-tt]').length===2;
      renderShop.sub='endo'; tab='shop'; renderHub(); r.oneSp=!/기본 후원/.test(el('tab-shop').innerText)&&/에이전시/.test(el('tab-shop').innerText);
      tab='home'; renderHub(); return r; });
    ok('실전 요소: 중계 자막·타임라인 · 경기 흐름 바 · 하프타임 기록+감독 지시(지고 있으면 공격 추천→압박) · 일시정지 탭(경기/기록/설정)+경기 중 전술 · 선수 크기 설정(기본 크게 1.2배) · 입문 스킬 선물은 스킬 목록에 합침 · 이번 주 준비는 홈 한 곳 · 이적 탭 · 후원 한 카드', q.tl&&q.mom&&q.htOpts===3&&q.rec&&q.tac==='press'&&q.resumed&&q.tabs===3&&q.tac2==='poss'&&q.ids&&q.ps&&q.psz===1.2&&q.gift&&q.noWeekDup&&q.seg&&q.oneSp, JSON.stringify(q)); }
  // 벤치마크 1~4단계: 성향·곡선 침투·조키 / 코너 침투·퍼펙트·몸싸움·스위퍼 / 체력·호흡 콤비·주간 이벤트 / 커리어 카드
  { const q=await pg.evaluate(()=>{ const r={}; S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf);
      const fld=M.players.filter(x=>!x.isUser&&x.role!=='GK'); r.styles=fld.filter(x=>x.style&&STYLES[x.style]).length; r.distinct=new Set(fld.map(x=>x.style)).size;
      const a=M.players.find(x=>x.team===0&&x.role==='MF'&&!x.isUser), t2=M.players.find(x=>x.team===0&&x.role==='FW'&&!x.isUser); a.x=W/2; a.y=40; t2.x=W/2+6; t2.y=34; a.style='b2b'; let fw=0; for(let k=0;k<12;k++){ setOwner(a,{clean:true}); a.touchT=0; a.fw=null; passTo(a,t2,{power:0.5}); if(a.fw) fw++; } r.follow=fw;
      const o=M.players.find(x=>x.team===1&&x.role==='MF'); o.x=W/2; o.y=H*0.4; setOwner(o,{clean:true}); M.ball.x=o.x; M.ball.y=o.y; M.ball.vx=M.ball.vy=0; M.lostT=[-99,-99]; M.prevOwnTeam=1; M.tactic[0]='poss'; M.user.x=5; M.user.y=H-5; M.helpPress=0; for(let i=0;i<160;i++){ M.t+=1/30; updateAI(1/30); M.players.forEach(p=>{ if(!p.isUser){ p.x+=p.vx/30; p.y+=p.vy/30; } }); o.x=W/2; o.y=H*0.4; o.vx=o.vy=0; if(M.ball.owner!==o) setOwner(o,{clean:true}); M.ball.x=o.x; M.ball.y=o.y; M.ball.vx=M.ball.vy=0; M.ball.z=0; const ch=M.players.filter(x=>x.team===0&&x.pressing)[0]; if(ch&&ch.jockey&&dist(ch,o)>1.5&&dist(ch,o)<3.6) r.jockey=true; } r.jockey=!!r.jockey;
      M.ball.owner=null; startSetPieceNow('corner',0,{x:W-0.5,y:0.5}); r.cornerRun=!!M.cornerRun&&Math.abs(M.user.x-W/2)<4&&M.user.y<14;
      M.setPiece=null; M.cornerRun=null; const u=M.user; u.x=W/2; u.y=12; M.ball.owner=null; M.ball.x=u.x; M.ball.y=u.y+2; M.ball.vx=0; M.ball.vy=-5; M.ball.z=0.2; M.ball.passTarget=u; M.oneTouch={type:'shot',t:M.t-0.1,pw:0.7}; M.stats.perfect=0; userReceive(u,0,-1,1); r.perfect=M.stats.perfect===1;
      M.freeze=0; M.setPiece=null; M.restart=null; const gk=M.players.find(x=>x.team===1&&x.role==='GK'); M.ball.owner=null; M.ball.passTarget=null; M.user.x=5; M.user.y=H-5; M.players.filter(x=>x.team===0&&!x.isUser).forEach(x=>{ x.y=Math.max(x.y,60); }); M.ball.x=W/2; M.ball.y=20; M.ball.vx=0; M.ball.vy=-9; M.ball.z=0; M.ball.lastKicker=M.user; M.players.filter(x=>x.team===1&&x.role!=='GK').forEach(x=>{ x.y=H*0.5; }); gk.x=W/2; gk.y=1.5; M.decisionT=0; gkAI(gk,1,1/30,true); r.sweep=!!gk.sweep;
      const fwd=M.players.find(x=>x.team===1&&x.role==='FW'); fwd.sta=1; const v0=maxSpeed(fwd); fwd.sta=0.2; r.tired=maxSpeed(fwd)<v0*0.95; fwd.sta=1; fwd.vx=9; fwd.vy=0; for(let i=0;i<300;i++) staTick(fwd,1/30); r.drain=+(1-fwd.sta).toFixed(3);
      M.buddySt=2; const bp=M.players.find(x=>x.team===0&&!x.isUser&&x.role==='FW'); bp.buddy=true; bp.telT=M.t+2; M.stats.tele=0; setOwner(M.user,{clean:true}); M.user.touchT=0; throughBall(M.user,bp,0.6); r.tele=M.stats.tele===1;
      ambience(false); M=null; show('screen-hub');
      const ev=weekEvent(); r.evt=!!(ev&&ev.opts.length===2); S.weekEvt=ev; tab='home'; renderHub(); r.evtCard=document.querySelectorAll('#tab-home [data-we]').length===2; document.querySelector('#tab-home [data-we="1"]').click(); r.evtGone=!S.weekEvt;
      const cv0=careerCardPNG(false); r.card=cv0.width===1080&&cv0.height===1350; tab='player'; renderHub(); r.cardBtn=!!el('cc-share');
      tab='home'; renderHub(); return r; });
    ok('벤치마크 1~4단계: 성향 부여(≥3종) · 패스 후 곡선 침투 · 조키(1.5~3.6m 유지) · 코너 침투 자리 · 퍼펙트 타이밍 · 스위퍼 키퍼 · 체력(지치면 느려짐·소모) · 텔레파시 스루 · 주간 이벤트 카드 · 커리어 카드', q.styles>=16&&q.distinct>=3&&q.follow>=4&&q.jockey&&q.cornerRun&&q.perfect&&q.sweep&&q.tired&&q.drain>0.05&&q.drain<0.5&&q.tele&&q.evt&&q.evtCard&&q.evtGone&&q.card&&q.cardBtn, JSON.stringify(q)); }
  // 벤치마크 2차: 스킬 무브·교체·특성 달성·훈련 드릴·전술 적응·날씨·올해의 선수 레이스·감독 교체·후계자
  { const q=await pg.evaluate(()=>{ const r={}; S.noReplay=true; M=null; startMatch(false); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.restart=null; M.setPiece=null; cancelAnimationFrame(raf);
      const u=M.user; setOwner(u,{clean:true}); M.ball.x=u.x; M.ball.y=u.y; input.joyActive=true; input.jx=1; input.jy=0; input.sprint=false; input.shotHold=false; input.passHold=false; input.thruHold=false; M._spDown=false; M._spTap=-9; M.feintCd=0; M.turnCd=0; M.chasing=false; M.charge=null; M.stats.moves=0; M._pj={jx:1,jy:0}; const st=(sp)=>{ input.sprint=sp; updateUser(1/30); }; st(false); st(true); st(false); st(true); st(false); r.feint=M.stats.moves===1; M._pj={jx:1,jy:0}; input.jx=-1; input.jy=0; M.turnCd=0; updateUser(1/30); r.turn=M.stats.moves===2;
      M.players.forEach(x=>{ if(x.team===0&&!x.isUser&&x.sta!=null) x.sta=0.2; }); M.score=[0,0]; halftimeShow(); const sb=el('m-overlay').querySelectorAll('[data-htsub]'); r.subBtn=sb.length===2; sb[0].click(); el('m-overlay').querySelector('[data-ht="atk"]').click(); el('ht-go').click(); r.subbed=M.players.filter(x=>x.subbed).length===1&&M.tl.some(e=>/교체/.test(e.t)); r.adapt=M.tacSwT>M.t;
      M.weather='snow'; r.snowSlow=maxSpeed(u)<(M.weather='clear',maxSpeed(u)); M.weather='clear';
      ambience(false); M=null; show('screen-hub');
      S.ach={}; const got=achAdd({recvAct:40,runs:0,oneTouch:0,tackles:0}); r.ach=got.length===1&&got[0].id==='soft'&&traitUnlocked('soft'); renderPlayer.sub='stat'; tab='player'; renderHub(); r.achBtn=/무료 장착/.test(el('tab-player').textContent)||/달성 ✓/.test(el('tab-player').textContent); r._t=el('tab-player').textContent.includes('특성');
      S.weekAct=null; S.drill=null; doWeekAct('pass'); r.drill=!!(S.drill&&S.drill.id==='drill_pass'); tab='home'; renderHub(); r.drillRow=!!el('go-drill'); S.player.tg={pass:10}; S.drill.done=false; startPractice('drill_pass'); el('m-overlay').hidden=true; M.paused=false; cancelAnimationFrame(raf); for(let i=0;i<8;i++) chalProg(); r.drillChal=M.chal&&M.chal.prog>=8; chalEnd(true); r.drillBonus=S.player.tg.pass===25&&S.drill.done; endPractice();
      const myDiv=divOf(S.clubId).id; for(let i=0;i<4;i++) autoMatch(true); tab='league'; renderHub(); r.poy=!!document.querySelector('.poy-race');
      const mg0=(S.mgr&&S.mgr[S.clubId])||0; const rnd0=Math.random; Math.random=()=>0; const notes=[]; S.trust=80; mgrChangeCheck(myDiv,notes); Math.random=rnd0; r.mgr=((S.mgr&&S.mgr[S.clubId])||0)===mg0+1&&notes.length===1&&S.trust===56&&S.tacAdapt===3; S.tacAdapt=0;
      localStorage.setItem('sp_legacy',JSON.stringify({parent:'테스트',rep:150,money:999,pos:'FW'})); const sv=JSON.stringify(S); const m0=S.player.money, r0=S.player.rep; el('in-name').value='후계자'; newGame('후계자',S.player.pos); try{ const L=JSON.parse(localStorage.getItem('sp_legacy')||'null'); if(L){ localStorage.removeItem('sp_legacy'); S.player.rep+=L.rep; S.player.money+=L.money; S.legacy=L; } }catch(e){} r.legacy=S.legacy&&S.legacy.parent==='테스트'&&S.player.rep>=150&&!localStorage.getItem('sp_legacy'); S=JSON.parse(sv); save(); tab='home'; renderHub(); return r; });
    ok('벤치마크 2차: 헛다리·턴 · 하프타임 교체(2명 제시·1명 교체·자막) · 전술 적응 · 눈 감속 · 특성 달성 해금(무료 장착) · 훈련 드릴(주간 훈련→미니게임→게이지 +15) · 올해의 선수 레이스 · 감독 교체(신뢰 70%·적응 3경기) · 후계자 상속', Object.entries(q).filter(([k])=>!k.startsWith('_')).every(([,v])=>v===true), JSON.stringify(q)); }
  // v66: 시안 UI · FMH식 커리어 (시즌 목표·감독 면담·신뢰 로그·소식함·마음 한 줄·스카우트·구단 프로필·이적 비교·협상·일정·챌린지)
  { const q=await pg.evaluate(()=>{ const r={}; show('screen-hub'); document.querySelectorAll('.hub-modal').forEach(m=>m.remove());
      r.nav=document.querySelectorAll('#tabs button').length===5&&!!document.querySelector('#tabs [data-tab=career]');
      tab='player'; renderPlayer.sub='stat'; renderHub(); r.seg=document.querySelectorAll('#tab-player .hub-seg [data-gk]').length===5; r.hero=!!document.querySelector('#tab-player canvas[data-hero]');
      renderPlayer.sub='week'; S.weekAct=null; S.player.injury=0; renderHub(); r.wk3=document.querySelectorAll('#tab-player .wk-o.big').length===3; document.querySelector('#tab-player [data-wsel=rest]').click(); const ok2=document.querySelector('#tab-player #wk-ok'); r.wkSel=!!ok2&&ok2.dataset.tr==='rest'&&!ok2.disabled; ok2.click(); r.wkDone=S.weekAct==='rest';
      S.sg=null; const G=sgEnsure(); r.sg=!!G&&G.goals.length===3&&G.goals.some(g=>g.team); const n0=G.goals[0].n; sgVow('bold'); r.vow=G.vow==='bold'&&G.goals[0].n>=Math.round(n0*1.25)-0;
      tab='home'; renderHub(); r.homeSg=!!document.querySelector('#tab-home .sgoal')&&!!document.querySelector('#tab-home .inbox')&&!!document.querySelector('#tab-home .mood');
      const hs0=S.history.length; for(let i=0;i<3;i++) S.history.push({season:S.season,round:S.round,type:'league',a:S.clubId,b:'x',opp:Object.keys(CLUBS).find(id=>id!==S.clubId&&!CLUBS[id].nat),ga:0,gb:1,goals:0,assists:0,rating:6,bench:true,injured:false});
      S.talkCd=0; const tk=mgrTalk(); r.talk=!!tk&&tk.talk===1&&tk.opts.some(o=>o[1].startLock); S.weekEvt=tk; S.trust=30; renderHub(); document.querySelector('#tab-home [data-we="0"]').click(); r.lock=S.startLock===1&&isBenched()===false&&(S.trustLog||[])[0].why===tk.t; r.mood=moodLine()[1].includes('후보'); S.history.length=hs0; S.startLock=0;
      const ib0=(S.inbox||[]).length; inboxFromNotes(['👀 테스트 구단 관심 상승','라이벌전 승리! 🔥']); r.inbox=(S.inbox||[]).length===Math.min(14,ib0+1)||((S.inbox||[])[0].t==='테스트 구단 관심 상승');
      tab='career'; renderCareer.sub='record'; renderHub(); r.rec=!!el('cc-share')&&document.querySelectorAll('#tab-career .rec-t, #tab-career .rec-body p').length>0; renderRecord.v='path'; renderHub(); r.path=!!document.querySelector('#tab-career .path-l, #tab-career .rec-body p'); renderRecord.v='season';
      renderCareer.sub='scout'; renderHub(); r.scout=document.querySelectorAll('#tab-career .sc-it').length>0&&!!el('sc-goal'); el('sc-goal').click(); r.goal=!!S.goalClub;
      clubProfile(S.goalClub); r.prof=!!document.querySelector('.cprof')&&document.querySelectorAll('.cprof .kv3>div').length===3; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.goalClub=null;
      S.offers=makeOffers(); S.offersFor='end'; tab='transfer'; renderHub(); r.ofc=document.querySelectorAll('#tab-transfer .ofc').length===S.offers.length&&document.querySelectorAll('#tab-transfer .ofc .fmp').length===S.offers.length&&document.querySelectorAll('#tab-transfer .btn.primary').length===1;
      negotiate(0); const nm=document.querySelector('.neg-m'); r.neg=!!nm&&nm.querySelectorAll('.neg3 [data-v]').length===3; nm.querySelector('.neg3 [data-v="0"]').click(); r.negV=S.offers[0].v===0; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.offers=[]; S.offersFor=null;
      tab='league'; renderLeague.cur=null; renderLeague.view='fix'; renderHub(); r.fix=document.querySelectorAll('#tab-league .fixs tr').length>5&&!!document.querySelector('#tab-league .lg-ban')&&!!el('lg-go'); renderLeague.view='table'; tab='home'; renderHub();
      r.hof=hofPoints(S)>0;
      return r; });
    ok('시안 UI·FMH 커리어: 5탭·그룹 탭 · 일러스트 · 주간 준비 3카드 · 시즌 목표·각오 · 감독 면담(선발 약속)·신뢰 기록 · 소식함·마음 한 줄 · 커리어 기록·발자취 · 스카우트·목표 구단 · 구단 프로필 · 이적 비교·협상 3안 · 리그 일정 · 명예의 전당 점수', Object.values(q).every(v=>v===true), JSON.stringify(q)); }
  // 챌린지 모드 (FMH 시나리오)
  { const c=await pg.evaluate(()=>{ const r={}; const sv=JSON.stringify(S); show('screen-title'); initTitle(); el('go-create').click(); r.create=!el('tt-create').hidden; document.querySelector('#mode-segs [data-cm=chal]').click(); r.list=document.querySelectorAll('#chal-list [data-chl]').length===CHALLENGES.length;
      const def=CHALLENGES.find(x=>x.id==='bench'); chalStart(def,'도전자','MF'); r.start=!!S.chal&&S.chal.id==='bench'&&CLUBS[S.clubId].homeDiv==='kr-2'&&S.player.age===25&&!S.prologue&&!el('screen-hub').hidden;
      for(let i=0;i<16;i++) S.history.push({season:S.season,round:i+1,type:'league',a:S.clubId,b:'x',opp:S.clubId,ga:1,gb:0,goals:0,assists:0,rating:6.8,bench:false,injured:false}); const E=chalEval(); r.eval=!!E&&E.ok===true; const notes=[]; chalFinish(E,notes); r.done=S.chal.done&&S.chal.ok&&notes.some(n=>n.includes('챌린지 달성'))&&(S.trophies||[]).some(t=>t.kind==='chal');
      S=JSON.parse(sv); save(); newMode='normal'; show('screen-hub'); tab='home'; renderHub(); return r; });
    ok('챌린지 모드: 시작 화면 → 챌린지 6종 · 상황대로 시작(나이·구단·벤치) · 시즌 끝 판정 · 트로피', Object.values(c).every(v=>v===true), JSON.stringify(c)); }
  // 시즌 시상식 · 트로피 진열장 · 리그 역대 · 명예의 전당
  { await pg.evaluate(()=>{ show('screen-hub'); finishAllLeagues(); const me=S.pstats.me=S.pstats.me||{g:0,a:0,club:S.clubId}; me.g=40; me.a=15; me.kp=45; endSeason(); });
    await pg.waitForTimeout(300); const c1=await pg.evaluate(()=>({vis:!el('screen-cer').hidden,noms:document.querySelectorAll('.cer-nom').length}));
    await pg.click('#cer-skip'); await pg.waitForTimeout(200); const srv=await pg.evaluate(()=>!!document.querySelector('.srv-h')&&!!document.querySelector('.srv-t')); await pg.click('#cer-go'); await pg.waitForTimeout(400);
    const c2=await pg.evaluate(()=>{ const r={hub:!el('screen-hub').hidden,tab,offers:S.offers.length,tro:(S.trophies||[]).length,top:(S.trophies||[]).some(t=>t.kind==='top'),hist:Object.keys(S.leagueHist||{}).length}; tab='player'; renderPlayer.sub='records'; renderHub(); r.cab=document.querySelectorAll('.cab-i').length; tab='league'; renderLeague.view='hist'; renderLeague.cur=null; renderHub(); r.histRows=document.querySelectorAll('#tab-league table tr').length; renderLeague.view='table'; S.player.career.apps=80; const n0=hofLoad().length; retire(true); r.hof=hofLoad().length-n0; return r; });
    ok('시즌 시상식(후보·발표) → 시즌 회고 → 트로피 진열장 · 리그 역대 · 명예의 전당', srv&&c1.vis&&c1.noms===3&&c2.hub&&c2.tab==='transfer'&&c2.offers>0&&c2.top&&c2.cab>=3&&c2.hist===37&&c2.histRows>=2&&c2.hof===1, JSON.stringify({c1,c2})); }
  // v68 손맛: 즉시 방향 전환 · 누른 방향 패스 · 원투 · 태클 헛발 · 슛 상황 · 수비 성향 · 10초 공격
  { const c4=await b.newContext({viewport:{width:430,height:900}}); const p4=await c4.newPage(); const e4=[]; p4.on('pageerror',e=>e4.push(e.message)); await p4.goto(FILE); await p4.click('#go-create'); await p4.click('#btn-new'); await p4.waitForTimeout(400);
    await p4.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); window.wait=ms=>new Promise(r=>setTimeout(r,ms)); window.untilT=(cond,max)=>new Promise(r=>{ const t0=M.t; const f=()=>{ const v=cond(); if(v!=null&&v!==false) r({v,t:M.t-t0}); else if(M.t-t0>max) r({v:null,t:max}); else requestAnimationFrame(f); }; f(); });
      window.startPr=async(sty)=>{ if(M){ cancelAnimationFrame(raf); M=null; } if(sty) PR_A10=sty; startPractice(null); await wait(400); el('m-overlay').hidden=true; M.paused=false; lastT=performance.now(); await wait(250); }; window.joy=(x,y)=>{ input.joyActive=true; input.jx=x; input.jy=y; }; });
    const V=await p4.evaluate(async()=>{ const R={}; await startPr(); const u=M.user; M.players.filter(q=>q.team===1&&q.role!=='GK').forEach(q=>{ q.x=-40; q.y=-40; q.stun=99; }); const mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); mate.x=3; mate.y=100;
        u.x=W/2; u.y=70; setOwner(u,{clean:true}); u.protT=9; joy(0,-1); await wait(700); const ms=Math.hypot(u.vx,u.vy); joy(0,1); R.rev=(await untilT(()=>u.vy>0.5*ms,2)).t; joy(0,0);
        // 누른 방향 패스: 각도가 확실히 다른 동료 셋
        const fk=[0,1,2].map(i=>({...mate,i:80+i,ai:{},vx:0,vy:0})); M.players.push(...fk); let hit=0; for(let t=0;t<60;t++){ u.x=W/2; u.y=50; fk.forEach((q,i)=>{ const a=(i/3)*Math.PI*2+t; const r=10+((t*7+i*5)%18); q.x=clamp(u.x+Math.cos(a)*r,1,W-1); q.y=clamp(u.y+Math.sin(a)*r,1,H-1); }); const tg=fk[t%3]; const dx=tg.x-u.x, dy=tg.y-u.y, l=Math.hypot(dx,dy); if(pickPassTarget(u,dx/l,dy/l)===tg) hit++; } R.passHit=Math.round(hit/60*100); M.players=M.players.filter(q=>!fk.includes(q));
        // 원투
        R.gg=false; for(let tryN=0;tryN<3&&!R.gg;tryN++){ await startPr('press'); { const u=M.user, mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'), defs=M.players.filter(q=>q.team===1&&q.role!=='GK'); u.x=W/2; u.y=34; u.vx=u.vy=0; u.fx=0; u.fy=-1; setOwner(u,{clean:true}); u.protT=1; mate.x=W/2+9; mate.y=31; mate.vx=mate.vy=0; defs.forEach((q,i)=>{ q.stun=0; q.x=W/2+(i?-6:1.5); q.y=i?18:30; }); M.a10.cur.t0=M.t+30;
          await wait(250); joy(1,-0.2); input.passHold=true; await wait(120); input.passRelease=true; await wait(60); joy(0,-1); input.sprint=true; const y0=u.y; R.gg=(await untilT(()=>M.ball.owner===u&&u.y<y0-5?1:null,3.2)).v===1; input.sprint=false; joy(0,0); } } // 압박 원투는 70~90%라 한 번 실패는 정상 → 3번 중 한 번
        // 태클 헛발: ! 보고 옆으로 꺾으면 제침
        { const u=M.user; const defs=M.players.filter(q=>q.team===1&&q.role!=='GK'); let esc=0,n=0,bang=false; for(let k=0;k<5;k++){ defs.forEach((q,i)=>{ q.lunge=null; q.lungeCd=0; q.stun=i?99:0; q.x=i?-40:W/2; q.y=i?-40:34; q.jkT=0; }); u.x=W/2; u.y=40; u.vx=u.vy=0; setOwner(u,{clean:true}); u.protT=0; u.stun=0; M.a10.cur.t0=M.t+30; joy(0,-0.55); const d=defs[0];
            const w=await untilT(()=>d.lunge&&d.lunge.ph==='wind'?1:null,3); if(!w.v) continue; n++; joy(k%2?1:-1,-0.15); const r=await untilT(()=>M.ball.owner===d?-1:(d.lunge&&d.lunge.told)?1:null,1.6); if(r.v===1) esc++; joy(0,0); await wait(120); } R.lunge={n,esc,beats:M.stats.beats||0}; }
        // 수비 성향: 표시·차이
        R.sty={}; for(const k of ['press','drop','narrow']){ await startPr(k); const u=M.user; u.protT=0; M.a10.cur.t0=M.t+60; const ds=[]; let lun=0; const seen=new Set(); joy(0,-0.25); const t0=M.t; while(M.t-t0<4){ await wait(80); if(M.ball.owner!==u) break; const defs=M.players.filter(q=>q.team===1&&q.role!=='GK'); ds.push(nearest(defs,u)[1]); defs.forEach(q=>{ if(q.lunge&&!seen.has(q.lunge)){ seen.add(q.lunge); lun++; } }); } joy(0,0); ds.sort((x,y)=>x-y); R.sty[k]={med:+(ds[Math.floor(ds.length/2)]||0).toFixed(2),lun,lost:M.ball.owner!==u}; }
        // 슛 상황 판정
        { const u=M.user; u.vx=0; u.vy=0; u.fx=0; u.fy=-1; u.x=W/2; u.y=18; const a=shotSit(u,W/2,0); u.vy=-13; const b2=shotSit(u,W/2,0); R.ss={calm:+a.k.toFixed(2),run:+b2.k.toFixed(2),why:b2.why}; }
        // 10초 공격 한 세트
        await startPr('narrow'); const hud=el('pr-a10').textContent; for(let i=0;i<10;i++){ M.a10.cur.res=i%3?'실패':'골'; practiceReset(); await wait(40); } await wait(150); R.a10={hud:/1\/10/.test(hud),done:!!M.a10.done,goals:M.a10.goals,ov:/10초 공격 결과/.test(el('m-overlay').textContent),best:S.a10best&&S.a10best.narrow};
        endPractice(); await wait(200); practiceMenu(); await wait(150); R.menu=document.querySelectorAll('.hub-modal [data-pm^="a10:"]').length; document.querySelectorAll('.hub-modal').forEach(m=>m.remove());
        return R; });
    ok('손맛 v68: 반대 방향 전환 0.2초 안 · 누른 방향 동료에게 패스(≥95%) · 패스하고 뛰면 원투 리턴 · 태클(!) 보고 꺾으면 제침 · 수비 성향 3종 차이(달려들면 태클·물러서면 거리 둠) · 달리며 슛은 부정확 · 10초 공격 10번 → 결과/최고 기록', V.rev<0.2&&V.passHit>=95&&V.gg&&V.lunge.n>=3&&V.lunge.esc>=V.lunge.n-1&&(V.sty.press.lun>=1||V.sty.press.lost)&&V.sty.drop.lun===0&&!V.sty.drop.lost&&V.sty.drop.med>V.sty.narrow.med+0.6&&V.ss.run>V.ss.calm*2&&V.a10.hud&&V.a10.done&&V.a10.ov&&V.a10.goals===4&&V.a10.best===4&&V.menu===3&&e4.length===0, JSON.stringify({V,e4:e4.slice(0,2)}));
    await c4.close(); }
  // v69 찬스 모드: 기본 선택 → 빠른 중계(점 화면) → 찬스 직접 → 별점 → 결과 화면 요약
  { const c5=await b.newContext({viewport:{width:430,height:900}}); const p5=await c5.newPage(); const e5=[]; p5.on('pageerror',e=>e5.push(e.message)); await p5.goto(FILE); await p5.click('#go-create'); await p5.click('#btn-new'); await p5.waitForTimeout(300);
    await p5.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); renderHub(); }); await p5.waitForTimeout(300);
    const def=await p5.evaluate(()=>{ const b=document.querySelector('#sel-mode [data-mode].on'); return b?b.dataset.mode:null; });
    await p5.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); el('btn-go').click(); }); await p5.waitForTimeout(1200);
    const R=await p5.evaluate(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms)); const ov=el('m-overlay'); if(ov&&!ov.hidden){ const bt=ov.querySelector('.btn.primary'); if(bt) bt.click(); }
      const R={sim:false,chsim:false,live:0,feed:0}; const t0=Date.now();
      while(Date.now()-t0<70000){ await wait(150); if(!M) break; const C=M.chance; if(!C) continue; if(M.paused){ const o=el('m-overlay'); const bt=o&&!o.hidden&&o.querySelector('.btn.primary'); if(bt) bt.click(); continue; }
        C.speed=30; if(C.phase==='sim'){ R.sim=true; if(el('screen-match').classList.contains('chsim')) R.chsim=true; R.feed=Math.max(R.feed,document.querySelectorAll('#chfeed div').length); }
        if(C.phase==='live'&&C.cur&&!C.cur._t){ C.cur._t=1; R.live++; R.ctrl=!el('screen-match').classList.contains('chsim'); setTimeout(()=>{ if(M&&M.chance&&M.chance.cur) chanceEnd('time'); },400); } }
      const cr=document.querySelector('.chres'); R.res=!!document.querySelector('#screen-result:not([hidden])'); R.chres=cr?cr.innerText.split('\n')[0]:null; return R; });
    ok('찬스 모드 v69: 기본 선택 · 빠른 중계(점 화면·해설) → 찬스는 직접 조작 → 별점 · 결과 화면 찬스 요약', def==='chance'&&R.sim&&R.chsim&&R.feed>=1&&R.live>=1&&R.ctrl&&R.res&&/찬스 \d+번/.test(R.chres||'')&&e5.length===0, JSON.stringify({def,...R,e5:e5.slice(0,2)}));
    await c5.close(); }
  // v70 리그 확장: 아시아 9 · 유럽 12 · 남미 4개국 · 대륙 대회 6개 · 리그 선택 시트 · 스플릿 규정 · 별 10개
  { const c6=await b.newContext({viewport:{width:390,height:844}}); const p6=await c6.newPage(); const e6=[]; p6.on('pageerror',e=>e6.push(e.message)); await p6.goto(FILE); await p6.click('#go-create'); await p6.click('#btn-new'); await p6.waitForTimeout(300);
    await p6.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); tab='league'; renderLeague.cur=null; renderLeague.view='table'; renderHub(); }); await p6.waitForTimeout(200);
    await p6.click('#lg-open'); await p6.waitForTimeout(150); const pk={tabs:await p6.$$eval('.lgp [data-t]',x=>x.length),asia:await p6.$$eval('.lgp [data-row]',x=>x.length)};
    await p6.click('.lgp [data-t="eu"]'); pk.eu=await p6.$$eval('.lgp [data-row]',x=>x.length); await p6.click('.lgp [data-t="sam"]'); pk.sam=await p6.$$eval('.lgp [data-row]',x=>x.length); await p6.click('.lgp [data-t="eu"]'); await p6.click('.lgp [data-row="nl"]'); await p6.waitForTimeout(150);
    pk.cur=await p6.evaluate(()=>renderLeague.cur); await p6.click('#lg-open'); await p6.click('.lgp [data-t="comp"]'); await p6.click('.lgp [data-k="acl"]'); await p6.waitForTimeout(150); pk.acl=await p6.evaluate(()=>document.querySelectorAll('#div-table table').length);
    const V=await p6.evaluate(()=>{ const c={}; Object.entries(S.conts).forEach(([k,v])=>c[k]=v.teams.length); const id=S.conts.uel.teams[0]; S.clubId=id; S.wage=CLUBS[id].wage; S.rival=pickRival(); let cc=0,n=0; while(n++<120){ const ev=nextEvent(); if(!ev) break; if(ev.type==='cc') cc++; autoMatch(true); } finishAllLeagues();
      const lens={}; ['kr-1','be-1','at-1','sc-1','dk-1','ch-1'].forEach(d=>lens[d]=S.fixtures[d].length); const u=S.conts.uel; return {divs:Object.keys(S.divs).length,c,cc,uel:u.step===u.steps.length&&!!u.champion,lens,star:clubStar10(CLUBS['en-1-1']),s10:/s10/.test(starHTML(CLUBS['kr-2-0']))}; });
    ok('리그 확장 v70: 37개 리그(아시아·유럽·남미) · 대륙컵 6개(챔스 36·유로파 24·컨퍼런스 24·ACLE 24·ACL2 16·리베르타 16) · 리그 선택 시트(대륙 탭→목록 탭) · 내 대회 경기 진행 · 스플릿 규정 · 별 10개', pk.tabs===4&&pk.asia===9&&pk.eu===12&&pk.sam===4&&pk.cur==='nl-1'&&pk.acl===2&&V.divs===37&&V.c.ucl===36&&V.c.uel===24&&V.c.uecl===24&&V.c.acl===24&&V.c.acl2===16&&V.c.lib===16&&V.cc>=8&&V.uel&&V.lens['kr-1']===38&&V.lens['be-1']===40&&V.lens['at-1']===32&&V.lens['sc-1']===38&&V.star===10&&V.s10&&e6.length===0, JSON.stringify({pk,V,e6:e6.slice(0,2)}));
    await c6.close(); }
  // v72 가로 한 화면: 화면 자체는 스크롤 없음 · 홈의 경기 시작 버튼이 화면 안
  { const {devices}=require('playwright'); const c7=await b.newContext({...devices['iPhone 13 landscape']}); const p7=await c7.newPage(); const e7=[]; p7.on('pageerror',e=>e7.push(e.message)); await p7.goto(FILE); await p7.click('#go-create'); await p7.click('#btn-new'); await p7.waitForTimeout(300);
    await p7.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; for(let i=0;i<3;i++) autoMatch(true); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); });
    const F={}; for(const k of ['home','player:stat','skill','league','transfer','career:record','shop:gear']){ await p7.evaluate(k=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); goKey(k); },k); await p7.waitForTimeout(150);
      F[k]=await p7.evaluate(()=>{ const w=document.querySelector('#screen-hub .wrap'); const g=document.querySelector('#hub-col>.tabpanel:not([hidden]) #btn-go'); const r=g&&g.getBoundingClientRect(); return {over:w.scrollHeight-w.clientHeight,cols:document.querySelectorAll('#hub-col>.tabpanel:not([hidden]) .fl-col').length,go:g?(r.bottom<=innerHeight&&r.height>20):null}; }); }
    const bad=Object.entries(F).filter(([k,v])=>v.over>2||v.cols<1||v.go===false);
    ok('가로 한 화면 v72: 홈·성장·스킬·리그·이적·기록·장비 화면 스크롤 없음(칸 배치) · 경기 시작 버튼 화면 안', bad.length===0&&F.home.go===true&&e7.length===0, JSON.stringify({bad,home:F.home,e7:e7.slice(0,2)}));
    await c7.close(); }
  // v73 축구하는 맛: 공은 휘지 않고 내가 받으러 움직임 · 선호 포지션 · 킥오프 자기 진영 · 키퍼가 잡은 공 경합 금지
  { const c8=await b.newContext({viewport:{width:430,height:900}}); const p8=await c8.newPage(); const e8=[]; p8.on('pageerror',e=>e8.push(e.message)); await p8.goto(FILE); await p8.click('#go-create'); await p8.click('#pos-segs [data-pos="MF"]'); await p8.click('#posn-segs [data-pn="wm"]'); await p8.click('#btn-new'); await p8.waitForTimeout(300);
    const V=await p8.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); proSkipAll(1); S.tutSeen=true; S.compIntro=false; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); const posn=S.player.posn;
      // 받기
      let ok=0,bend=0,mv=0; for(let k=0;k<6;k++){ if(M){ cancelAnimationFrame(raf); M=null; } startPractice(null); await w(420); el('m-overlay').hidden=true; M.paused=false; M.freeze=0; M.players.filter(q=>q.team===1&&q.role!=='GK').forEach(q=>{ q.x=-40; q.y=-40; q.stun=99; }); const u=M.user, mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); u.x=W/2; u.y=50; u.vx=u.vy=0; input.joyActive=false; input.jx=input.jy=0; const a=k*1.05; mate.x=u.x+Math.cos(a)*16; mate.y=u.y+Math.sin(a)*16; setOwner(mate,{clean:true}); mate.touchT=0; mate.kickCd=0; await w(60);
        passTo(mate,u,{power:0.55}); const B=M.ball, sp=Math.hypot(B.vx,B.vy); const off=(k%2?1:-1)*1.8; const fx=u.x+Math.cos(a+Math.PI/2)*off, fy=u.y+Math.sin(a+Math.PI/2)*off; B.vx=fx-mate.x; B.vy=fy-mate.y; const l=Math.hypot(B.vx,B.vy); B.vx*=sp/l; B.vy*=sp/l; B.passTarget=u; const a0=Math.atan2(B.vy,B.vx), x0=u.x, y0=u.y; let a1=a0, got=false; const t0=Date.now(); while(Date.now()-t0<2500){ await w(25); if(B.owner===u){ got=true; break; } if(!B.owner) a1=Math.atan2(B.vy,B.vx); }
        if(got) ok++; bend=Math.max(bend,Math.abs(a1-a0)); mv=Math.max(mv,Math.hypot(u.x-x0,u.y-y0)); }
      // 경기: 선호 포지션 · 킥오프 · 키퍼
      if(M){ cancelAnimationFrame(raf); M=null; } S.trust=95; renderHome.mode='play'; S.lastMode='play'; startMatch(false); await w(600); el('m-overlay').hidden=true; M.paused=false; const u=M.user; const half=M.players.filter(p=>p.team===0?p.y<H/2:p.y>H/2).length; const kt=M.ball.owner?M.ball.owner.team:0; const circ=M.players.filter(p=>p.team!==kt&&Math.hypot(p.x-W/2,p.y-H/2)<9.15).length;
      M.freeze=0; const gk=M.players.find(q=>q.team===1&&q.role==='GK'); gk.x=W/2; gk.y=6; M.ball.lastKicker=u; setOwner(gk); gk.gkHoldUntil=M.t+9; gk.protT=9; M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK').forEach((q,i)=>{ q.x=W/2+(i%5-2)*3; q.y=9+(i%3)*2; }); await w(1500); const gd=Math.min(...M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK').map(q=>Math.hypot(q.x-gk.x,q.y-gk.y)));
      return {posn,ok,bendDeg:Math.round(bend*180/Math.PI),mv:+mv.toFixed(1),sr:subRole(u),hx:Math.round(u.hx),half,circ,gd:+gd.toFixed(1)}; });
    ok('v73 손맛: 공은 휘지 않고(0°) 내가 받으러 움직여 받음 · 선호 포지션(측면 MF) 자리 · 킥오프 각자 진영·센터서클 · 키퍼가 잡은 공엔 9m 밖', V.posn==='wm'&&V.ok>=5&&V.bendDeg<=1&&V.mv>0.5&&V.mv<4.5&&V.sr==='WM'&&(V.hx<20||V.hx>48)&&V.half===0&&V.circ===0&&V.gd>=8.5&&e8.length===0, JSON.stringify({...V,e8:e8.slice(0,2)}));
    await c8.close(); }
  { const c9=await b.newContext({...devices['iPhone 13 landscape']}); const p9=await c9.newPage(); await p9.goto(FILE); await p9.click('#go-create'); await p9.click('#btn-new'); await p9.waitForTimeout(400);
    await p9.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.trust=95; renderHome.mode='play'; S.lastMode='play'; startMatch(false); }); await p9.waitForTimeout(800); await p9.evaluate(()=>{ const g=el('lu-go'); if(g) g.click(); }); await p9.waitForTimeout(2500);
    const X=await p9.evaluate(()=>new Promise(res=>{ M.freeze=0; const u=M.user; u.x=49; u.y=22; setOwner(u); M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK').slice(0,3).forEach((q,i)=>{ q.x=[38,46,42][i]; q.y=[8,7,14][i]; q.stun=2; }); let n=0; const oe=CanvasRenderingContext2D.prototype.ellipse, od=drawCrossTargets; drawCrossTargets=function(c,p){ CanvasRenderingContext2D.prototype.ellipse=function(...a){ n++; return oe.apply(this,a); }; try{ od(c,p); } finally { CanvasRenderingContext2D.prototype.ellipse=oe; } }; setTimeout(()=>{ drawCrossTargets=od; res({n,land:isLand()}); },300); }));
    ok('v73 크로스 지역: 가로 화면에서도 박스 안 동료 표시', X.land&&X.n>=3, JSON.stringify(X)); await c9.close(); }
  // v73.1 가로: 리그 순위표가 표 안에서 넘어감 · 칸 안에 잘려서 안 보이는 내용 없음
  { const ca=await b.newContext({...devices['iPhone SE landscape']}); const pa=await ca.newPage(); await pa.goto(FILE); await pa.click('#go-create'); await pa.click('#btn-new'); await pa.waitForTimeout(400);
    await pa.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; for(let i=0;i<6;i++) autoMatch(true); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); });
    const hid=[]; for(const k of ['home','player:stat','player:week','shop:gear','skill','league','career:record','transfer','shop:endo']){ await pa.evaluate(k=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); goKey(k); },k); await pa.waitForTimeout(200); const r=await pa.evaluate(()=>{ const o=[]; document.querySelectorAll('#hub-col>.tabpanel:not([hidden]) *').forEach(e=>{ if(e.offsetParent===null) return; const cs=getComputedStyle(e); if(cs.overflowY==='hidden'&&e.scrollHeight>e.clientHeight+6&&e.clientHeight>40) o.push((e.className||e.tagName)+':'+(e.scrollHeight-e.clientHeight)); }); return o; }); if(r.length) hid.push(k+' '+r.join(',')); }
    await pa.evaluate(()=>goKey('league')); await pa.waitForTimeout(250); const bx=await pa.evaluate(()=>{ const s=document.querySelector('#hub-col>.tabpanel:not([hidden]) .fl-scroll'); if(!s) return null; const r=s.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),ch:s.clientHeight,sh:s.scrollHeight}; });
    let top=0; if(bx){ const cdp=await ca.newCDPSession(pa); await cdp.send('Input.synthesizeScrollGesture',{x:bx.x,y:bx.y,yDistance:-200,speed:800}); await pa.waitForTimeout(250); top=await pa.evaluate(()=>document.querySelector('#hub-col>.tabpanel:not([hidden]) .fl-scroll').scrollTop); }
    ok('가로: 리그 순위표 손가락으로 넘김 · 칸 안에 잘린 내용 없음', bx&&bx.sh>bx.ch&&top>50&&hid.length===0, JSON.stringify({bx,top,hid})); await ca.close(); }
  { const ca=await b.newContext({...devices['iPhone 13 landscape']}); const pa=await ca.newPage(); await pa.goto(FILE); await pa.click('#go-create'); await pa.click('#btn-new'); await pa.waitForTimeout(400);
    await pa.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; for(let i=0;i<3;i++) autoMatch(true); document.querySelectorAll('.hub-modal,.toast').forEach(m=>m.remove()); goKey('league'); }); await pa.waitForTimeout(500);
    const bx=await pa.evaluate(()=>{ const r=document.querySelector('#hub-col>.tabpanel:not([hidden]) tbody tr:nth-child(3)').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; }); const cd=await ca.newCDPSession(pa); const T=(type,y)=>cd.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:bx.x,y}]});
    await T('touchStart',bx.y); for(let i=1;i<=8;i++){ await T('touchMove',bx.y-i*12); await pa.waitForTimeout(16); } await T('touchEnd'); await pa.waitForTimeout(500);
    const st=await pa.evaluate(()=>{ const s=document.querySelector('#hub-col>.tabpanel:not([hidden]) .fl-scroll'); return s?Math.round(s.scrollTop):-1; });
    ok('v74 가로: 리그 순위표 손가락으로 밀림', st>40, 'scrollTop '+st); await ca.close(); }
  { const cb=await b.newContext({...devices['iPhone 13 landscape']}); const pb=await cb.newPage(); const eb=[]; pb.on('pageerror',e=>eb.push(e.message)); await pb.goto(FILE); await pb.click('#go-create'); await pb.click('#btn-new'); await pb.waitForTimeout(400);
    const R=await pb.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); const out={};
      for(const a of [0,8,20]){ S.player.career.apps=a; S.trust=95; if(M){ cancelAnimationFrame(raf); M=null; } show('screen-hub'); renderHome.mode='play'; S.lastMode='play'; startMatch(false); await w(500); const hid=getComputedStyle(el('k-shot')).visibility; const g=el('lu-go'); if(g) g.click(); await w(900); out['lv'+a]=hintLv(); out['gest'+a]=document.body.dataset.hint==='2'?'shown':getComputedStyle(document.querySelector('#k-sprint .gest')).display; out['ovl'+a]=hid; }
      const t0=S.hintMode; hintModeNext(); const t1=S.hintMode; S.hintMode='off'; out.off=hintLv(); S.hintMode='on'; out.on=hintLv(); S.hintMode=t0; return {...out,t1}; });
    ok('v75 조작 힌트 단계: 처음엔 전부 → 8경기 핵심만 → 16경기 끔 · 설정으로 항상/끔 · 라인업 중 조작 버튼 숨김', R.lv0===2&&R.lv8===1&&R.lv20===0&&R.gest0==='shown'&&R.gest8==='none'&&R.gest20==='none'&&R.ovl0==='hidden'&&R.off===0&&R.on===2&&eb.length===0, JSON.stringify({...R,eb:eb.slice(0,2)})); await cb.close(); }
  { const ct=await b.newContext({viewport:{width:430,height:900}}); const pt=await ct.newPage(); const et=[]; pt.on('pageerror',e=>et.push(e.message)); await pt.goto(FILE); await pt.click('#go-create'); await pt.click('#pos-segs [data-pos="MF"]'); await pt.click('#btn-new'); await pt.waitForTimeout(400);
    const R=await pt.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); const res={open:0,openN:0,alone:0,aloneN:0,refuse:0,gain:0};
      for(let k=0;k<16;k++){ const alone=k>=10; if(M){ cancelAnimationFrame(raf); M=null; } S.trust=95; show('screen-hub'); renderHome.mode='play'; S.lastMode='play'; startMatch(false); await w(200); const g=el('lu-go'); if(g) g.click(); await w(120); el('m-overlay').hidden=true; M.paused=false; await w(900); M.introT=0; M.freeze=0; M.chance=null;
        const u=M.user, J=()=>(Math.random()-0.5)*5; const T0=M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK'), T1=M.players.filter(q=>q.team===1&&q.role!=='GK'); u.x=34+J(); u.y=50+J();
        const att=alone?[[12,52],[56,52],[22,57],[46,57],[34,60]]:[[16,33],[34,34],[52,33],[26,44],[42,44]], back=[[12,72],[26,76],[42,76],[56,72],[34,58]]; T0.forEach((q,i)=>{ const P=i<5?att[i]:back[(i-5)%5]; q.x=P[0]+J(); q.y=P[1]+J(); q.vx=q.vy=0; });
        const dl=alone?[[16,34],[28,33],[40,33],[52,34],[24,44],[44,44],[30,62],[40,64],[34,70],[20,66]]:[[14,30],[27,29],[41,29],[54,30],[18,42],[50,42],[26,58],[42,60],[34,64],[34,70]]; T1.forEach((q,i)=>{ const P=dl[i%dl.length]; q.x=P[0]+J(); q.y=P[1]+J()*0.6; q.vx=q.vy=0; });
        setOwner(u); u.touchT=0; u.kickCd=0; await w(200); setOwner(u); u.touchT=0; const y0=u.y, before=M.stats.passes; input.thruHold=true; await w(330); input.thruHold=false; input.thruRelease=true; await w(60);
        if(alone) res.aloneN++; else res.openN++; if(M.stats.passes===before){ res.refuse++; continue; } const t0=Date.now(); while(Date.now()-t0<4500){ await w(40); const o=M.ball.owner; if(o||M.setPiece){ if(o&&o.team===0){ if(alone) res.alone++; else { res.open++; res.gain+=y0-o.y; } } break; } } }
      res.gain=Math.round(res.gain/Math.max(1,res.open)); return res; });
    ok('v76 스루패스: 앞에 동료 있으면 대부분 연결 · 앞에 아무도 없어도 빈 공간으로 찔러 동료가 뛰어감 (거절 0)', R.refuse===0&&R.open>=7&&R.alone>=1&&R.gain>=5&&et.length===0, JSON.stringify({...R,et:et.slice(0,2)})); await ct.close(); }
  // ── v78: 동료 AI · 골키퍼 · 선발 경쟁 · 이적시장 기간 · 개인 코치 팝업 · 성장 곡선 · 리그 수준 · 내 팀/축구교실
  { const cv=await b.newContext({viewport:{width:430,height:900}}); const pv=await cv.newPage(); const ev=[]; pv.on('pageerror',e=>ev.push(e.message)); await pv.goto(FILE); await pv.click('#go-create'); await pv.click('#pos-segs [data-pos="MF"]'); await pv.click('#btn-new'); await pv.waitForTimeout(400);
    const R=await pv.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); const r={}; const T0=performance.now();
      const oDraw=draw, oHUD=updateHUD, oRAF=window.requestAnimationFrame, oBan=banner; draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; banner=()=>{};
      let t=performance.now(); const step=n=>{ for(let f=0;f<n;f++){ t+=33.3; lastT=t-33.3; loop(t); M.freeze=0; } };
      // ① 골키퍼: 11~26m 슛 120개 → 선방률
      show('screen-hub'); renderHome.mode='play'; startMatch(false); { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true;
      { let seed=7; const rr=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; }; const res={goal:0,save:0,miss:0}; const oGS=goalScored, oOB=outOfBounds, oSV=gkSave; let out=null;
        goalScored=function(){ out='goal'; M.ball.owner=null; M.ball.vx=M.ball.vy=0; M.ball.x=W/2; M.ball.y=H/2; }; outOfBounds=function(){ out=out||'miss'; M.ball.vx=M.ball.vy=0; M.ball.x=W/2; M.ball.y=H/2; }; gkSave=function(){ out='save'; oSV.apply(this,arguments); };
        const gk=M.players.find(q=>q.team===1&&q.role==='GK'); gk.st.gk=70; const sh=M.players.find(q=>q.team===0&&q.role==='FW'&&!q.isUser); sh.st.shot=72;
        for(let k=0;k<120;k++){ M.min=10; M.half2=false; M.htWait=0; M.paused=false; M.over=false; M.players.forEach(q=>{ if(q!==gk&&q!==sh){ q.x=q.team===0?5:63; q.y=95; q.vx=q.vy=0; } }); M.user.x=34; M.user.y=100;
          const d0=11+rr()*15, a=(rr()-0.5)*1.4; sh.x=W/2+Math.sin(a)*d0; sh.y=Math.max(6,Math.cos(a)*d0); sh.vx=sh.vy=0; gk.x=W/2; gk.y=2; gk.vx=gk.vy=0; M.setPiece=null; M.restart=null; M.ball.saveChecked=false; setOwner(sh);
          for(let f=0;f<30;f++){ t+=33.3; lastT=t-33.3; sh.vx=sh.vy=0; loop(t); if(M.ball.owner!==sh) setOwner(sh); sh.touchT=0; M.freeze=0; }
          out=null; sh.touchT=0; shoot(sh,W/2+(rr()-0.5)*6.6,0,{power:0.55+rr()*0.4,force:true}); for(let f=0;f<120&&!out;f++){ t+=33.3; lastT=t-33.3; loop(t); M.freeze=0; if(M.ball.owner===gk) out='save'; else if(M.ball.owner) out='miss'; } res[out||'miss']++; }
        goalScored=oGS; outOfBounds=oOB; gkSave=oSV; r.gk={...res,pct:Math.round(res.save/Math.max(1,res.save+res.goal)*100)}; }
      // ② 내가 자리를 비우면 동료가 메움
      { M=null; show('screen-hub'); startMatch(false); { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.freeze=0;
        const u=M.user; const mates=M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK'); const holder=M.players.find(q=>q.team===1&&q.role==='MF'); let sum=0,n=0;
        for(let f=0;f<180;f++){ t+=33.3; lastT=t-33.3; u.x=34; u.y=14; u.vx=u.vy=0; if(M.ball.owner!==holder) setOwner(holder); holder.touchT=1; holder.vx=holder.vy=0; M.freeze=0; M.setPiece=null; loop(t); if(f>90){ const Pu=shapePoint(u,0,false,H-M.ball.y,M.ball.x,null); sum+=nearest(mates,Pu)[1]; n++; } }
        r.cover={avg:+(sum/n).toFixed(1),dbg:(M.dbg||{}).cover||0}; }
      // ③ 엔진 기록: 양 팀 AI 한 경기 (그리기 끔)
      { M=null; show('screen-hub'); startMatch(false); { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true; M.chanceReq=false; M.chance=null; const real=M.user; real.isUser=false; M.user={x:-60,y:-60,vx:0,vy:0,fx:0,fy:-1,team:0,i:99,role:'FW',isUser:true,st:{...real.st},hx:-60,hy:-60,ai:{},sta:1};
        const oFT=fullTime; let over=false; fullTime=function(){ over=true; M.over=true; }; let fr=0; while(!over&&fr<7000){ t+=33.3; lastT=t-33.3; loop(t); fr++; if(M.htWait>0){ M.htWait=0; } if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); } fullTime=oFT;
        r.sim={min:Math.round(M.min),shots:[M.tstats[0].shots,M.tstats[1].shots],passes:[(M.dbg||{}).pc0||0,(M.dbg||{}).pc1||0]}; }
      M=null; draw=oDraw; updateHUD=oHUD; window.requestAnimationFrame=oRAF; banner=oBan; show('screen-hub'); S.startLock=0;
      // ④ 선발 선택: 능력치 차이가 크면 선발 못 함 · 비슷하면 대부분 선발 (가끔 로테이션)
      { const dist={}; ensureComp(); [3,-14].forEach(g=>{ const c={start:0,bench:0,out:0}; for(let i=0;i<300;i++){ S.comp.ovr=ovr()-g; S.trust=62; S.starter=true; S.player.cond=80; S.sel=null; S.round=1+i%30; S.history.length=Math.min(S.history.length,i%7); const s=selFor({type:'league',opp:{id:'x'}}); c[s.k]++; } dist['g'+g]=c; }); r.sel=dist; S.sel=null; }
      // ⑤ 이적시장 기간: 제안 유지 · 거절해도 다시 옴 · 기간 끝나면 닫힘
      { toast=()=>{}; const sc=ensureScout(); const ids=Object.values(CLUBS).filter(c=>!c.nat&&c.id!==S.clubId&&c.str<ovr()+8&&c.wage>CLUBS[S.clubId].wage).slice(0,3).map(c=>c.id); ids.forEach(id=>sc.f[id]=75); winterWindow([]); const n0=S.offers.length, c0=S.offers[0]&&S.offers[0].clubId; rejectOffer(0); const n1=S.offers.length; const rnd=Math.random; Math.random=()=>0.1; winTick([]); Math.random=rnd; const back=S.offers.some(o=>o.clubId===c0&&o.back); S.round=S.win.until+1; winTick([]); r.win={n0,n1,back,closed:!S.win&&S.offers.length===0}; S.round=1; }
      // ⑥ 개인 코치 팝업: 횟수 고르고 한 번에 · 주당 횟수 제한 · 높은 능력치는 게이지가 큼
      { const p=S.player; p.money=1e6; p.stats.shot=50; p.tg={}; S.coachWk=null; coachModal(); const m=document.querySelector('.co-m'); m.querySelector('[data-cp="shot"]').click(); m.querySelector('[data-cp="shot"]').click(); const dis=m.querySelector('[data-cp="pass"]').disabled; const m0=p.money; m.querySelector('#co-go').click(); r.coach={shot:p.stats.shot,paid:m0-p.money>0,limitHit:dis,left:coachLimit()-coachUsed(),hiCost:[ptCost(50),ptCost(80),ptCost(95)]}; document.querySelectorAll('.hub-modal').forEach(x=>x.remove()); }
      // ⑦ 리그 수준: 한국 1부 > 태국·중국, 일본보다 조금 아래
      { const avg=d=>{ const a=Object.values(CLUBS).filter(c=>c.homeDiv===d); return a.reduce((x,c)=>x+c.str,0)/a.length; }; r.lg={kr:+avg('kr-1').toFixed(1),jp:+avg('jp-1').toFixed(1),cn:+avg('cn-1').toFixed(1),th:+avg('th-1').toFixed(1)}; }
      // ⑧ 내 팀·축구교실 화면 · 선 아이콘 뒤 글자 보임
      { S.player.money=1e6; goKey('shop:life'); const st=document.querySelectorAll('.st-it').length; const b1=document.querySelector('[data-st="coach"]'); b1&&b1.click(); const ac=document.querySelector('#ac-up'); ac&&ac.click(); const sp=document.createElement('span'); sp.innerHTML=luc('leaf',15)+'글자'; document.body.append(sp); const vis=sp.getBoundingClientRect().width>30; sp.remove(); r.life={st,coachLv:staffLv('coach'),acad:S.acad&&S.acad.lv,lucText:vis}; }
      r.ms=Math.round(performance.now()-T0); return r; });
    ok('v78 골키퍼: 11~26m 슛 선방률 65~85% (각 좁히기 · 슛 순간 옆으로)', R.gk.pct>=65&&R.gk.pct<=85, JSON.stringify(R.gk));
    ok('v78 내가 자리를 비우면 동료가 메움 (내 원래 자리 근처 4m 안)', R.cover.avg<4&&R.cover.dbg>=1, JSON.stringify(R.cover));
    ok('v78 엔진 기록: AI끼리 90분 · 양 팀 모두 슈팅 · 패스 연결', R.sim.min>=90&&R.sim.shots[0]+R.sim.shots[1]>=2&&R.sim.passes[0]>5&&R.sim.passes[1]>5, JSON.stringify(R.sim));
    ok('v78 선발 경쟁: 비슷하면 대부분 선발(가끔 로테이션) · 능력치가 크게 모자라면 선발 0 (벤치·명단 제외)', R.sel.g3.start>=240&&R.sel.g3.bench>=3&&R.sel['g-14'].start===0&&R.sel['g-14'].out>20, JSON.stringify(R.sel));
    ok('v78 이적시장 기간: 제안 유지 · 개별 거절 · 조건 올려 재제안 · 기간 끝나면 마감', R.win.n0>=2&&R.win.n1===R.win.n0-1&&R.win.back&&R.win.closed, JSON.stringify(R.win));
    ok('v78 개인 코치 팝업: 횟수 골라 한 번에 · 주당 제한 · 높은 능력치일수록 비쌈', R.coach.shot===52&&R.coach.paid&&R.coach.limitHit&&R.coach.left===0&&R.coach.hiCost[2]>R.coach.hiCost[1]&&R.coach.hiCost[1]>R.coach.hiCost[0], JSON.stringify(R.coach));
    ok('v78 리그 수준: 한국 1부 > 중국·태국, 일본보다 조금 아래', R.lg.kr>R.lg.cn&&R.lg.kr>R.lg.th&&R.lg.kr<R.lg.jp, JSON.stringify(R.lg));
    ok('v78 내 팀(스태프 4명)·고향 축구교실 · 아이콘 뒤 글자 보임', R.life.st===4&&R.life.coachLv===1&&R.life.acad===1&&R.life.lucText&&ev.length===0, JSON.stringify({...R.life,ms:R.ms,ev:ev.slice(0,2)})); await cv.close(); }
  ok('페이지 오류 없음', errs.length===0, errs.slice(0,3).join(' / '));
  await b.close();
  const fail=results.filter(r=>r[0]==='실패').length;
  results.forEach(r=>console.log(`${r[0]==='통과'?'✅':'❌'} ${r[1]}${r[2]?'  — '+r[2]:''}`));
  console.log(`\n${results.length-fail}/${results.length} 통과`);
})();
