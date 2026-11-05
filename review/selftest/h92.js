eval(require('fs').readFileSync('hbase2.js','utf8'));
let seed=+(process.env.SEED||5); Math.random=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
T.S.player.equip=[null,null,null,null];
const res={n:0,opt:0,opt2:0,opt3:0,sd:0,so:0,fwdOpt:0,lost:0}; const SNAP=+(process.env.SNAP||30);
for(let m=0;m<2;m++){ T.startMatch(false); const M=T.M; M.paused=false; let now=Date.now(); let taken=0, nextT=8;
  while(T.M&&!T.M.over&&taken<SNAP){ now+=33; T.input.joyActive=false; T.loop(now);
    if(M.t>nextT&&!M.setPiece&&!(M.freeze>0)&&M.ball.owner&&M.ball.owner.team===0&&M.ball.owner.role!=='GK'){ nextT=M.t+6; taken++;
      const u=M.user, o=M.ball.owner; if(o!==u){ const ox=o.x, oy=o.y; u.x=ox; u.y=oy; o.x=ox+3; o.y=oy+2; } T.setOwner(u,{clean:true}); u.touchT=0; u.protT=3;
      for(let f=0;f<60;f++){ now+=33; T.input.joyActive=false; u.vx*=0.5; u.vy*=0.5; T.loop(now); if(M.ball.owner!==u) break; }
      if(M.ball.owner!==u){ res.lost++; continue; }
      const th=M.players.filter(q=>q.team===1); const opts=M.players.filter(q=>q.team===0&&q!==u&&q.role!=='GK'&&dist(q,u)>5&&dist(q,u)<30&&nearest(th,q)[1]>3&&laneRisk(u,q,th)<0.35);
      res.n++; res.opt+=opts.length; if(opts.length>=2) res.opt2++; if(opts.length>=3) res.opt3++; res.fwdOpt+=opts.filter(q=>q.y<u.y-3).length;
      const near=M.players.filter(q=>q.team===0&&!q.isUser&&q.role!=='GK').sort((a,c)=>dist(a,u)-dist(c,u)).slice(0,2); near.forEach(q=>{ res.sd+=dist(q,u)/2; res.so+=nearest(th,q)[1]/2; });
    } } }
console.log((process.env.SPJS||'sp.js').padEnd(12),JSON.stringify({n:res.n,optAvg:+(res.opt/res.n).toFixed(2),opt2:Math.round(res.opt2/res.n*100)+'%',opt3:Math.round(res.opt3/res.n*100)+'%',fwdOpt:+(res.fwdOpt/res.n).toFixed(2),nearDist:+(res.sd/res.n).toFixed(1),nearOpp:+(res.so/res.n).toFixed(1),lost:res.lost}));
