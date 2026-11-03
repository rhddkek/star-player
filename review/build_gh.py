# 아티팩트용 star-player.html → GitHub Pages용 index.html (문서 머리말·모바일 viewport 추가)
src=open('/home/claude/star-player.html',encoding='utf-8').read()
head='''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0e1830">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="스타 플레이어">
'''
assert not src.lstrip().lower().startswith('<!doctype')
open('/home/claude/star-player/index.html','w',encoding='utf-8').write(head+src+'\n</html>\n')
print('ok')
