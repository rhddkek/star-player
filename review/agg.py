import json,sys
T={}
for f in sys.argv[1:]:
    try: d=json.loads(open(f).readline())['raw']
    except Exception as e: print('bad',f,open(f).read()[:200]); continue
    for k,v in d.items():
        if isinstance(v,(int,float)): T[k]=T.get(k,0)+v
        elif k=='L':
            for kk,vv in v.items():
                if isinstance(vv,(int,float)): T['L_'+kk]=T.get('L_'+kk,0)+vv
n=max(1,T.get('n',0)); ok=max(1,T.get('ok',0)); p=lambda k: round(T.get(k,0)/n*100)
print(f"시도 {T.get('n',0)} | 받음 {p('ok')}% | 끊김 {p('cut')}% (바로앞 {p('cE')} / 뒤 {p('cL')}) | 흘러감 {p('loose')}% | 내가 다시 {p('self')}% | 오프·아웃 {p('off')+p('out')}% | 라인 뒤로 {p('deep')}% | 위험표시 {p('mgN')}% | 받고 슛 {p('shot')}% | 골 {p('goal')}% | 받은 곳 {T.get('gd',0)/ok:.1f}m, 앞 수비 {T.get('beh',0)/ok:.1f}명 | 득실 {T.get('gf')}:{T.get('ga')}")
