const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+(process.argv[2]||'/home/claude/star-player/index.html')); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(400);
 const R=await p.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; banner=()=>{}; toast=()=>{};
  const r={}; let t=performance.now(); const step=n=>{ for(let f=0;f<n;f++){ t+=33.3; lastT=t-33.3; loop(t); M.freeze=0; M.setPiece=null; } };
  const start=()=>{ M=null; show('screen-hub'); renderHome.mode='play'; startMatch(false); { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.freeze=0; M.mp=999; M.mpMax=999; M.restart=null; M.setPiece=null; M.kickoffT=0; };
  S.player.equip=['pulse','magnet','boost','dragon']; S.player.skills=[...new Set([...(S.player.skills||[]),'pulse','magnet','boost','dragon','flare'])];
  // ① 파동: 상대 3명이 달려들 때 4초 동안 뺏기는지 (없을 때와 비교)
  const pulseRun=(use)=>{ let lost=0, hits=0; for(let k=0;k<8;k++){ start(); const u=M.user; u.x=34; u.y=50; u.vx=u.vy=0; setOwner(u,{clean:true}); const T1=M.players.filter(q=>q.team===1&&q.role!=='GK').slice(0,3); T1.forEach((q,i)=>{ q.x=34+(i-1)*5; q.y=44; q.vx=q.vy=0; q.st={...q.st,tackle:60,spd:56,str:58}; }); /* 빠르고 태클 좋은 수비 3명이 압박 */ M.players.filter(q=>q.team===1&&!T1.includes(q)&&q.role!=='GK').forEach(q=>{ q.x=5; q.y=95; });
      if(use){ M.cds=[0,0,0,0]; useSkill(0,true,0,0); } for(let f=0;f<120;f++){ t+=33.3; lastT=t-33.3; u.vx=0; u.vy=-4.5; u.y-=0.15; T1.forEach(q=>{ if((q.stun||0)>0) return; const dx=u.x-q.x, dy=u.y-q.y, d=Math.hypot(dx,dy)||1; if(d>0.9){ q.x+=dx/d*0.2; q.y+=dy/d*0.2; q.vx=dx/d*6; q.vy=dy/d*6; } }); /* 상대 성향과 상관없이 3명이 계속 달려듦 */ M.restart=null; loop(t); M.freeze=0; if(M.ball.owner&&M.ball.owner.team===1){ lost++; break; } } hits+=M.pulseN||0; } return {lost,hits}; };
  r.pulse={without:pulseRun(false),with:pulseRun(true)};
  // ② 마그넷
  { start(); const u=M.user; u.x=34; u.y=50; const o=M.players.find(q=>q.team===1&&q.role==='MF'); o.x=36.5; o.y=48; setOwner(o,{clean:true}); M.cds=[0,0,0,0]; useSkill(1,false,0,0); r.magnet={got:M.ball.owner===u}; }
  // ③ 제트
  { start(); const u=M.user; const v0=maxSpeed(u); M.cds=[0,0,0,0]; useSkill(2,false,0,0); r.boost={k:+(maxSpeed(u)/v0).toFixed(2),t:M.boostT}; }
  // ④ 드래곤: 22m, 앞에 수비 1명 · 10번
  { let goals=0, knocked=0; const oGS=goalScored; for(let k=0;k<10;k++){ start(); let got=false; goalScored=function(){ got=true; M.ball.vx=M.ball.vy=0; }; const u=M.user; u.x=34+(k%3-1)*3; u.y=22; const dq=M.players.find(q=>q.team===1&&q.role==='DF'); dq.x=u.x; dq.y=14; M.players.filter(q=>q.team===1&&q!==dq&&q.role!=='GK').forEach(q=>{ q.x=3; q.y=90; }); setOwner(u,{clean:true}); u.touchT=0; M.cds=[0,0,0,0]; M.ultN={}; useSkill(3,true,0,0); for(let f=0;f<60&&!got;f++){ t+=33.3; lastT=t-33.3; loop(t); M.freeze=0; } if(got) goals++; if(dq.dragT) knocked++; } goalScored=oGS; r.dragon={goals,knocked}; }
  // ⑤ 섬광
  { start(); S.player.equip=['flare','magnet','boost','dragon']; const u=M.user; u.x=34; u.y=14; const near=M.players.filter(q=>q.team===1&&q.role!=='GK').slice(0,3); near.forEach((q,i)=>{ q.x=30+i*4; q.y=12; }); M.cds=[0,0,0,0]; useSkill(0,false,0,0); const gk=M.players.find(q=>q.team===1&&q.role==='GK'); r.flare={stunned:near.filter(q=>q.stun>1).length,gkBlind:gk.blindUntil>M.t}; }
  // ⑥ 플레이 스타일: 침투형 스트라이커 + 특성
  { S.player.pos='FW'; S.player.level=21; S.player.arch={id:'runner',picks:[1,0,0]}; start(); const u=M.user; u.x=34; u.y=12; r.arch={shotErrBox:aMulC('shotErr',aShotCtx(u,10,{})),gkBox:aMulC('gkSave',['box']),pending:archPending(),fx:archFx().length}; S.player.arch={id:'runner',picks:[0,null,null]}; r.arch.pending2=archPending(); }
  // ⑧ 플레이 스타일 팝업: 요약 카드 → 팝업에서 스타일·특성 고르기
  { M=null; show('screen-hub'); S.player.pos='FW'; S.player.level=13; S.player.arch=null; S.player.money=1e5; goKey('player:stat'); const card=document.querySelector('.arch-card'); card&&card.click(); const m=document.querySelector('.ar-m'); const n3=m?m.querySelectorAll('[data-arch]').length:0; m&&m.querySelector('[data-arch="finisher"]').click(); const opn=m?m.querySelectorAll('.ar-op:not(:disabled)').length:0; m&&m.querySelector('[data-ap="1:0"]').click(); const lock=m?m.querySelectorAll('.ar-t.lock').length:0; const x=m&&m.querySelector('#ar-x'); x&&x.click(); r.ui={card:!!card,n3,opn,lock,arch:S.player.arch,closed:!document.querySelector('.ar-m')}; }
  // ⑨ v81 스킬 습득 레벨 고르게 · 강화 Lv.10
  { const p=S.player; p.level=30; p.money=1e7; S.introSk='none'; toast=()=>{}; if(!p.skills.includes('dash')) p.skills.push('dash'); p.skillUp=p.skillUp||{}; delete p.skillUp.dash; renderSkill.sel='dash'; goKey('skill'); let n=0;
    for(let i=0;i<12;i++){ const br=document.querySelector('[data-br="b"]'); if(br) br.click(); const u=document.querySelector('#sk-up'); if(!u||u.disabled) break; u.click(); n++; }
    const cnt={}; SKILLS.forEach(s=>cnt[s.lvl]=(cnt[s.lvl]||0)+1); const per=Object.values(cnt); const z=SKILLS.find(s=>s.id==='zone');
    r.sk81={n,lv:skLv('dash').lv,eff:skEff('dash'),maxPer:Math.max(...per),maxLvl:Math.max(...SKILLS.map(s=>s.lvl)),early:SKILLS.filter(s=>s.lvl<=5).length,zone10:skUpReq(z,9).lvl,priceMono:SKILLS.every(a=>SKILLS.every(b=>!(a.lvl<b.lvl&&!a.ult&&!b.ult&&a.price>b.price)))}; }
  // ⑦ 상점 목록에 새 스킬 · 아이콘
  r.skills=SKILLS.filter(s=>['pulse','magnet','boost','dragon','flare'].includes(s.id)).map(s=>s.id+':'+(ICO[s.id]!=null&&!!ART.icons[ICO[s.id]])+':'+(!!SK_PARAM[s.id]));
  return r; });
 console.log(JSON.stringify(R,null,1)); console.log('errs',JSON.stringify(er.slice(0,3))); await b.close(); })();
