const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui2/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.compIntro=false; S.player.money=380; S.player.points=8; tab='home'; renderHub(); });
  await pg.waitForTimeout(400); await pg.evaluate(()=>document.querySelectorAll('.hub-modal,.toast').forEach(m=>m.remove()));
  await pg.screenshot({path:D+'Z1_home.png'});
  await pg.evaluate(()=>{ const s=[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&e.scrollHeight>e.clientHeight+20&&getComputedStyle(e).overflowY.match(/auto|scroll/))[0]; if(s) s.scrollTop=9999; }); await pg.waitForTimeout(200); await pg.screenshot({path:D+'Z2_home_bottom.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-row=week]').click(); }); await pg.waitForTimeout(300); await pg.screenshot({path:D+'Z3_sheet.png'});
  await pg.evaluate(()=>{ document.querySelectorAll('.wk-sheet').forEach(m=>m.remove()); tab='player'; renderPlayer.sub='stat'; renderHub(); }); await pg.waitForTimeout(300); await pg.screenshot({path:D+'Z4_growth.png'});
  await pg.evaluate(()=>{ tab='skill'; renderSkill.sel='onetwo'; renderSkill.scroll=true; S.introSk='none'; renderHub(); }); await pg.waitForTimeout(600); await pg.screenshot({path:D+'Z5_skill.png'});
  // 공정 테스트: 첫 화면 텍스트
  await pg.evaluate(()=>{ tab='home'; renderHub(); });
  const first=await pg.evaluate(()=>{ const vh=window.innerHeight; return [...document.querySelectorAll('#tab-home *')].filter(e=>e.children.length===0&&e.getBoundingClientRect().bottom<vh-80&&e.getBoundingClientRect().top>0&&e.textContent.trim()).map(e=>e.textContent.trim()).join(' | ').slice(0,600); });
  console.log(first); console.log(errs); await b.close(); })();
