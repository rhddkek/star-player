eval(require('fs').readFileSync('hbase2.js','utf8'));
let seed=+(process.env.SEED||5); Math.random=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
const ex={uFrames:0,uOpt:0,uOpt2:0,uRuns:0,uPoss:0,aiDribLoss:0,aiPoss:0,dShots:0,stale:0,cOpt:0,cFrames:0}; let lastOwner=null, fr=0; const st={pass:0,ok:0,prog:0,progOk:0,switch:0,oneT:0,thru:0,thruOk:0,hold:[],back:0,pingpong:0,toUser:0,toUserOk:0,lineBreak:0,lbOk:0}; let pend=null; let lastFrom=new Map();
const origP=passTo, origT=throughBall;
function rec(pl,t,kind){ const M=T.M; if(pl.isUser) return; const dir=pl.team===0?-1:1; const gain=(t.y-pl.y)*dir; const lat=Math.abs(t.x-pl.x); const held=M.t-(pl.gotT||M.t);
  const theirs=M.players.filter(q=>q.team!==pl.team&&q.role!=='GK'); const lb=theirs.filter(q=>(q.y-pl.y)*dir>1&&(t.y-q.y)*dir>1).length;
  pend={team:pl.team,gain,lat,kind,toUser:t.isUser,lb,pp:lastFrom.get(pl)===t}; st.pass++; if(gain>8) st.prog++; if(gain<-6) st.back++; if(lat>25) st.switch++; if(held<0.35) st.oneT++; st.hold.push(held); if(kind==='thru') st.thru++; if(t.isUser) st.toUser++; if(lb>=2) st.lineBreak++; if(pend.pp) st.pingpong++; lastFrom.set(t,pl); }
passTo=function(pl,t,o){ const r=origP.apply(this,arguments); if(!T.M.ball.owner&&T.M.ball.lastKicker===pl) rec(pl,t,'pass'); return r; };
throughBall=function(pl,q,pw){ const r=origT.apply(this,arguments); rec(pl,q,'thru'); return r; };
T.S.player.equip=[null,null,null,null]; const NM=+(process.env.NM||4); let shots=[0,0],goals=[0,0];
for(let m=0;m<NM;m++){ T.startMatch(false); const M=T.M; M.paused=false; let now=Date.now(),hold=0;
  while(T.M&&!T.M.over){ now+=33; const u=M.user,b=M.ball;
    if(b.owner===u){ T.input.jx=(34-u.x)*0.05;T.input.jy=-1; if(u.y<26&&!T.input.shotHold&&Math.random()<0.1){T.input.shotHold=true;hold=8;} else if(Math.random()<0.02&&!T.input.passHold){T.input.passHold=true;hold=3;} }
    else if(!b.owner&&b.passTarget===u&&(b.z>1||b.vz>2)&&typeof landPt==="function"){ const L=landPt(b); const dx=L.x-u.x,dy=L.y-u.y,d=Math.hypot(dx,dy)||1; T.input.jx=d>0.5?dx/d:0; T.input.jy=d>0.5?dy/d:0; } else { const dx=b.x-u.x,dy=b.y-u.y-4,d=Math.hypot(dx,dy)||1; T.input.jx=dx/d; T.input.jy=dy/d; }
    if(T.input.shotHold||T.input.passHold){ hold--; if(hold<=0){ if(T.input.shotHold) T.input.shotRelease=true; if(T.input.passHold) T.input.passRelease=true; } }
    T.input.joyActive=true; const runsBefore=M.players.filter(q=>q.team===0&&q.runT>M.t).length; T.loop(now); fr++;
    { const o=M.ball.owner; if(o!==lastOwner){ if(lastOwner&&lastOwner.team===0&&!lastOwner.isUser&&o&&o.team===1&&M.ball.lastKicker!==lastOwner) ex.aiDribLoss++; if(o&&o.team===0&&!o.isUser) ex.aiPoss++; if(o===M.user) ex.uPoss++; lastOwner=o; }
      if(fr%5===0&&o&&o.team===0){ const th=M.players.filter(q=>q.team===1); const opts=M.players.filter(q=>q.team===0&&q!==o&&q.role!=='GK'&&dist(q,o)>5&&dist(q,o)<30&&nearest(th,q)[1]>3&&laneRisk(o,q,th)<0.35).length; if(o===M.user){ ex.uFrames++; ex.uOpt+=opts; if(opts>=2) ex.uOpt2++; } else { ex.cFrames++; ex.cOpt+=opts; } }
      if(o===M.user){ const rn=M.players.filter(q=>q.team===0&&q.runT>M.t).length; if(rn>runsBefore) ex.uRuns++; } }
    if(pend&&b.owner){ const ok=b.owner.team===pend.team; if(ok){ st.ok++; if(pend.gain>8) st.progOk++; if(pend.kind==='thru') st.thruOk++; if(pend.toUser) st.toUserOk++; if(pend.lb>=2) st.lbOk++; } pend=null; } else if(pend&&M.freeze>0) pend=null; }
  for(let t=0;t<2;t++){ shots[t]+=M.tstats[t].shots; goals[t]+=M.score[t]; } }
const hs=st.hold.slice().sort((a,b)=>a-b); const pct=(a,b)=>Math.round(a/Math.max(1,b)*100)+'%';
console.log(process.env.SPJS||'sp.js',JSON.stringify({userOptAvg:+(ex.uOpt/Math.max(1,ex.uFrames)).toFixed(2),userOpt2:pct(ex.uOpt2,ex.uFrames),userRunsPerPoss:+(ex.uRuns/Math.max(1,ex.uPoss)).toFixed(2),aiOptAvg:+(ex.cOpt/Math.max(1,ex.cFrames)).toFixed(2),dribLossPerPoss:pct(ex.aiDribLoss,ex.aiPoss),perMatch:+(st.pass/NM).toFixed(0),cmp:pct(st.ok,st.pass),progressive:pct(st.prog,st.pass),progCmp:pct(st.progOk,st.prog),lineBreak2:pct(st.lineBreak,st.pass),lbCmp:pct(st.lbOk,st.lineBreak),back:pct(st.back,st.pass),switch:st.switch,oneTouch:pct(st.oneT,st.pass),medHold:+hs[hs.length>>1].toFixed(2),thru:st.thru,thruCmp:pct(st.thruOk,st.thru),toUser:st.toUser,toUserCmp:pct(st.toUserOk,st.toUser),pingpong:pct(st.pingpong,st.pass),shots,goals}));
