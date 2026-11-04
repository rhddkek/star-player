// 2부: 시즌 전체 (자동 + 중간 실시간 1경기) → 시즌 마감 → 시상식 → 이적 → 2시즌 시작
const {chromium,devices}=require('playwright'); const fs=require('fs');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/selftest/'; const bot=fs.readFileSync(D+'bot.js','utf8');
const log=(...a)=>{ const s=a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '); console.log(s); fs.appendFileSync(D+'run2.log',s+'\n'); };
(async()=>{ fs.writeFileSync(D+'run2.log',''); const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>{ errs.push(e.message); log('PAGEERROR',e.message); });
  const snap=async(n)=>{ await pg.screenshot({path:D+n+'.png'}); };
  const scr=()=>pg.evaluate(()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(','));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ S.prologue={stage:'offers',r:{my:2,op:1,win:true,pk:false,rating:7.6,goals:1,assists:0},offers:proOffers({rating:7.6,goals:1,assists:0})}; showProOffers(); });
  await pg.waitForTimeout(900); await snap('20_offers_bonus'); const ob=await pg.evaluate(()=>[...document.querySelectorAll('#pro-col .pro-o small')].map(x=>x.textContent)); log('제안 문구',ob);
  await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(700); await pg.evaluate(()=>{ const x=document.getElementById('ci-ok'); if(x) x.click(); });
  log('입단',await pg.evaluate(()=>({club:CLUBS[S.clubId].name,trust:S.trust,bonus:S.proBonus,starter:S.starter,bench:isBenched()})));
  const types={}; let n=0, trustLog=[], benchN=0, natN=0, injN=0;
  // 시즌 끝까지: 매 경기 홈 화면 경유, 대부분 자동, 8번째에 실시간 1경기
  while(n<80){ const st=await pg.evaluate(()=>{ const ev=nextEvent(); return ev?{t:ev.type,l:ev.label,bench:ev.type!=='nat'&&isBenched(),inj:S.player.injury}:null; }); if(!st) break; n++; types[st.t]=(types[st.t]||0)+1; if(st.bench) benchN++; if(st.inj) injN++;
    if(n===8){ log('실시간 경기',st); await pg.evaluate(bot+';window.__bot=window.__bot||setInterval(()=>{ try{ botStep(); }catch(e){ console.error("bot",e.message); } },33);'); await pg.evaluate(()=>{ tab='home'; renderHome.mode='play'; renderHub(); botStep.s=null; });
      await pg.evaluate(()=>document.getElementById('btn-go').click()); await pg.waitForTimeout(700); await pg.evaluate(()=>{ const g=document.getElementById('lu-go'); if(g) g.click(); });
      const t2=Date.now(); while(Date.now()-t2<300000){ await pg.waitForTimeout(3000); const s2=await pg.evaluate(()=>M?{ov:!el('m-overlay').hidden}:{done:true}); if(s2.done) break; if(s2.ov) await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); }
      await pg.waitForTimeout(1200); await snap('21_live_result'); log('실시간 결과',await pg.evaluate(()=>({h:S.history[S.history.length-1],trust:S.trust,bot:botStep.s&&botStep.s.log}))); await pg.evaluate(()=>{ const r=document.getElementById('res-next'); if(r) r.click(); }); }
    else { await pg.evaluate(()=>{ autoMatch(true); show('screen-hub'); }); }
    await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); });
    trustLog.push(await pg.evaluate(()=>S.trust)); }
  log('경기 수',n,'종류',types,'벤치 출발',benchN,'부상 결장',injN,'신뢰 흐름',trustLog.join(','));
  await pg.evaluate(()=>{ tab='home'; show('screen-hub'); renderHub(); }); await pg.waitForTimeout(400); await snap('22_season_end'); log('시즌 끝 화면',await pg.evaluate(()=>({btn:!!document.getElementById('btn-endseason'),tr:!!document.getElementById('go-tr'),rank:standings(divOf(S.clubId).id).findIndex(x=>x.c===S.clubId)+1,g:S.pstats.me&&S.pstats.me.g,a:S.pstats.me&&S.pstats.me.a})));
  const eb=await pg.$('#btn-endseason'); if(eb){ await eb.click(); await pg.waitForTimeout(1500); await snap('23_ceremony'); log('시상식',await scr()); for(let i=0;i<4;i++){ const s3=await scr(); if(s3==='screen-cer'){ await pg.evaluate(()=>{ const s=document.getElementById('cer-skip'); if(s) s.click(); }); await pg.waitForTimeout(500); await snap('24_cer_'+i); await pg.evaluate(()=>{ const s=document.getElementById('cer-go'); if(s) s.click(); }); await pg.waitForTimeout(800); } }
    await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); }); await snap('25_after_season'); log('시즌 후',await scr(), await pg.evaluate(()=>({season:S.season,round:S.round,tab,offers:S.offers.length,offersFor:S.offersFor,trophies:(S.trophies||[]).map(t=>t.kind),age:S.player.age,ovr:ovr(),trust:S.trust}))); }
  // 이적 제안 하나 수락해 보기
  const tr=await pg.evaluate(()=>{ if(!S.offers.length) return 'no offers'; const o=S.offers.find(x=>!x.renew)||S.offers[0]; acceptOffer(o); return {to:CLUBS[S.clubId].name,trust:S.trust,starter:S.starter,comp:S.comp&&S.comp.name,season:S.season,next:!!nextEvent()}; }); log('이적 수락',tr); await pg.waitForTimeout(600); await pg.evaluate(()=>{ tab='home'; show('screen-hub'); renderHub(); }); await pg.waitForTimeout(500); await snap('26_new_club');
  log('페이지 오류',errs.length,errs.slice(0,5)); await b.close(); log('DONE'); })().catch(e=>{ fs.appendFileSync(D+'run2.log','FATAL '+e.message+'\n'); console.log('FATAL',e.message); });
