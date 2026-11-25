#!/bin/bash
# aiqm.sh <html> <tag> : 3×8 경기 병렬 → 평균
F=$1; T=$2; export NODE_PATH=$(npm root -g)
for i in 1 2 3; do timeout 1200 node aiq.js $F 8 > aiq/$T.$i.txt 2>&1 & done; wait
python3 - "$T" <<'P'
import json,sys,re
T=sys.argv[1]; R=[]
for i in (1,2,3):
    try: R.append(json.loads(open(f'aiq/{T}.{i}.txt').read().split('errs')[0]))
    except Exception as e: print('fail',i,e)
def pc(x): return float(re.match(r'([\d.]+)',x).group(1))
out={}
for k in ['all','short','mid','long','thru']: out['succ_'+k]=round(sum(pc(r['passSucc'][k]) for r in R)/len(R),1)
for k in ['short','long','thru']: out['mix_'+k]=round(sum(pc(r['mix'][k]) for r in R)/len(R),1)
for k in ['passPerPoss','pass']: out[k]=round(sum(r['perMatch'][k] for r in R)/len(R),2)
out['chain5']=round(sum(pc(r['perMatch']['chain5']) for r in R)/len(R),1)
out['goals']=round(sum(sum(float(x) for x in r['perMatch']['goals']) for r in R)/len(R),2)
out['shots']=round(sum(sum(float(x) for x in r['perMatch']['shots']) for r in R)/len(R),1)
for k in ['ahead','fwdOpt','openOpt','dfNearAhead','dfOpen','near10','attW','defD']: 
    v=[r['shape'].get(k) for r in R if r['shape'].get(k) is not None]; out[k]=round(sum(v)/len(v),2) if v else None
print(T,json.dumps(out))
P
