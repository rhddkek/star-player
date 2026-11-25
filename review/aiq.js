// 경기 AI 축구다움 측정: AI끼리 N경기 — 패스 구성·성공률, 점유 사슬, 대형(폭·간격·라인), 공 주변 밀집, 압박, 지원 선택지
const {chromium}=require('playwright'); const FILE=process.argv[2]; const N=+process.argv[3]||6; const ME=process.argv[4]||'kr-1-0', OPP=process.argv[5]||'kr-1-1';
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); const er=[]; p.on('pageerror',e=>er.push(String(e.stack||e).slice(0,300)));
 await p.goto('file://'+FILE); await p.click('#go-create'); await p.click('#btn-new'); await p.waitForTimeout(300);
 const R=await p.evaluate(async([N,ME,OPP])=>{ proSkipAll(1); S.tutSeen=true; S.compIntro=false; S.noReplay=true; S.startLock=1; document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); draw=()=>{}; updateHUD=()=>{}; window.requestAnimationFrame=()=>0; renderResult=()=>{}; banner=()=>{}; toast=()=>{};
  S.clubId=ME; Object.keys(S.player.stats).forEach(k=>S.player.stats[k]=CLUBS[ME].str);
  const A={}; const rec=(k,ok)=>{ const a=A[k]||(A[k]={n:0,ok:0}); a.n++; if(ok) a.ok++; }; const SM={}; const smp=(k,v)=>{ const a=SM[k]||(SM[k]={n:0,s:0}); a.n++; a.s+=v; }; const CNT={}; const cnt=(k,v=1)=>CNT[k]=(CNT[k]||0)+v;
  let pend=null, chain=0, lastOwnTeam=null, lastOwner=null, shotPend=null;
  const endPoss=(why)=>{ if(lastOwnTeam==null) return; cnt('poss'); cnt('chain',chain); cnt('end_'+why); if(chain>=5) cnt('chain5+'); chain=0; };
  const oPT=passTo; passTo=function(pl,target,opts={}){ const r=oPT.apply(this,arguments); if(M&&M.ball.lastKicker===pl&&!M.ball.owner){ const d=dist(pl,target); const kind=opts.thru||M.ball.thru?'thru':M.ball.longP||d>28?'long':d>14?'mid':'short'; const fwd=(pl.team===0?pl.y-target.y:target.y-pl.y); const st=(new Error().stack.split('\n')[2]||'').trim().replace(/\(.*:(\d+):\d+\)/,'L$1').replace(/^at /,'').slice(0,40); const src=(M.setPiece?'SP:':'')+st; pend={team:pl.team,kind,t:M.t,pl,d,fwd,src,fx:pl.x,fy:pl.y,tg:target,tx:target.x,ty:target.y,risk:laneRisk(pl,target,M.players.filter(o=>o.team!==pl.team))}; cnt('pass'); cnt('src_'+kind+'|'+src); cnt('k_'+kind); smp('passD',d); smp('passFwd',fwd); } return r; };
  const oTB=throughBall; throughBall=function(pl,q){ const r=oTB.apply(this,arguments); if(M&&!M.ball.owner&&M.ball.lastKicker===pl){ pend={team:pl.team,kind:'thru',t:M.t,pl,d:dist(pl,q),fwd:10}; cnt('pass'); cnt('k_thru'); } return r; };
  const oSh=shoot; shoot=function(pl){ if(M&&pl){ cnt('shot'+pl.team); smp('shotD',dist(pl,goalOf(pl.team))); shotPend=pl.team; } return oSh.apply(this,arguments); };
  const oSO=setOwner; setOwner=function(q){ if(q&&M){ const prevOwner=M.ball.owner;
      if(pend&&q!==pend.pl){ const ok=q.team===pend.team; rec(pend.kind,ok); rec('all',ok); if(pend.risk!=null) rec('risk'+(pend.risk<0.2?'<.2':pend.risk<0.5?'<.5':'>.5'),ok); if(!ok&&(pend.kind==='mid'||pend.kind==='short')&&pend.tx!=null){ const vx=pend.tx-pend.fx, vy=pend.ty-pend.fy, L=Math.hypot(vx,vy)||1; const tt=((M.ball.x-pend.fx)*vx+(M.ball.y-pend.fy)*vy)/(L*L); cnt('F_'+pend.kind+'_'+(tt<0.3?'nearPasser':tt<0.8?'lane':tt<1.15?'atTarget':'beyond')); cnt('F_dt_'+(M.t-pend.t<0.5?'<.5':M.t-pend.t<1.2?'<1.2':'>1.2')); } if(pend.src) rec('S|'+pend.kind+'|'+pend.src,ok); if(ok) chain++; pend=null; }
      if(lastOwnTeam!=null&&q.team!==lastOwnTeam){ const why=shotPend===lastOwnTeam?'shot':prevOwner&&prevOwner.team!==q.team?'tackle':'loose/int'; endPoss(why); }
      if(q.team===lastOwnTeam&&prevOwner==null&&!pend) {} shotPend=null; lastOwnTeam=q.team; lastOwner=q; }
    return oSO.apply(this,arguments); };
  const shots=[0,0], goals=[0,0]; let t=performance.now();
  for(let k=0;k<N;k++){ M=null; S.trust=95; S.sel=null; show('screen-hub'); renderHome.mode='play'; const ev=nextEvent(); ev.opp=CLUBS[OPP]; const oNE=nextEvent; nextEvent=()=>ev; startMatch(false); nextEvent=oNE; { const g=el('lu-go'); if(g) g.click(); } el('m-overlay').hidden=true; M.paused=false; M.introT=0; M.botUser=true; M.chanceReq=false; M.chance=null;
    const real=M.user; real.isUser=false; M.user={x:-60,y:-60,vx:0,vy:0,fx:0,fy:-1,team:0,i:99,role:'MF',isUser:true,st:{...real.st},hx:-60,hy:-60,ai:{},sta:1};
    lastOwnTeam=null; chain=0; pend=null;
    const oOOB=outOfBounds; outOfBounds=function(){ if(pend){ rec(pend.kind,false); rec('all',false); cnt('passOut'); pend=null; } if(lastOwnTeam!=null){ endPoss(shotPend===lastOwnTeam?'shot':'out'); lastOwnTeam=null; } return oOOB.apply(this,arguments); }; const oFT=fullTime; let over=false; fullTime=function(){ over=true; M.over=true; }; let fr=0;
    while(!over&&fr<8000){ t+=33.3; lastT=t-33.3; try{ loop(t); }catch(e){ return {err:String(e.stack).slice(0,300)}; } fr++; if(M.htWait>0) M.htWait=0; if(M.paused){ M.paused=false; el('m-overlay').hidden=true; } if(M.replay) endReplay(); pend&&M.t-pend.t>5&&(pend=null);
      if(fr%10===0&&!M.setPiece&&!(M.freeze>0)){ const bl=M.ball, own=bl.owner; const F=[0,1].map(tm=>M.players.filter(q=>q.team===tm&&q.role!=='GK'&&!q.sentOff&&q!==M.user));
        smp('near10',M.players.filter(q=>q!==M.user&&q.role!=='GK'&&Math.hypot(q.x-bl.x,q.y-bl.y)<10).length);
        if(!own) cnt('looseS'); cnt('allS');
        if(own&&own.role!=='GK'){ const T=own.team, O=1-T, dir=T===0?-1:1; const xs=F[T].map(q=>q.x), ys=F[T].map(q=>q.y); smp('attW',Math.max(...xs)-Math.min(...xs)); smp('attD',Math.max(...ys)-Math.min(...ys));
          const oy=F[O].map(q=>q.y), ox=F[O].map(q=>q.x); smp('defD',Math.max(...oy)-Math.min(...oy)); smp('defW',Math.max(...ox)-Math.min(...ox));
          const dl=F[O].slice().sort((a,c)=>O===0?c.y-a.y:a.y-c.y); smp('defLineFromGoal',O===0?H-dl[0].y:dl[0].y);
          smp('press4',F[O].filter(q=>dist(q,own)<4).length); const th=M.players.filter(q=>q.team===O);
          const opts=F[T].filter(q=>q!==own&&dist(q,own)<26&&laneRisk(own,q,th)<0.35); smp('openOpt',opts.length); smp('fwdOpt',opts.filter(q=>(q.y-own.y)*dir>4).length);
          smp('ahead',F[T].filter(q=>(q.y-own.y)*dir>3).length); } } }
    fullTime=oFT; outOfBounds=oOOB; shots[0]+=M.tstats[0].shots; shots[1]+=M.tstats[1].shots; goals[0]+=M.score[0]; goals[1]+=M.score[1]; cnt('dur',M.t); }
  const out={}; out.src={}; Object.keys(A).filter(k=>k.startsWith('S|')).sort((a,c)=>A[c].n-A[a].n).slice(0,16).forEach(k=>out.src[k]=Math.round(A[k].ok/A[k].n*100)+'% n'+(A[k].n/N).toFixed(1)); Object.keys(A).filter(k=>k.startsWith('S|')).forEach(k=>delete A[k]); out.passSucc={}; Object.keys(A).forEach(k=>out.passSucc[k]=Math.round(A[k].ok/A[k].n*100)+'% n'+(A[k].n/N).toFixed(1));
  const P=CNT.pass||1; out.mix={}; ['short','mid','long','thru'].forEach(k=>out.mix[k]=Math.round((CNT['k_'+k]||0)/P*100)+'%');
  out.perMatch={pass:+(P/N).toFixed(1),poss:+((CNT.poss||0)/N).toFixed(1),passPerPoss:+((CNT.chain||0)/(CNT.poss||1)).toFixed(2),chain5:Math.round((CNT['chain5+']||0)/(CNT.poss||1)*100)+'%',shots:shots.map(x=>(x/N).toFixed(1)),goals:goals.map(x=>(x/N).toFixed(2)),durSec:+((CNT.dur||0)/N).toFixed(0)};
  out.fail={}; Object.keys(CNT).filter(k=>k.startsWith('F_')).forEach(k=>out.fail[k]=+(CNT[k]/N).toFixed(1)); out.ends={}; Object.keys(CNT).filter(k=>k.startsWith('end_')).forEach(k=>out.ends[k.slice(4)]=Math.round(CNT[k]/(CNT.poss||1)*100)+'%');
  out.shape={}; Object.keys(SM).forEach(k=>out.shape[k]=+(SM[k].s/SM[k].n).toFixed(2)); out.shape.loose=Math.round((CNT.looseS||0)/(CNT.allS||1)*100)+'%';
  return out; },[N,ME,OPP]);
 console.log(JSON.stringify(R,null,1)); console.log('errs',JSON.stringify(er.slice(0,2))); await b.close(); })();
