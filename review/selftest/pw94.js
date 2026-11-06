const {chromium,devices}=require('playwright');
const D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/ui3/'+(process.argv[3]||'A')+'_';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:664}})).newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.argv[2]); await pg.click('#btn-new'); await pg.waitForTimeout(500);
  await pg.evaluate(()=>{ proSkipAll(1); document.querySelectorAll('.hub-modal').forEach(m=>m.remove()); S.tutSeen=true; S.compIntro=false; S.player.money=380; S.player.points=8; S.player.rep=900; for(let i=0;i<4;i++){ autoMatch(true); } save(); tab='home'; renderHub(); });
  await pg.waitForTimeout(300); await pg.evaluate(()=>document.querySelectorAll('.hub-modal,.toast').forEach(m=>m.remove()));
  const sc=async(n)=>{ await pg.waitForTimeout(300); await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(m=>m.remove())); await pg.screenshot({path:D+n+'.png'}); const fp=await pg.evaluate(()=>{ const s=[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&e.scrollHeight>e.clientHeight+20&&getComputedStyle(e).overflowY.match(/auto|scroll/))[0]; return s?s.scrollHeight:0; }); return fp; };
  const out={};
  for(const t of ['shop','league','transfer']){ await pg.evaluate(t=>{ tab=t; renderHub(); },t); out[t]=await sc(t); 
    out[t+'_y']=await pg.evaluate(t=>{ const r=document.querySelector('#tab-'+t); const ys=[...r.querySelectorAll('button')].filter(b=>b.offsetParent&&/^rgb\((2[3-5]\d), (1[6-9]\d|2[0-2]\d), ([0-9]{1,2}|1[0-2]\d)\)/.test(getComputedStyle(b).backgroundColor)).map(b=>b.textContent.trim().slice(0,20)); return ys; },t);
    out[t+'_txt']=await pg.evaluate(t=>document.querySelector('#tab-'+t).innerText.slice(0,700).replace(/\n+/g,' | '),t);
  }
  await pg.evaluate(()=>{ autoMatch(false); }); await pg.waitForTimeout(600); out.result=await sc('result');
  out.result_txt=await pg.evaluate(()=>{ const s=document.querySelector('#screen-result')||document.body; return s.innerText.slice(0,900).replace(/\n+/g,' | '); });
  console.log(JSON.stringify(out,null,1)); console.log(errs); await b.close(); })();
