// v82 점검: 개인기 버튼(페인트·드래그백·등지기·지연 수비·몸싸움) · 노쇠/노련미 · 베테랑 특성 · 은퇴 투어 · 역오퍼 · 고향팀의 부름 · 고향 구단 프로젝트
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:430,height:900}}); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+(process.argv[2]||'/home/claude/star-player/index.html')); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(400);
 const R=await p.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); const oDraw=draw; draw=()=>{}; window.requestAnimationFrame=()=>0; banner=()=>{}; toast=()=>{};
  const r={}; let t=performance.now();
  const start=()=>{ M=null; show('screen-hub'); renderHome.mode='play'; startMatch(false); { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.freeze=0; M.restart=null; M.setPiece=null; M.kickoffT=0; };
  const fr=()=>{ t+=33.3; lastT=t-33.3; loop(t); M.freeze=0; M.restart=null; M.setPiece=null; };
  const clearOpp=keep=>M.players.filter(q=>q.team===1&&!keep.includes(q)&&q.role!=='GK').forEach(q=>{ q.x=5; q.y=95; q.vx=q.vy=0; });
  // ① 개인기 탭 = 페인트 / 뒤로 = 드래그백 / 꾹 = 등지기
  { start(); const u=M.user; u.x=34; u.y=50; u.fx=0; u.fy=-1; setOwner(u,{clean:true}); const d=M.players.find(q=>q.team===1&&q.role!=='GK'); d.x=34; d.y=47.6; clearOpp([d]);
    input.mvHold=true; input.mvDown=true; fr(); input.mvHold=false; input.mvUp=true; fr(); const f1={moves:M.stats.moves||0,cd:M.feintCd>M.t};
    M.feintCd=0; for(let i=0;i<40;i++) fr(); input.jx=0; input.jy=1; input.joyActive=true; input.mvHold=true; input.mvDown=true; fr(); input.mvHold=false; input.mvUp=true; fr(); input.joyActive=false; input.jx=input.jy=0; const f2={moves:M.stats.moves||0, vy:+u.vy.toFixed(1)};
    setOwner(u,{clean:true}); input.mvHold=true; input.mvDown=true; let sh=0, spd=0; for(let i=0;i<20;i++){ fr(); if(M.mvShield) sh++; } input.jx=1; input.joyActive=true; for(let i=0;i<20;i++){ fr(); spd=Math.max(spd,Math.hypot(u.vx,u.vy)); } input.mvHold=false; input.mvUp=true; input.joyActive=false; input.jx=0; fr();
    r.atk={f1,f2,shieldFrames:sh,shieldSpd:+spd.toFixed(1),max:+maxSpeed(u).toFixed(1),noFeintAfterHold:(M.stats.moves||0)===f2.moves}; }
  // ② 등지기 효과: 수비 3명이 4초 압박할 때 뺏기는 횟수 (등지기 vs 그냥 서 있기)
  const shieldRun=use=>{ let lost=0; for(let k=0;k<8;k++){ start(); const u=M.user; u.x=34; u.y=50; u.vx=u.vy=0; setOwner(u,{clean:true}); const T1=M.players.filter(q=>q.team===1&&q.role!=='GK').slice(0,2); T1.forEach((q,i)=>{ q.x=34+(i?3:-3); q.y=46; q.vx=q.vy=0; q.st={...q.st,tackle:65,str:60}; }); clearOpp(T1);
      if(use){ input.mvHold=true; input.mvDown=true; } for(let f=0;f<120;f++){ /* 4초 */ T1.forEach(q=>{ if((q.stun||0)>0) return; const dx=u.x-q.x, dy=u.y-q.y, d=Math.hypot(dx,dy)||1; if(d>0.9){ q.x+=dx/d*0.18; q.y+=dy/d*0.18; } }); fr(); if(M.ball.owner&&M.ball.owner.team===1){ lost++; break; } }
      if(use){ input.mvHold=false; input.mvUp=true; fr(); } } return lost; };
  r.shield={without:shieldRun(false),with:shieldRun(true)};
  // ③ 지연 수비: 상대 공일 때 꾹 → 골문 쪽 2m 안팎에서 마주 봄 / 탭 = 몸싸움
  { start(); const u=M.user; u.x=20; u.y=60; const o=M.players.find(q=>q.team===1&&q.role==='MF'); o.x=34; o.y=50; setOwner(o,{clean:true}); clearOpp([o]);
    input.mvHold=true; input.mvDown=true; for(let i=0;i<100;i++){ o.x=34; o.y=50; o.vx=o.vy=0; o.touchT=1; if(M.ball.owner!==o) setOwner(o,{clean:true}); fr(); }
    const gs=u.y>o.y, d=dist(u,o), face=(u.fx*(o.x-u.x)+u.fy*(o.y-u.y))/(d||1); const on=M.jockeyOn; input.mvHold=false; input.mvUp=true; fr();
    let won=0, tries=0; for(let k=0;k<20;k++){ setOwner(o,{clean:true}); o.x=34; o.y=50; o.vx=o.vy=0; u.x=34; u.y=51.4; u.stun=0; M.shCd=0; M.ball.x=o.x; M.ball.y=o.y; input.mvHold=true; input.mvDown=true; fr(); input.mvHold=false; input.mvUp=true; fr(); tries++; if(M.ball.owner!==o) won++; }
    r.def={on,goalSide:gs,d:+d.toFixed(1),face:+face.toFixed(2),duel:won+'/'+tries,duels:M.stats.duels||0}; }
  // ④ 화면: 개인기 버튼 글자 (공 있을 때/상대 공일 때)
  { start(); updateHUD(); const u=M.user; setOwner(u,{clean:true}); updateHUD(); const a=el('k-move').textContent; const o=M.players.find(q=>q.team===1&&q.role==='MF'); setOwner(o,{clean:true}); updateHUD(); const dd=el('k-move').textContent; r.hud={a,d:dd}; }
  M=null; show('screen-hub');
  // ⑤ 노쇠 · 노련미 · 자기 관리
  { const P=S.player; const base={...P.stats}; const run=(care,ages)=>{ let tot={}; for(let k=0;k<40;k++){ P.stats={...base,spd:80,sta:80,str:80,pass:70}; P.vet=care?[2]:[]; archFx._K=null; ages.forEach(a=>{ P.age=a; ageDecline(P,[]); }); Object.keys(P.stats).forEach(s=>tot[s]=(tot[s]||0)+(P.stats[s]-({...base,spd:80,sta:80,str:80,pass:70})[s])/40); } Object.keys(tot).forEach(s=>tot[s]=+tot[s].toFixed(1)); return tot; };
    r.age={to32:run(false,[28,29,30,31,32]),to36:run(false,[28,29,30,31,32,33,34,35,36]),care36:run(true,[28,29,30,31,32,33,34,35,36])}; P.age=36; P.stats={...base,spd:84}; const cs=coachSim('spd',5); r.cap={spd36:statCap('spd',36),pass36:statCap('pass',36),coachAtCap:cs.v,p30:statCap('spd',30)}; P.stats={...base}; P.vet=[]; P.age=18; archFx._K=null; }
  // ⑥ 베테랑 특성: 팝업에서 고르기 · 효과 (플레이 스타일 없이도)
  { const P=S.player; P.age=30; P.arch=null; P.vet=[]; archFx._K=null; archModal(); const m=document.querySelector('.ar-m'); const opn=m.querySelectorAll('[data-vet]:not(:disabled)').length; m.querySelector('[data-vet="0:2"]').click(); const after=(P.vet||[])[0]; const lock33=m.querySelectorAll('[data-vet^="1:"]:not(:disabled)').length; m.querySelector('#ar-x').click();
    start(); const drain=aMulC('drain',['all']); M=null; show('screen-hub'); P.vet=[0]; archFx._K=null; start(); const ts=archFx().filter(e=>e.t==='teamSt').length; M=null; show('screen-hub'); r.vet={opn,after,lock33,drain,ts,pend:vetPending()}; P.age=18; P.vet=[]; archFx._K=null; }
  // ⑦ 고향 구단: 후원 → 지분 → 구단주 → 투자·시설 → 시즌 끝 배당·기록
  { const P=S.player; P.money=5e6; const c=hcHome(); const s0=c.str; hcModal(); let m=document.querySelector('.hc-m'); m.querySelector('[data-sp="2"]').click(); const s1=c.str;
    m.querySelector('[data-ht="sh"]').click(); for(let i=0;i<6;i++){ const bb=m.querySelector('[data-shb]'); if(bb&&!bb.disabled) bb.click(); } const own=hcOwner(), sh=S.hc.sh;
    m.querySelector('[data-ht="own"]').click(); m.querySelector('[data-bud="2"]').click(); const s2=c.str; ['tr','yo','st'].forEach(id=>{ const bb=m.querySelector(`[data-fac="${id}"]`); if(bb&&!bb.disabled) bb.click(); }); const s3=c.str, w=c.wealth;
    m.querySelector('[data-ht="log"]').click(); const tabs=m.querySelectorAll('[data-ht]').length; m.querySelector('#hc-x').click();
    const pre=hcRankPre(); const m0=P.money; const notes=[]; hcSeasonEnd(notes,pre); const divd=P.money-m0;
    const saved=S.cstr&&S.cstr[c.id]===c.str; r.hc={home:c.id,s0,s1,s2,s3,own,sh,w,tabs,divd,note:notes[0]||'',log:S.hc.log.length,saved,cap:hcCap(c),val:hcVal(c)}; }
  // ⑧ 역오퍼: 이적시장 · 고향팀 가능성 · 3번 제한 · 수락 시 제안 추가
  { const P=S.player; P.age=33; S.contractEnd=S.season; S.offers=[]; S.offersFor=null; S.win={k:'winter',s:S.season,until:S.round+2}; S.rev=null; const home=CLUBS[S.homeClub];
    const eHome=revEval(home,1).p; const big=Object.values(CLUBS).filter(c=>!c.nat&&divOf(c.id)).sort((a,b2)=>b2.str-a.str)[0]; const eBig=revEval(big,1);
    goKey('transfer'); const card=!!document.querySelector('.rv-c'); revModal(); const m=document.querySelector('.rv-m'); m.querySelector('[data-rt="home"]').click(); const hrow=m.querySelector(`[data-rc="${home.id}"]`); hrow&&hrow.click(); const dmN=m.querySelectorAll('[data-dm]').length;
    const res=revSend(home.id,0); const offered=(S.offers||[]).some(o=>o.clubId===home.id&&o.rev&&o.home); const dup=revSend(home.id,0);
    const others=Object.values(CLUBS).filter(c=>!c.nat&&c.id!==home.id&&c.id!==S.clubId&&divOf(c.id)).slice(0,5); others.forEach(c=>revSend(c.id,1)); const n=revState().n; m.remove();
    goKey('transfer'); const grid=document.querySelectorAll('.ofc').length; const pill=[...document.querySelectorAll('.ofc .pill')].some(x=>/고향팀/.test(x.textContent));
    S.contractEnd=S.season+2; S.rev=null; const fee=revEval(big,1);
    r.rev={eHome:+eHome.toFixed(2),eBig:+eBig.p.toFixed(2),bigWhy:eBig.why,card,dmN,ok:res&&res.ok,offered,dup:dup===null,n,grid,pill,feeWhy:fee.why.slice(0,20)}; S.offers=[]; S.offersFor=null; S.win=null; }
  // ⑨ 고향팀의 부름: 33세 FA면 시즌 끝 제안에 고향팀
  { const P=S.player; P.age=33; S.contractEnd=S.season; S.loan=null; const hc=hcHome(); if(S.clubId===hc.id){ S.clubId=Object.values(CLUBS).find(c=>!c.nat&&c.id!==hc.id&&divOf(c.id)).id; } const L=makeOffers(); r.call={home:L.some(o=>o.home&&o.clubId===hc.id),yrs:L.filter(o=>!o.renew).map(o=>o.years).slice(0,4)}; }
  // ⑩ 은퇴 투어 → 시즌 끝 은퇴식 · 레전드 등급
  { const P=S.player; P.age=34; S.farewell=null; S.round=3; goKey('home'); const fc=!!document.querySelector('.fw-c'); const bt=document.querySelector('#fw-go'); bt&&bt.click(); bt&&bt.click(); const fw=S.farewell===S.season;
    const notes=[]; lateTick({rating:7,goals:0,assists:0},{type:'league',home:true},notes,1,0); const rep0=P.rep;
    endSeasonFinish([]); const scr=!document.getElementById('screen-result').hidden; const lg=document.querySelector('.lg-c'); r.fw={fc,fw,fwN:S.fwN,screen:scr,legend:lg?lg.querySelector('h2').textContent:'',lines:lg?lg.querySelectorAll('.lg-l').length:0}; }
  draw=oDraw; return r; });
 console.log(JSON.stringify(R,null,1)); console.log('errs',JSON.stringify(er.slice(0,3))); await b.close(); })();
