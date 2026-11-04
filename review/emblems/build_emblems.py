import json, hashlib, base64, io, sys
sys.path.insert(0,'/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad')
from emblem import make
from PIL import Image
D='/tmp/claude-0/-home-claude/99dc0c2a-f95d-5557-84c3-47562decaedf/scratchpad/'
clubs=json.load(open(D+'clubs_all.json'))

NICK={'갈매기':'seagull','팔공':'mountain','항구':'anchor','비빔':'bowl','돌하르방':'stonestatue','두루미':'crane','해오름':'sunrise','소리개':'kite','참매':'hawk','물결':'wave','소나무':'pine','호두':'walnut','들판':'wheat','무등':'mountain','파도':'wave','은하':'galaxy','별빛':'star','강철':'gear','황소':'bull','돌고래':'dolphin','청솔':'pine','불꽃':'flame','은빛':'crescent','바람개비':'pinwheel',
 '라이징':'sunrise','나니와':'jcastle','코케':'leaf','카모메':'seagull','유키':'snowflake','하카타':'drum','가제':'wind','나미':'wave','다카':'hawk','류세이':'comet','히카리':'sparkle','소라':'cloud','이나즈마':'lightning','사쿠라':'cherry','쓰키':'crescent','호노오':'flame','가스미':'cloud','호시':'star','코메':'wheat','모미지':'mapleleaf','시로':'jcastle','미나토':'anchor','시사':'shisa',
 '슈테른':'star','블리츠':'lightning','아이젠':'gear','볼프':'wolf','팔케':'hawk','뢰베':'lion','그라나트':'gem','도너':'lightning','펠젠':'mountain','슈투름':'tornado','보덴제':'sailboat','오스트제':'lighthouse','모젤':'grapes',
 '레오네스':'lion','에스트레야':'star','미라도르':'tower','토레':'tower','솔':'sun','루나':'crescent','오르카':'orca','알바':'sunrise','팔코':'hawk','브리사':'wind','메세타':'windmill','피레네':'mountain','카나리아':'canary','둘세':'bee',
 '아퀼레':'eagle','스텔라':'star','레오니':'lion','팔키':'hawk','토리':'bull','베르디':'clover','루피':'wolf','피오레':'flower','델피니':'dolphin','그리포니':'griffin',
 '레종':'lion','에투알':'star','포콩':'hawk','루':'wolf','블뢰':'bluebird','오랑주':'orange','미스트랄':'wind','앙크르':'anchor','솔레유':'sun','로시뇰':'songbird',
 '포지스':'anvil','하이랜더스':'thistle','아이언사이드':'sword','실버데일':'mountain','레드카이츠':'kite','스톤월':'tower','블루해머스':'hammer','나이츠':'knight','팰컨스':'hawk','오크스':'oak','로지스':'rose','블랙컨트리':'anvil','펠러스':'mountain','코스트':'lighthouse','드래곤스':'dragon'}
BYNAME={'칠성 FC':'sevenstars','한강 유나이티드':'bridge','시우다드레알 라 만차 CF':'windmill'}
POOL=['star','lightning','wave','mountain','flame','key','sun','compass','gear','laurel','arrow','gem','comet','anchor','oak','sparkle','crescent','tower','bell','trophy','bee','horse','fox','bear','swan','griffin','eagle','lion','wolf','bull','dragon','sword','knight','clover']
EXCL={'웨스트런던 블루':['lion'],'웨스트미들랜즈 클라렛':['lion'],'머지사이드 레드':['eagle','swan'],'노스런던 화이트':['eagle','swan'],'타인사이드 블랙화이트':['tower','horse'],'머지사이드 블루':['tower'],'울버햄프턴 골드':['wolf'],'사우스런던 레드블루':['eagle'],'노팅엄 레드':['oak'],'맨체스터 레드':['dragon'],'맨체스터 스카이':['eagle','anchor'],'랭커셔 클라렛':['bee'],'미들섹스 레드화이트':['bee'],'위어사이드 레드':['lion'],'요크셔 화이트':['rose'],
 '마드리드 레드화이트':['bear','oak'],'빌바오 레드화이트':['oak'],'바르셀로나 블루화이트':['bird'],
 '밀라노 레드블랙':['dragon'],'로마 옐로레드':['wolf'],'로마 스카이':['eagle'],'토리노 마룬':['bull'],'피렌체 퍼플':['flower'],'나폴리 스카이':['horse'],'레체 옐로레드':['wolf'],'제노바 레드블루':['griffin'],'피에몬테 블랙화이트':['star'],
 '프랑크푸르트 블랙레드':['eagle'],'볼프스부르크 그린':['wolf'],'글라트바흐 그린':['horse'],'레버쿠젠 레드블랙':['lion'],'함부르크 블루':['gem'],'슈투트가르트 화이트레드':['horse'],'베를린 레드':['bear'],'브레멘 그린':['key'],'라이프치히 화이트레드':['bull'],'함부르크 브라운':['dragon'],
 '파리 블루레드':['tower'],'마르세유 화이트블루':['star'],'모나코 레드화이트':['gem'],'리옹 화이트':['lion'],'릴 레드':['bear','fox'],'니스 레드블랙':['eagle'],'낭트 옐로그린':['canary'],'르아브르 스카이':['anchor'],'메스 마룬':['dragon']}
PSEUDO_DIVS={'en-1','es-1','it-1','de-1','fr-1'}

def h(s,salt=''):
    return int(hashlib.md5((s+salt).encode()).hexdigest(),16)

assign={}; used_by_div={}
for c in clubs:
    nm=c['name']; div=c['div']; used=used_by_div.setdefault(div,set())
    sym=BYNAME.get(nm)
    if not sym and div not in PSEUDO_DIVS:
        w=nm.replace(' FC','').replace(' SC','').replace(' CF','').replace(' SV','').split(' ')
        for word in w[1:]:
            if word in NICK: sym=NICK[word]; break
    if not sym:
        ex=set(EXCL.get(nm,[]))
        cands=[p for p in POOL if p not in ex and p not in used] or [p for p in POOL if p not in ex]
        sym=cands[h(nm)%len(cands)]
    used.add(sym); assign[c['id']]=sym

SHAPES=['shield']*8+['crest']*4+['round']*5+['square']*3
PATS=['solid']*7+['vstripes']*3+['halves']*2+['sash']*3+['chevron']*2+['hoop']*2+['quarter']*1
syms={}
def sym(n):
    if n not in syms: syms[n]=Image.open(D+'sym/'+n+'.png').convert('RGBA')
    return syms[n]

COLS=20
rows=(len(clubs)+COLS-1)//COLS
sheet=Image.new('RGBA',(COLS*48,rows*48),(0,0,0,0)); idx={}
for i,c in enumerate(clubs):
    shp=SHAPES[h(c['id'],'s')%len(SHAPES)]; pat=PATS[h(c['id'],'p')%len(PATS)]
    e=make(sym(assign[c['id']]),c['c1'],c['c2'],shp,pat)
    sheet.paste(e,((i%COLS)*48,(i//COLS)*48),e); idx[c['id']]=i
# 팔레트 압축
q=sheet.quantize(colors=255,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
# 알파 보존: 투명 픽셀을 별도 인덱스로
bio=io.BytesIO()
alpha=sheet.split()[3]
rgb=sheet.convert('RGB');
pal=sheet.convert('RGBA')
sheet.save(D+'emb_sheet.png',optimize=True)
q2=sheet.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
q2.save(D+'emb_sheet_q.png',optimize=True)
import os
print('sheet',sheet.size,'png',os.path.getsize(D+'emb_sheet.png'),'quant',os.path.getsize(D+'emb_sheet_q.png'))
json.dump({'idx':idx,'cols':COLS,'rows':rows,'assign':assign},open(D+'emb_meta.json','w'),ensure_ascii=False)
from collections import Counter
print(Counter(assign.values()).most_common(12))
