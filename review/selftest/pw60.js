// 실제 브라우저(아이폰 크기)로 처음부터: 오프닝 → 고교 결승(봇 플레이) → 제안 → 입단 → 리그 경기(봇) → 결과 → 성장·스킬 → 시즌 끝까지
const {chromium,devices}=require('playwright'); const fs=require('fs');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/selftest/'; const bot=fs.readFileSync(D+'bot.js','utf8');
const log=(...a)=>{ const s=a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '); console.log(s); fs.appendFileSync(D+'run.log',s+'\n'); };
(async()=>{ fs.writeFileSync(D+'run.log',''); const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>{ errs.push(e.message); log('PAGEERROR',e.message); }); pg.on('console',m=>{ if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load resource/.test(m.text())) log('CONSOLE',m.text()); });
  const snap=async(n)=>{ await pg.screenshot({path:D+n+'.png'}); };
  const scr=()=>pg.evaluate(()=>[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(','));
  await pg.goto('file:///home/claude/star-player/index.html'); await snap('00_title');
  await pg.fill('#in-name','김광우'); await pg.click('#btn-new'); const t0=Date.now();
  // 오프닝: 건너뛰지 않고 끝까지 (탭 없이 자동 진행)
  let k=0; while((await scr())==='screen-cut'&&Date.now()-t0<60000){ await pg.waitForTimeout(2500); await snap('01_cut_'+(k++)); }
  log('오프닝 길이(초)',((Date.now()-t0)/1000).toFixed(1),'다음 화면',await scr());
  await pg.waitForTimeout(500); await snap('02_pro_tutorial');
  await pg.evaluate(()=>{ const g=document.getElementById('tut-go'); if(g) g.click(); });
  await pg.evaluate(bot+';window.__bot=setInterval(()=>{ try{ botStep(); }catch(e){ console.error("bot",e.message); } },33);');
  // 고교 결승을 끝까지
  const t1=Date.now(); let half=false;
  while(Date.now()-t1<330000){ await pg.waitForTimeout(3000); const st=await pg.evaluate(()=>M?{min:Math.round(M.min),sc:M.score.join('-'),mp:Math.round(M.mp),ov:!el('m-overlay').hidden,half2:M.half2}:{done:true,scr:[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(',')});
    if(st.done) break; if(st.ov){ await snap('03_pro_overlay'); await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); }
    if(st.half2&&!half){ half=true; await snap('03_pro_half'); log('하프타임',st); } }
  log('고교 결승 실시간(초)',((Date.now()-t1)/1000).toFixed(0),'화면',await scr(),'봇', await pg.evaluate(()=>botStep.s&&botStep.s.log));
  await pg.waitForTimeout(1500); await snap('04_offers'); const offers=await pg.evaluate(()=>S.prologue&&S.prologue.offers.map(o=>({c:CLUBS[o.club].name,w:o.wage,t:o.trust0,role:roleAt(CLUBS[o.club]).t})))||null; log('제안',offers, S_r=await pg.evaluate(()=>S.prologue&&S.prologue.r));
  await pg.click('#pro-col [data-pj="0"]'); await pg.waitForTimeout(900); await snap('05_join_modal'); await pg.evaluate(()=>{ const x=document.getElementById('ci-ok'); if(x) x.click(); }); await pg.waitForTimeout(300); await snap('06_home');
  log('입단',await pg.evaluate(()=>({club:CLUBS[S.clubId].name,trust:S.trust,starter:S.starter,bench:isBenched(),comp:S.comp,mpMax:S.player.mpMax||100,lv:S.player.level,pts:S.player.points})));
  // 리그 1경기 (봇)
  await pg.evaluate(()=>{ botStep.s=null; document.getElementById('btn-go').click(); }); await pg.waitForTimeout(800); await snap('07_lineup');
  await pg.evaluate(()=>{ const g=document.getElementById('lu-go'); if(g) g.click(); });
  const t2=Date.now(); while(Date.now()-t2<330000){ await pg.waitForTimeout(3000); const st=await pg.evaluate(()=>M?{min:Math.round(M.min),ov:!el('m-overlay').hidden}:{done:true}); if(st.done) break; if(st.ov){ await pg.evaluate(()=>{ const bt=document.querySelector('#m-overlay .btn.primary'); if(bt) bt.click(); }); } }
  await pg.waitForTimeout(1500); await snap('08_result'); log('리그 1경기 실시간(초)',((Date.now()-t2)/1000).toFixed(0),'화면',await scr(), await pg.evaluate(()=>{ const h=S.history[S.history.length-1]; return {h,trust:S.trust,starter:S.starter,bot:botStep.s&&botStep.s.log}; }));
  await pg.evaluate(()=>{ window.scrollTo(0,0); const c=document.querySelector('#result-col'); if(c) c.parentElement.scrollTop=9999; }); await pg.waitForTimeout(300); await snap('08b_result_bottom');
  await pg.evaluate(()=>{ document.getElementById('res-next').click(); }); await pg.waitForTimeout(600); await snap('09_home2');
  // 성장: 기력 수련
  await pg.evaluate(()=>{ tab='player'; renderPlayer.sub='stat'; renderHub(); }); await pg.waitForTimeout(300); const wk=await pg.evaluate(()=>{ const b=document.querySelector('[data-tr="mp"]'); if(!b) return 'no-btn'; const m0=S.player.mpMax||100; b.click(); return {m0,m1:S.player.mpMax||100,msg:S.weekMsg}; }); log('기력 수련',wk); await snap('10_growth');
  await pg.evaluate(()=>{ tab='skill'; renderHub(); }); await pg.waitForTimeout(300); await snap('11_skill');
  // 시즌 끝까지 자동 (5경기 자동 반복)
  let loops=0; while(loops++<12){ const r=await pg.evaluate(()=>{ tab='home'; renderHub(); if(!nextEvent()) return 'end'; renderHome.mode='batch'; const b=document.getElementById('btn-go'); if(!b) return 'nobtn:'+[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id); b.click(); return 'ok'; }); await pg.waitForTimeout(700);
    await pg.evaluate(()=>{ document.querySelectorAll('.hub-modal').forEach(m=>{ const b=m.querySelector('.btn.primary,.btn'); if(b) b.click(); else m.remove(); }); const rn=document.getElementById('res-next'); if(rn&&!el('screen-result').hidden) rn.click(); }); await pg.waitForTimeout(300);
    const st=await pg.evaluate(()=>({scr:[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join(','),round:S.round,trust:S.trust,starter:S.starter,apps:S.player.career.apps,ev:!!nextEvent()})); log('자동',loops,r,st); if(r==='end'||!st.ev) break; }
  await snap('12_season_end'); const endBtn=await pg.evaluate(()=>!!document.getElementById('btn-endseason')); log('시즌 마감 버튼',endBtn);
  if(endBtn){ await pg.evaluate(()=>document.getElementById('btn-endseason').click()); await pg.waitForTimeout(1200); await snap('13_ceremony'); log('시상식 화면',await scr()); await pg.evaluate(()=>{ const s=document.getElementById('cer-skip'); if(s) s.click(); }); await pg.waitForTimeout(500); await snap('14_cer_end'); await pg.evaluate(()=>{ const s=document.getElementById('cer-go'); if(s) s.click(); }); await pg.waitForTimeout(800); await snap('15_after'); log('시즌 후',await scr(), await pg.evaluate(()=>({season:S.season,club:CLUBS[S.clubId].name,offers:S.offers.length,trophies:(S.trophies||[]).length,trust:S.trust}))); }
  log('페이지 오류',errs.length,errs.slice(0,5)); await b.close(); log('DONE'); })().catch(e=>{ console.log('FATAL',e.message); fs.appendFileSync(D+'run.log','FATAL '+e.message+'\n'); });
