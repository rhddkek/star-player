const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/selftest/';
const log=(...a)=>console.log(a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '));
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>{ errs.push(e.message); log('PAGEERROR',e.message); });
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(700); await pg.click('#cut-skip'); await pg.waitForTimeout(2200); await pg.screenshot({path:D+'60_warm.png'});
  log('워밍업',await pg.evaluate(()=>({chal:M.chal&&M.chal.id,sct:el('sc-t').textContent,objs:el('objs').textContent,owner:M.ball.owner&&(M.ball.owner.isUser?'me':'mate'),banner:el('m-overlay').hidden})));
  // 골 시뮬 → 완료 오버레이
  await pg.evaluate(()=>{ M.freeze=0; M.paused=false; M.players.filter(q=>q.team===1).forEach(q=>{ q.x=5; q.y=50; q.catchT=0; }); const u=M.user,b=M.ball; b.owner=null; u.x=W/2; u.y=8; b.x=W/2; b.y=1; b.vx=0; b.vy=-30; b.z=0.2; b.lastKicker=u; b.isShot=true; }); await pg.waitForTimeout(1800); await pg.screenshot({path:D+'61_warm_done.png'});
  log('워밍업 완료',await pg.evaluate(()=>el('m-overlay').textContent.replace(/\s+/g,' ').slice(0,120)));
  await pg.click('#wm-go'); await pg.waitForTimeout(900); await pg.screenshot({path:D+'62_tut3.png'}); log('결승 안내',await pg.evaluate(()=>({pro:M&&M.ev.pro,ov:el('m-overlay').textContent.replace(/\s+/g,' ').slice(0,200)})));
  await pg.evaluate(()=>{ if(el('tut-go')) el('tut-go').click(); M.score=[2,1]; M.stats.goals=1; M.min=90; M.over=true; concludeMatch(); }); await pg.waitForTimeout(900); await pg.screenshot({path:D+'63_offers.png'});
  log('제안',await pg.evaluate(()=>S.prologue.offers.map(o=>[o.tag,o.wage,o.trust0,CLUBS[o.club].str])));
  await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(700); await pg.evaluate(()=>{ const x=document.getElementById('ci-ok'); if(x) x.click(); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); }); 
  log('입단',await pg.evaluate(()=>({trust:S.trust,starter:S.starter,bench:isBenched(),sub:[...document.querySelectorAll('.home-sub .hs')].map(x=>x.textContent.trim().slice(0,12)),mode:document.querySelector('.mode-d')&&document.querySelector('.mode-d').textContent})));
  // 레벨2 → 입문 선물
  await pg.evaluate(()=>{ S.player.xp=xpNeed(1); autoMatch(true); show('screen-hub'); }); log('Lv2',await pg.evaluate(()=>({lv:S.player.level,intro:S.introSk})));
  await pg.evaluate(()=>{ tab='skill'; renderHub(); }); await pg.waitForTimeout(300); await pg.screenshot({path:D+'64_gift.png'}); log('선물 카드',await pg.evaluate(()=>[...document.querySelectorAll('[data-gift]')].map(b=>b.dataset.gift)));
  await pg.click('[data-gift="fire"]'); await pg.waitForTimeout(400); log('선물 후',await pg.evaluate(()=>({skills:S.player.skills,equip:S.player.equip,intro:S.introSk,money:S.player.money,gift:document.querySelectorAll('[data-gift]').length,pills:[...document.querySelectorAll('.skd .pill')].map(x=>x.textContent)})));
  await pg.evaluate(()=>{ renderSkill.sel='dash'; renderHub(); }); await pg.waitForTimeout(200); await pg.evaluate(()=>{ el('skd').scrollIntoView(); }); await pg.screenshot({path:D+'65_skill_fold.png'}); log('강화 접힘',await pg.evaluate(()=>({fold:!!document.querySelector('.up-fold'),sum:(document.querySelector('.up-fold summary')||{}).textContent})));
  await pg.evaluate(()=>{ tab='player'; renderPlayer.sub='stat'; renderHub(); }); await pg.waitForTimeout(200); log('성장',await pg.evaluate(()=>({coachFold:!!document.querySelector('details.card summary') ,txt:el('wk-card').textContent.includes('확정 성장')})));
  log('다음 목표',await pg.evaluate(()=>{ S.player.money=380; return nextGoals(3); }));
  log('페이지 오류',errs.length,errs.slice(0,5)); await b.close(); log('DONE'); })().catch(e=>{ console.log('FATAL',e.message); });
