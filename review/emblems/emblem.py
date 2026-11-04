from PIL import Image, ImageDraw, ImageFilter, ImageChops
import colorsys, math

S=48
OUT=(22,24,30,255)

def hexrgb(h):
    h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))

def shade(rgb,f):
    r,g,b=[x/255 for x in rgb]; h,l,s=colorsys.rgb_to_hls(r,g,b); l=max(0,min(1,l*f if f<1 else l+(1-l)*(f-1)))
    r,g,b=colorsys.hls_to_rgb(h,l,s); return (round(r*255),round(g*255),round(b*255))

def lum(rgb): return (0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2])/255

def shape_mask(shape):
    m=Image.new('L',(S,S),0); d=ImageDraw.Draw(m)
    if shape=='round':
        d.ellipse((3,3,44,44),fill=255)
    elif shape=='square':
        d.rounded_rectangle((4,4,43,43),radius=9,fill=255)
    else:
        top=[(5,4),(42,4)] if shape=='shield' else [(5,7),(14,3),(23.5,7),(33,3),(42,7)]
        pts=top[:]
        # 오른쪽 변 → 아래 뾰족 → 왼쪽 변
        for t in range(0,21):
            a=t/20; y=24+a*21; x=42-(1-math.cos(a*math.pi/2))**0.9*18.5 if a>0 else 42
            pts.append((x,y))
        pts.append((23.5,45.5))
        for t in range(20,-1,-1):
            a=t/20; y=24+a*21; x=5+(1-math.cos(a*math.pi/2))**0.9*18.5 if a>0 else 5
            pts.append((x,y))
        d.polygon(pts,fill=255)
    return m.point(lambda v:255 if v>127 else 0)

def erode(m,n):
    for _ in range(n): m=m.filter(ImageFilter.MinFilter(3))
    return m
def dilate(m,n):
    for _ in range(n): m=m.filter(ImageFilter.MaxFilter(3))
    return m

def pattern_layer(pat,c1,c2,inner):
    img=Image.new('RGBA',(S,S),c1+(255,)); d=ImageDraw.Draw(img)
    if pat=='vstripes':
        for x in range(4,S,10): d.rectangle((x+3,0,x+7,S),fill=c2+(255,))
    elif pat=='halves':
        d.rectangle((24,0,S,S),fill=c2+(255,))
    elif pat=='sash':
        d.polygon([(0,10),(10,0),(S,38),(38,S)],fill=c2+(255,))
    elif pat=='chevron':
        d.polygon([(0,26),(24,10),(S,26),(S,34),(24,18),(0,34)],fill=c2+(255,))
    elif pat=='hoop':
        d.rectangle((0,19,S,29),fill=c2+(255,))
    elif pat=='quarter':
        d.rectangle((24,0,S,24),fill=c2+(255,)); d.rectangle((0,24,24,S),fill=c2+(255,))
    return img

def make(sym, c1h, c2h, shape='shield', pat='solid'):
    c1=hexrgb(c1h); c2=hexrgb(c2h)
    if abs(lum(c1)-lum(c2))<0.12: c2=shade(c2,0.55) if lum(c2)>0.5 else shade(c2,1.6)
    m=shape_mask(shape)
    inner=erode(m,2)        # 바깥 테두리 2px
    band=erode(inner,2)     # 안쪽 띠
    out=Image.new('RGBA',(S,S),(0,0,0,0))
    out.paste(Image.new('RGBA',(S,S),OUT),(0,0),m)
    # 띠 (c2), 그 안은 패턴
    out.paste(Image.new('RGBA',(S,S),c2+(255,)),(0,0),inner)
    body=pattern_layer(pat,c1,c2,band)
    out.paste(body,(0,0),band)
    # 명암: 위는 밝게, 아래는 어둡게
    px=out.load(); bm=inner.load()
    for y in range(S):
        f=1.12-0.26*(y/S)
        for x in range(S):
            if bm[x,y]:
                r,g,b,a=px[x,y]; nr,ng,nb=shade((r,g,b),f) if f!=1 else (r,g,b)
                px[x,y]=(nr,ng,nb,a)
    # 위쪽 하이라이트 한 줄
    hl=ImageChops.subtract(band,erode(band,1)); hp=hl.load(); bp=band.load()
    for y in range(S//2):
        for x in range(S):
            if hp[x,y] and y<S*0.45:
                r,g,b,a=px[x,y]; px[x,y]=tuple(min(255,int(v+(255-v)*0.35)) for v in (r,g,b))+(a,)
    # 심볼: 그림자 + 붙이기
    sy=sym.convert('RGBA')
    bb=sy.getbbox()
    if bb:
        sy=sy.crop(bb); w,h=sy.size; k=min(30/w,30/h,1.0)
        if k<1: sy=sy.resize((max(1,round(w*k)),max(1,round(h*k))),Image.NEAREST)
        w,h=sy.size; ox=(S-w)//2; oy=(S-h)//2+(-1 if shape in('shield','crest') else 0)
        a=sy.split()[3].point(lambda v:255 if v>100 else 0)
        sh=Image.new('RGBA',(S,S),(0,0,0,0)); sh.paste(Image.new('RGBA',(w,h),(0,0,0,110)),(ox+1,oy+1),a)
        out=Image.alpha_composite(out,Image.composite(sh,Image.new('RGBA',(S,S),(0,0,0,0)),band))
        layer=Image.new('RGBA',(S,S),(0,0,0,0)); layer.paste(sy,(ox,oy),a)
        out=Image.alpha_composite(out,layer)
    return out
