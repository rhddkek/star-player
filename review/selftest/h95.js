eval(require('fs').readFileSync('hbase2.js','utf8'));
let seed=+(process.env.SEED||5); Math.random=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
const origP=passTo; const ps={n:0,sp:0,tt:0,ttN:0,ok:0}; let pend=null;
passTo=function(pl,t,o){ const r=origP.apply(this,arguments); const M=T.M; if(!M.ball.owner&&M.ball.lastKicker===pl&&!pl.isUser&&M.ball.z<0.5&&M.ball.vz<1){ ps.n++; ps.sp+=Math.hypot(M.ball.vx,M.ball.vy); pend={t0:M.t,team:pl.team}; } return r; };
T.S.player.equip=[null,null,null,null]; const NM=+(process.env.NM||4); const gk={catch:0,holdSum:0,holdN:0,saves:{}}; const df={n:0,c8:0,c15:0,max8:0,chase:0}; let shots=[0,0],goals=[0,0],gkOwn=null,gkT=0;
for(let m=0;m<NM;m++){ T.startMatch(false); const M=T.M; M.paused=false; let now=Date.now(),hold=0,fr=0;
  while(T.M&&!T.M.over){ now+=33; const u=M.user,b=M.ball;
    if(b.owner===u){ T.input.jx=(34-u.x)*0.05;T.input.jy=-1; if(u.y<26&&!T.input.shotHold&&Math.random()<0.1){T.input.shotHold=true;hold=8;} else if(Math.random()<0.02&&!T.input.passHold){T.input.passHold=true;hold=3;} }
    else { const dx=b.x-u.x,dy=b.y-u.y-4,d=Math.hypot(dx,dy)||1; T.input.jx=dx/d; T.input.jy=dy/d; }
    if(T.input.shotHold||T.input.passHold){ hold--; if(hold<=0){ if(T.input.shotHold) T.input.shotRelease=true; if(T.input.passHold) T.input.passRelease=true; } }
    T.input.joyActive=true; const prevOwn=b.owner, prevLK=b.lastKicker; T.loop(now); fr++;
    const o=M.ball.owner;
    if(o&&o.role==='GK'&&prevOwn!==o&&prevLK&&prevLK.team!==o.team&&!M.setPiece){ gk.catch++; gkOwn=o; gkT=M.t; }
    if(gkOwn&&o!==gkOwn){ gk.holdSum+=M.t-gkT; gk.holdN++; gkOwn=null; }
    if(pend&&o){ if(o.team===pend.team) { ps.ok++; ps.tt+=M.t-pend.t0; ps.ttN++; } pend=null; }
    if(fr%5===0&&o&&o.team===1&&!M.setPiece&&!(M.freeze>0)){ const mine=M.players.filter(q=>q.team===0&&q.role!=='GK'&&!q.isUser); const c8=mine.filter(q=>dist(q,o)<8).length, c15=mine.filter(q=>dist(q,o)<15).length; df.n++; df.c8+=c8; df.c15+=c15; if(c8>=4) df.max8++; df.chase+=mine.filter(q=>{ const v=Math.hypot(q.vx,q.vy); return v>3&&((o.x-q.x)*q.vx+(o.y-q.y)*q.vy)/(v*(dist(q,o)||1))>0.8&&dist(q,o)<25; }).length; }
  }
  for(let t=0;t<2;t++){ shots[t]+=M.tstats[t].shots; goals[t]+=M.score[t]; } Object.entries(M.saveKinds||{}).forEach(([k,v])=>gk.saves[k]=(gk.saves[k]||0)+v); }
const f=(a,b)=>+(a/Math.max(1,b)).toFixed(2);
console.log(process.env.SPJS||'sp.js',JSON.stringify({passSp:f(ps.sp,ps.n),passT:f(ps.tt,ps.ttN),cmp:Math.round(ps.ok/Math.max(1,ps.n)*100)+'%',passPM:f(ps.n,NM),gkCatchPM:f(gk.catch,NM),gkHold:f(gk.holdSum,gk.holdN),saves:gk.saves,def8:f(df.c8,df.n),def15:f(df.c15,df.n),swarm4:Math.round(df.max8/Math.max(1,df.n)*100)+'%',chasers:f(df.chase,df.n),shots,goals}));
