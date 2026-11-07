// 손맛 측정: node feel.js <file url> <old|new>
const {chromium}=require('playwright');
const URL=process.argv[2], MODE=process.argv[3]||'new'; const ONLY=(process.argv[4]||'').split(',').filter(Boolean); const on=k=>!ONLY.length||ONLY.includes(k);
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:430,height:900}}); const pg=await ctx.newPage();
 const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto(URL); await pg.waitForTimeout(500);
 if(await pg.$('#go-create')) await pg.click('#go-create'); await pg.click('#btn-new'); await pg.waitForTimeout(300);
 await pg.evaluate(()=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; for(let i=0;i<4;i++) autoMatch(true); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); });
 const helpers=`window.wait=ms=>new Promise(r=>setTimeout(r,ms)); window.untilT=(cond,max)=>new Promise(r=>{ const t0=M.t; const f=()=>{ const v=cond(); if(v!=null&&v!==false) r({v,t:M.t-t0}); else if(M.t-t0>max) r({v:null,t:max}); else requestAnimationFrame(f); }; f(); });
   window.startPr=async(sty)=>{ if(M){ cancelAnimationFrame(raf); M=null; } if(sty&&typeof PR_A10!=='undefined') PR_A10=sty; startPractice(null); await wait(400); el('m-overlay').hidden=true; M.paused=false; lastT=performance.now(); await wait(300); };
   window.clearOpp=()=>{ M.players.filter(q=>q.team===1&&q.role!=='GK').forEach(q=>{ q.x=-40; q.y=-40; q.vx=q.vy=0; q.stun=99; }); };
   window.joy=(x,y)=>{ input.joyActive=true; input.jx=x; input.jy=y; };`;
 await pg.evaluate(helpers);
 const R={};
 // A. 방향 전환
 if(on('turn')) R.turn=await pg.evaluate(async()=>{ await startPr(); const out={rev:[],cut:[],cutDisp:[]}; for(let k=0;k<6;k++){ const withBall=k%2===0; clearOpp(); const u=M.user; const mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); if(mate){ mate.x=3; mate.y=100; }
     u.x=W/2; u.y=70; u.stun=0; u.protT=9; if(withBall) setOwner(u,{clean:true}); else { M.ball.owner=null; M.ball.x=2; M.ball.y=100; M.ball.vx=M.ball.vy=0; }
     joy(0,-1); await wait(700); const ms=Math.hypot(u.vx,u.vy); joy(0,1); const r1=await untilT(()=>u.vy>0.5*ms,2); out.rev.push(r1.t);
     u.x=W/2; u.y=70; joy(0,-1); await wait(700); const x0=u.x; joy(1,0); const r2=await untilT(()=>u.vx>0.5*ms,2); out.cut.push(r2.t); await wait(Math.max(0,300-r2.t*1000)); out.cutDisp.push(u.x-x0); }
   joy(0,0); const avg=a=>Math.round(a.reduce((s,x)=>s+x,0)/a.length*1000)/1000; return {reverse_s:avg(out.rev),cut90_s:avg(out.cut),side_m_after_0_3s:avg(out.cutDisp.map(v=>v))}; });
 // B. 누른 방향 패스
 if(on('pass')) R.pass=await pg.evaluate(async()=>{ const u=M.user; let hit=0,n=0,hitOpp=0,nOpp=0; const mates=M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK'); const opp=M.players.filter(q=>q.team===1&&q.role!=='GK');
   // 연습장 인원은 적으니 가상 동료 4명을 붙였다 떼며 측정
   const fake=[]; for(let i=0;i<4;i++){ const q={...mates[0],i:90+i,isUser:false,team:0,role:'MF',vx:0,vy:0,st:mates[0].st,ai:{}}; fake.push(q); } M.players.push(...fake); const all=[mates[0],...fake];
   for(let t=0;t<300;t++){ u.x=W/2; u.y=50; all.forEach(q=>{ const a=Math.random()*Math.PI*2, r=8+Math.random()*22; q.x=clamp(u.x+Math.cos(a)*r,1,W-1); q.y=clamp(u.y+Math.sin(a)*r,1,H-1); });
     const withOpp=t>=150; opp.forEach(q=>{ if(withOpp){ const m=all[Math.floor(Math.random()*all.length)]; q.x=m.x+(Math.random()-0.5)*4; q.y=m.y+(Math.random()-0.5)*4; q.stun=0; } else { q.x=-40; q.y=-40; } });
     const tg=all[Math.floor(Math.random()*all.length)]; const dx=tg.x-u.x, dy=tg.y-u.y, l=Math.hypot(dx,dy); const j=(Math.random()-0.5)*0.3; const ca=Math.cos(j), sa=Math.sin(j); const jx=(dx*ca-dy*sa)/l, jy=(dx*sa+dy*ca)/l;
     // 그 방향에 더 가까운 각도의 동료가 있으면 정답이 모호 → 제외
     const angOf=q=>Math.acos(clamp(((q.x-u.x)*jx+(q.y-u.y)*jy)/Math.hypot(q.x-u.x,q.y-u.y),-1,1)); if(all.some(q=>q!==tg&&angOf(q)<angOf(tg)+0.25)) { t--; continue; }
     const p=pickPassTarget(u,jx,jy); if(withOpp){ nOpp++; if(p===tg) hitOpp++; } else { n++; if(p===tg) hit++; } }
   M.players=M.players.filter(q=>!fake.includes(q)); return {aim_hit_pct:Math.round(hit/n*100),aim_hit_with_defenders_pct:Math.round(hitOpp/nOpp*100)}; });
 // C. 원투: 패스하고 바로 앞으로 뛰기
 if(on('onetwo')) R.onetwo=await pg.evaluate(async(MODE)=>{ let ok=0,n=0; for(let k=0;k<14;k++){ await startPr(MODE==='new'?'press':null); const u=M.user; const mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); const defs=M.players.filter(q=>q.team===1&&q.role!=='GK');
     u.x=W/2; u.y=34; u.vx=u.vy=0; u.fx=0; u.fy=-1; setOwner(u,{clean:true}); u.protT=1; mate.x=W/2+9; mate.y=31; mate.vx=mate.vy=0; defs.forEach((q,i)=>{ q.stun=0; q.x=W/2+(i?-6:1.5); q.y=i?18:30; q.vx=q.vy=0; }); if(M.a10&&M.a10.cur) M.a10.cur.t0=M.t;
     await wait(250); joy(1,-0.2); input.passHold=true; await wait(120); input.passRelease=true; await wait(60); joy(0,-1); input.sprint=true; const y0=u.y;
     const r=await untilT(()=>M.ball.owner===u&&u.y<y0-5?1:(M.ball.owner&&M.ball.owner.team===1?-1:null),3.2); input.sprint=false; joy(0,0); n++; if(r.v===1) ok++; }
   let ok2=0,n2=0; for(let k=0;k<12;k++){ await startPr(MODE==='new'?'drop':null); const u=M.user; const mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); const defs=M.players.filter(q=>q.team===1&&q.role!=='GK');
     u.x=W/2-3; u.y=40; u.vx=u.vy=0; u.fx=0; u.fy=-1; setOwner(u,{clean:true}); u.protT=1; mate.x=W/2+6; mate.y=37; mate.vx=mate.vy=0; defs.forEach((q,i)=>{ q.stun=0; q.x=W/2+(i?-10:-8); q.y=i?14:22; q.vx=q.vy=0; }); if(M.a10&&M.a10.cur) M.a10.cur.t0=M.t;
     await wait(250); joy(1,-0.3); input.passHold=true; await wait(120); input.passRelease=true; await wait(60); joy(0,-1); input.sprint=true; const y0=u.y;
     const r=await untilT(()=>M.ball.owner===u&&u.y<y0-5?1:null,3.2); input.sprint=false; joy(0,0); n2++; if(r.v===1) ok2++; }
   return {pressed_return_pct:Math.round(ok/n*100),open_space_return_pct:Math.round(ok2/n2*100)}; },MODE);
 // E. 슛: 멈춰서 vs 질주
 if(on('shot')) R.shot=await pg.evaluate(async()=>{ await startPr(); const u=M.user; const gk=M.players.find(q=>q.team===1&&q.role==='GK'); const res={settled:[0,0],sprint:[0,0]};
   for(let k=0;k<60;k++){ const sprint=k%2===1; clearOpp(); gk.x=-30; gk.y=-30; gk.stun=99; const mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); if(mate){ mate.x=2; mate.y=90; }
     u.x=W/2+(Math.random()-0.5)*6; u.y=19; u.fx=0; u.fy=-1; u.vx=0; u.vy=sprint?-13:0; setOwner(u,{clean:true}); u.touchT=0; u.protT=5; M.sprinting=sprint; input.sprint=sprint; joy(0,sprint?-1:0);
     shoot(u,W/2+(Math.random()-0.5)*4,0,{power:0.75}); input.sprint=false; joy(0,0);
     const r=await untilT(()=>{ const b=M.ball; if(b.y<=0.3) return Math.abs(b.x-W/2)<GOAL_W/2&&b.z<2.44?1:2; if(M.score&&M.freeze>0) return 1; return null; },2.5); const key=sprint?'sprint':'settled'; res[key][1]++; if(r.v===1) res[key][0]++; M.freeze=0; M.restart=null; }
   return {settled_on_target_pct:Math.round(res.settled[0]/res.settled[1]*100),sprint_on_target_pct:Math.round(res.sprint[0]/res.sprint[1]*100)}; });
 if(MODE==='new'&&on('new')){
   // D. 태클 헛발: 반응하면 제칠 수 있는가
   R.lunge=await pg.evaluate(async()=>{ const out={}; for(const bot of ['그대로 직진','태클 보고 옆으로']){ let st=0,esc=0,n=0; await startPr('press');
       for(let k=0;k<12;k++){ const u=M.user; const defs=M.players.filter(q=>q.team===1&&q.role!=='GK'); defs.forEach((q,i)=>{ q.lunge=null; q.lungeCd=0; q.stun=i?99:0; q.x=i?-40:W/2; q.y=i?-40:u.y-6; q.jkT=0; }); const mate=M.players.find(q=>q.team===0&&!q.isUser&&q.role!=='GK'); if(mate){ mate.x=3; mate.y=95; }
         u.x=W/2; u.y=40; u.vx=u.vy=0; setOwner(u,{clean:true}); u.protT=0; u.stun=0; if(M.a10&&M.a10.cur) M.a10.cur.t0=M.t+99; joy(0,-0.55); const d=defs[0]; d.x=W/2; d.y=u.y-6;
         const w=await untilT(()=>d.lunge&&d.lunge.ph==='wind'?1:null,3); if(!w.v){ continue; } n++; if(bot!=='그대로 직진'){ const s=Math.random()<0.5?1:-1; joy(s,-0.15); }
         const r=await untilT(()=>M.ball.owner===d?-1:(d.lunge&&d.lunge.ph==='rec'&&d.lunge.told)?1:(!d.lunge&&M.ball.owner===u)?1:null,1.6); if(r.v===-1) st++; else esc++; joy(0,0); await wait(150); }
       out[bot]={lunges:n,stolen_pct:Math.round(st/Math.max(1,n)*100)}; } return out; });
   // F. 슛 블록 / G. 수비 성향 차이
   R.styles=await pg.evaluate(async()=>{ const out={}; for(const sty of ['press','drop','narrow']){ await startPr(sty); const u=M.user; let dSum=0,dN=0,lunges=0,spread=0,sN=0,depth=0; const seen=new Set();
       for(let r=0;r<3;r++){ practiceReset(); await wait(450); const t0=M.t; joy(0,-0.6); while(M.t-t0<4){ await wait(100); if(M.ball.owner!==u) break; const defs=M.players.filter(q=>q.team===1&&q.role!=='GK'); const [,od]=nearest(defs,u); dSum+=od; dN++; defs.forEach(q=>{ if(q.lunge&&!seen.has(q.lunge)){ seen.add(q.lunge); lunges++; } }); if(defs.length===2){ spread+=Math.abs(defs[0].x-W/2)+Math.abs(defs[1].x-W/2); depth+=Math.min(defs[0].y,defs[1].y); sN++; } } joy(0,0); }
       // 정면 슛 블록률
       let blk=0; for(let k=0;k<16;k++){ practiceReset(); await wait(200); const defs=M.players.filter(q=>q.team===1&&q.role!=='GK'); u.x=W/2; u.y=22; u.vx=u.vy=0; u.fx=0; u.fy=-1; setOwner(u,{clean:true}); u.touchT=0; defs[0].x=W/2; defs[0].y=u.y-3; defs[0].stun=0; defs[0].lunge=null; defs[1].x=-40; defs[1].y=-40; const b0=(M.stats.blocked||0); shoot(u,W/2,0,{power:0.7}); await wait(500); if((M.stats.blocked||0)>b0) blk++; M.freeze=0; }
       out[sty]={nearest_def_m:+(dSum/Math.max(1,dN)).toFixed(2),lunges_per_10s:+(lunges/(3*4)*10).toFixed(1),def_center_offset_m:+(spread/Math.max(1,sN)/2).toFixed(1),front_shot_blocked_pct:Math.round(blk/16*100)}; } return out; });
   // H. 10초 공격 한 세트(자동) 진행 확인
   R.a10=await pg.evaluate(async()=>{ await startPr('narrow'); for(let i=0;i<10;i++){ M.a10.cur.res='실패'; practiceReset(); await wait(60); } await wait(200); return {done:!!M.a10.done,log:M.a10.log.length,overlay:!el('m-overlay').hidden&&/10초 공격 결과/.test(el('m-overlay').textContent)}; });
 }
 R.errs=errs.slice(0,5); console.log(JSON.stringify(R,null,1)); await b.close(); })();
