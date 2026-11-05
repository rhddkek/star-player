import json,io,base64
from PIL import Image
T='/root/.claude/projects/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/tool-results/'
BG=(31,37,44); DIRS=['south','south-east','east','north-east','north','north-west','west','south-west']
def load(p):
    im=Image.open(T+p).convert('RGBA'); px=im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            if px[x,y][:3]==BG: px[x,y]=(0,0,0,0)
    return im
def body_px(c): r,g,b,a=c; return (b>r+30) or (r>150 and r>g>b and r-b>40)
def clean(fr):
    px=fr.load(); W,H=fr.size; seen=set(); comps=[]
    for y in range(H):
        for x in range(W):
            if px[x,y][3]>10 and (x,y) not in seen:
                st=[(x,y)]; seen.add((x,y)); comp=[]
                while st:
                    a,b=st.pop(); comp.append((a,b))
                    for dx in (-1,0,1):
                        for dy in (-1,0,1):
                            n=(a+dx,b+dy)
                            if 0<=n[0]<W and 0<=n[1]<H and n not in seen and px[n][3]>10: seen.add(n); st.append(n)
                comps.append(comp)
    if not comps: return fr,0
    big=max(len(c) for c in comps); rem=0
    for c in comps:
        if len(c)==big: continue
        if len(c)<=60 and not any(body_px(px[p]) for p in c):
            for p in c: px[p]=(0,0,0,0)
            rem+=1
    return fr,rem
def durl(im):
    b=io.BytesIO(); im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
out={}; removed=0
for e in json.load(open('mo/manifest.json')):
    f,ch,an=e[:3]; sl=e[3] if len(e)>3 else None; dl=e[4] if len(e)>4 and e[4] else DIRS; ro=e[5] if len(e)>5 else 0
    im=load(f); W,H=im.size; top=H-(H//68)*68; rows=len(dl)
    for r in range(rows):
        frames=[]
        for c in range(W//68):
            fr=im.crop((c*68,top+(r+ro)*68,(c+1)*68,top+(r+ro+1)*68))
            if fr.getbbox() is None: continue
            fr,n=clean(fr); removed+=n; frames.append(durl(fr))
        if sl: frames=frames[sl[0]:sl[1]]
        out.setdefault(ch,{}).setdefault(an,{})[dl[r]]=frames
MIR={'east':'west','west':'east','north-east':'north-west','north-west':'north-east','south-east':'south-west','south-west':'south-east'}
import os
drop=json.load(open('mo/drop.json')) if os.path.exists('mo/drop.json') else []
for ch,an,d,idx in drop:
    out[ch][an][d]=[f for i,f in enumerate(out[ch][an][d]) if i not in idx]
fix=json.load(open('mo/mirror.json')) if os.path.exists('mo/mirror.json') else []
for ch,an,d in fix:
    src=out[ch][an][MIR[d]]; nf=[]
    for u in src:
        im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).transpose(Image.FLIP_LEFT_RIGHT); nf.append(durl(im))
    out[ch][an][d]=nf
json.dump(out,open('mo/new_sprites.json','w'))
print('removed blobs',removed)
for ch in out: print(ch,{a:{d[:2]:len(v) for d,v in out[ch][a].items()} for a in out[ch]})
import os; print(os.path.getsize('mo/new_sprites.json')/1e6,'MB')
