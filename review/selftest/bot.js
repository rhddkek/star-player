// 자체 테스트용 봇: 사람처럼 대충 플레이 (내 공이면 골문으로·가까우면 슛·압박이면 패스·스킬 사용, 상대 공이면 따라가기+태클)
function botStep(){ if(!M||M.over||M.paused||M.replay) return; const u=M.user,b=M.ball,g=goalOf(0); const has=b.owner===u, o=b.owner;
  const st=botStep.s||(botStep.s={hold:null,cool:0,tk:0,log:{sk:{},skFail:0,mpMin:999,mpMax:0,chaseGot:0,tackleTry:0,shotsTry:0,passTry:0,frames:0,stuckOwner:0}}); const L=st.log; L.frames++;
  st.cool-=1/30; st.tk-=1/30; L.mpMin=Math.min(L.mpMin,M.mp); L.mpMax=Math.max(L.mpMax,M.mp);
  if(st.hold){ st.hold.f--; if(st.hold.f<=0){ input[st.hold.k+'Release']=true; st.hold=null; } }
  let jx=0,jy=0; input.sprint=false; input.joyActive=true;
  if(has){ const gd=dist(u,g); const dx=g.x-u.x, dy=g.y-u.y, dl=Math.hypot(dx,dy)||1; jx=dx/dl+Math.sin(M.t*1.3)*0.35; jy=dy/dl; input.sprint=gd>18&&M.sta>30;
    const [,od]=nearest(M.players.filter(q=>q.team===1&&q.role!=='GK'),u);
    if(st.cool<=0&&!st.hold){ for(let i=0;i<4;i++){ const sk=SKILLS.find(s=>s.id===S.player.equip[i]); if(!sk||M.cds[i]>0||M.mp<skCost(sk).mp) continue; const ok=(sk.type==='shot'&&gd<25&&gd>8)||((sk.type==='dash'||sk.type==='roll')&&od<3.5&&gd>14)||(sk.type==='pass'&&gd>28&&Math.random()<0.05); if(ok){ const mp0=M.mp; input.sk[i]=true; st.cool=1.2; L.sk[sk.id]=(L.sk[sk.id]||0)+1; st.pendSk={id:sk.id,mp0,i}; break; } } }
    if(!st.hold&&st.cool<=0){ if(gd<21){ input.shotHold=true; st.hold={k:'shot',f:7}; st.cool=0.9; L.shotsTry++; } else if(od<2.3&&Math.random()<0.25){ input.passHold=true; st.hold={k:'pass',f:3}; st.cool=0.7; L.passTry++; } }
  } else if(o&&o.team===0){ jx=((u.x<W/2?W/2-10:W/2+10)-u.x)*0.08; jy=-1; input.sprint=M.sta>55&&(M.t%4)<2; if(!st.hold&&Math.random()<0.008){ input.shotHold=true; st.hold={k:'shot',f:2}; } }
  else { if(!st.hold||st.hold.k!=='shot'){ input.shotHold=true; st.hold={k:'shot',f:25}; } input.sprint=M.sta>40;
    if(o&&o.team===1&&dist(o,u)<1.8&&st.tk<=0){ input.passHold=true; input.passRelease=true; st.tk=1.0; L.tackleTry++; } }
  input.jx=clamp(jx,-1,1); input.jy=clamp(jy,-1,1);
  if(st.pendSk&&M.mp<st.pendSk.mp0-1){ st.pendSk=null; } }
