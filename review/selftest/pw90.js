const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui2/';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file:///home/claude/star-player/index.html'); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ proSkipAll(0); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; for(let i=0;i<3;i++){ autoMatch(true); } show('screen-hub'); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.player.money=900; S.compIntro=true; tab='home'; renderHub(); }); await pg.waitForTimeout(600); await pg.evaluate(()=>{ const x=document.getElementById('ci-ok'); if(x) x.click(); document.querySelectorAll('.hub-modal,.toast').forEach(m=>m.remove()); });
  const sc=await pg.evaluate(()=>{ const all=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+20&&getComputedStyle(e).overflowY.match(/auto|scroll/)); return all.map(e=>(e.id||'')+'.'+e.className+':'+e.scrollHeight); }); console.log('scrollers',sc);
  const cap=async(name)=>{ await pg.waitForTimeout(250); const h=await pg.evaluate(()=>{ const s=[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&e.scrollHeight>e.clientHeight+20&&getComputedStyle(e).overflowY.match(/auto|scroll/))[0]; return s?s.scrollHeight:0; });
    const n=Math.min(6,Math.ceil(h/600)||1); for(let i=0;i<n;i++){ await pg.evaluate(y=>{ const s=[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&e.scrollHeight>e.clientHeight+20&&getComputedStyle(e).overflowY.match(/auto|scroll/))[0]; if(s) s.scrollTop=y; },i*560); await pg.waitForTimeout(150); await pg.screenshot({path:D+name+'_'+i+'.png'}); } return h; };
  const out={};
  out.home=await cap('home');
  for(const t of ['player','skill','transfer','club','life']){ const ok=await pg.evaluate(t=>{ const bt=document.querySelector(`#tabs button[data-tab="${t}"]`); if(!bt) return false; bt.click(); return true; },t); if(ok) out[t]=await cap(t); }
  out.tabs=await pg.evaluate(()=>[...document.querySelectorAll('#tabs button')].map(b=>b.dataset.tab+':'+b.textContent.trim()));
  // match HUD
  await pg.evaluate(()=>{ tab='home'; renderHub(); document.getElementById('btn-go').click(); }); await pg.waitForTimeout(800); await pg.screenshot({path:D+'m_lineup.png'}); await pg.evaluate(()=>{ const g=document.getElementById('lu-go'); if(g) g.click(); }); await pg.waitForTimeout(4000); await pg.screenshot({path:D+'m_hud.png'});
  await pg.evaluate(()=>{ M.freeze=0; setOwner(M.user,{clean:true}); }); await pg.waitForTimeout(600); await pg.screenshot({path:D+'m_hud_ball.png'});
  await pg.evaluate(()=>{ el('btn-pause')&&el('btn-pause').click(); }); await pg.waitForTimeout(300); await pg.screenshot({path:D+'m_pause.png'});
  // result
  await pg.evaluate(()=>{ el('m-overlay').hidden=true; M.min=90; M.over=true; M.score=[2,1]; M.stats.goals=1; concludeMatch(); }); await pg.waitForTimeout(800); out.result=await cap('result');
  console.log(JSON.stringify(out),errs); await b.close(); })();
