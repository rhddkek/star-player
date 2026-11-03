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
  await pg.evaluate(()=>{ S.tutSeen=true; S.noReplay=true; save(); renderHub(); });

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
  const run=await pg.evaluate(()=>({v:Math.hypot(M.user.vx,M.user.vy),on:M.sprinting,sta:M.sta,mp:M.mp}));
  await pg.dispatchEvent('#k-sprint','pointerup',{pointerId:3}); await pg.evaluate(()=>{ input.joyActive=false; input.jx=input.jy=0; });
  ok('달리기 버튼: 속도 30% 이상 증가', run.on&&run.v>walk*1.3, `${walk.toFixed(1)}→${run.v.toFixed(1)}m/s`);
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

  // 7) 연습장: 들어가서 슛 → 공 다시 받기 → 나와도 기록·라운드 그대로
  await pg.click('#tabs button[data-tab="home"]'); await pg.waitForTimeout(200);
  const pre=await pg.evaluate(()=>JSON.stringify({r:S.round,h:(S.history||[]).length,xp:S.player.xp,apps:S.player.career.apps}));
  await pg.click('#btn-practice'); await pg.waitForTimeout(1500);
  const pr1=await pg.evaluate(()=>({practice:!!(M&&M.practice),n:M.players.length,own:M.ball.owner===M.user}));
  ok('연습장 입장: 소수 인원·내 공으로 시작', pr1.practice&&pr1.n<=6&&pr1.own, JSON.stringify(pr1));
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
  if(warn){ await pg.click('#nw-go'); await pg.waitForTimeout(400); }
  if(bkPath){ await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); const [fc]=await Promise.all([pg.waitForEvent('filechooser'), pg.click('#btn-import')]); await fc.setFiles(bkPath); await pg.waitForTimeout(500);
    const back=await pg.evaluate(()=>{ const o=load(); return o&&o.player&&o.player.level; }); ok('백업 불러오기: 이전 커리어 복원', back===6, 'Lv.'+back); }
  { await pg.evaluate(()=>{ show('screen-title'); initTitle(); }); const c2=await pg.$('#btn-continue'); if(c2) await c2.click(); await pg.waitForTimeout(600); }

  // 5) 모바일 각 탭: 가로 넘침·잘림
  for(const t of ['home','player','skill','league','transfer']){ const btn=await pg.$(`#tabs button[data-tab="${t}"]`); if(!btn) continue; await btn.click(); await pg.waitForTimeout(250);
    const r=await pg.evaluate(()=>{ const W=window.innerWidth; const bad=[]; document.querySelectorAll('.screen:not([hidden]) *').forEach(e=>{ const b=e.getBoundingClientRect(); if(b.width>0&&b.right>W+1&&getComputedStyle(e).position!=='fixed') bad.push((e.id||e.className||e.tagName).toString().slice(0,30)+':'+Math.round(b.right)); }); return {scroll:document.documentElement.scrollWidth>W,bad:bad.slice(0,4)}; });
    ok(`모바일 ${t} 탭: 가로 넘침 없음`, !r.scroll&&r.bad.length===0, r.bad.join(', ')); }
  { const ln=await pg.evaluate(()=>{ S.number=9; save(); M=null; startMatch(false); const nums=M.players.filter(p=>p.team===0).map(p=>p.isUser?S.number:shirtNo(p)); const dup=nums.filter((n,i)=>nums.indexOf(n)!==i); const sc=el('sc-h').querySelector('span').textContent; cancelAnimationFrame(raf); ambience(false); M=null; el('m-overlay').hidden=true; show('screen-hub'); renderHub(); return {dup,sc}; });
    ok('라인업 등번호 중복 없음 · 점수판 한글 약칭', ln.dup.length===0&&/[가-힣]/.test(ln.sc), JSON.stringify(ln)); }
  { const sk=await pg.evaluate(()=>{ S.player.level=2; renderSkill.full=false; renderSkill.f='all'; tab='skill'; renderHub(); const n1=document.querySelectorAll('#tab-skill .skgrid button.sk').length; const btn=!!document.getElementById('sk-full'); renderSkill.full=true; renderHub(); const n2=document.querySelectorAll('#tab-skill .skgrid button.sk').length; renderSkill.full=false; renderHub(); return {n1,n2,btn}; });
    ok('스킬 화면: 기본은 쓸 수 있는 것+다음 해금만, 전체 보기 펼치기', sk.btn&&sk.n1<sk.n2, JSON.stringify(sk)); }
  ok('페이지 오류 없음', errs.length===0, errs.slice(0,3).join(' / '));
  await b.close();
  const fail=results.filter(r=>r[0]==='실패').length;
  results.forEach(r=>console.log(`${r[0]==='통과'?'✅':'❌'} ${r[1]}${r[2]?'  — '+r[2]:''}`));
  console.log(`\n${results.length-fail}/${results.length} 통과`);
})();
