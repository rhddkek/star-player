// 팀 대형 분석: AI끼리 경기에서 폭·길이·수비 라인·지원 인원·볼 소유 시간 등을 재서 실제 축구 수치와 비교
const {chromium}=require('playwright'); const FILE=process.argv[2]; const N=+process.argv[3]||4; const ME=process.argv[4]||'kr-1-0', OPP=process.argv[5]||'kr-1-1';
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async([N,ME,OPP])=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  S.clubId=ME; Object.keys(S.player.stats).forEach(k=>S.player.stats[k]=CLUBS[ME].str);
  const A={}; const add=(k,v)=>{ const a=A[k]||(A[k]=[]); a.push(v); };
  let simT=0, passes=0, holdStart=null, holdOwner=null; const plen=[]; const spd=[];
  const oPT=passTo; passTo=function(pl,target){ const r=oPT.apply(this,arguments); if(M&&M.ball.lastKicker===pl&&!M.ball.owner){ passes++; plen.push(dist(pl,target)); add('패스 공 속도(m/s)',Math.hypot(M.ball.vx,M.ball.vy)); } return r; };
  for(let k=0;k<N;k++){ M=null; S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; const ev=nextEvent(); ev.opp=CLUBS[OPP]; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true; M.chanceReq=false; M.chance=null;
    const real=M.user; real.isUser=false; M.user={x:-60,y:-60,vx:0,vy:0,fx:0,fy:-1,team:0,i:99,role:'MF',isUser:true,st:{...real.st},hx:-60,hy:-60,ai:{},sta:1};
    const oFT=fullTime; let over=false; fullTime=function(){ over=true; M.over=true; }; let fr=0, t=performance.now(); const t0=M.t;
    while(!over&&fr<8000){ t+=33.3; lastT=t-33.3; try{ loop(t); }catch(e){ return {err:String(e.stack).slice(0,300)}; } fr++; if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay();
      const o=M.ball.owner; if(o!==holdOwner){ if(holdOwner&&holdStart!=null) add('한 선수가 공 잡고 있는 시간(초)',M.t-holdStart); holdOwner=o; holdStart=o?M.t:null; }
      if(fr%10||M.setPiece||M.freeze>0||!o||o.role==='GK') continue;
      M.players.forEach(q=>{ if(q.role!=='GK') spd.push(Math.hypot(q.vx,q.vy)); });
      for(const tm of [0,1]){ const ps=M.players.filter(q=>q.team===tm&&q.role!=='GK'&&!q.off&&q.x>-10); if(ps.length<8) continue; const att=o.team===tm; const xs=ps.map(q=>q.x), ys=ps.map(q=>q.y); const tag=att?'공격 팀 ':'수비 팀 ';
        add(tag+'폭(m)',Math.max(...xs)-Math.min(...xs)); add(tag+'길이(m)',Math.max(...ys)-Math.min(...ys));
        const ownGoalY=tm===0?H:0; const lineD=Math.min(...ps.map(q=>Math.abs(q.y-ownGoalY))); const ballD=Math.abs(M.ball.y-ownGoalY);
        if(!att){ add('수비 라인 높이(자기 골문에서 m) · 공이 '+(ballD>H*0.6?'상대 진영 깊숙이':ballD>H*0.4?'중앙':'우리 진영'),lineD); add('수비: 공 10m 안 수비수(명)',ps.filter(q=>dist(q,M.ball)<10).length); add('수비: 공보다 뒤(골문 쪽)에 있는 인원(명)',ps.filter(q=>Math.abs(q.y-ownGoalY)<ballD).length); }
        else { add('공격: 공 가진 선수 15m 안 동료(명)',ps.filter(q=>q!==o&&dist(q,o)<15).length); add('공격: 공보다 앞에 있는 동료(명)',ps.filter(q=>q!==o&&Math.abs(q.y-ownGoalY)>ballD+2).length); add('공격: 가장 가까운 동료까지(m)',Math.min(...ps.filter(q=>q!==o).map(q=>dist(q,o)))); const nn=ps.map(q=>Math.min(...ps.filter(r=>r!==q).map(r=>dist(q,r)))); add('공격: 선수 사이 평균 간격(m)',nn.reduce((a,b)=>a+b,0)/nn.length); add('공격: 양 측면 폭 활용(터치라인 12m 안 인원)',ps.filter(q=>q.x<12||q.x>W-12).length); }
      } }
    fullTime=oFT; simT+=M.t-t0; }
  const st=a=>{ const s=[...a].sort((x,y)=>x-y); const q=f=>s[Math.min(s.length-1,Math.floor(s.length*f))]; return `평균 ${(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1)} · 중간 ${q(0.5).toFixed(1)} · 10~90% ${q(0.1).toFixed(1)}~${q(0.9).toFixed(1)}`; };
  const out={W,H,'경기당 진행 시간(초)':Math.round(simT/N),'경기당 패스':Math.round(passes/N),'분당 패스':+(passes/(simT/60)).toFixed(1)}; Object.keys(A).sort().forEach(k=>out[k]=st(A[k])); out['패스 길이(m)']=st(plen); const ss=[...spd].sort((x,y)=>x-y); out['선수 속도(m/s)']=`평균 ${(spd.reduce((x,y)=>x+y,0)/spd.length).toFixed(1)} · 상위 5% ${ss[Math.floor(ss.length*0.95)].toFixed(1)} · 최고 ${ss[ss.length-1].toFixed(1)}`; return out; },[N,ME,OPP]);
 console.log(JSON.stringify(R,null,1)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
