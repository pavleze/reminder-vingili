import re
head=open('src/head.html',encoding='utf-8').read()
js=open('src/app.js',encoding='utf-8').read()
names=set(re.findall(r"icon\('([a-z0-9_]+)'",js))
names|=set(re.findall(r"\[\s*'[A-Za-z]+',\s*'[a-z]+',\s*'([a-z_0-9]+)'",js))
names|=set(re.findall(r"icon: '([a-z_0-9]+)'",js))
names|=set(re.findall(r"'(visibility_off|visibility|expand_more|radio_button_checked|radio_button_unchecked)'",js))
names|={'expand_more','visibility','visibility_off','error','mail','lock','lock_reset','lock_outline','alarm','security','link','feedback','delete_forever','account_balance','language','palette','expand_less','undo','priority_high','history','fingerprint','login','format_list_numbered','info','check_circle','radio_button_unchecked','notifications_active','notifications_off','calendar_today'}
for m in re.findall(r"icon\(([^)]*)\)",js): names|=set(re.findall(r"'([a-z][a-z0-9_]+)'",m))
names-={'bs','low','wednesday','fill','sm','xs','lg','xl','xxl','reminders','x'}
url='https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&icon_names='+','.join(sorted(names))+'&display=block'
head=head.replace('__ICON_FONT_URL__',url.replace('&','&amp;'))
body='''
<div id="app"></div>
<div id="modal"></div>
<div class="toasts" id="toasts" aria-live="polite"></div>
<div class="heads" id="heads" aria-live="assertive"></div>
<input type="file" id="ics-input" accept=".ics,text/calendar" hidden>
<script src="i18n.js"></script>
<script src="app.js"></script>
'''
open('app.html','w',encoding='utf-8').write(head+body)
open('index.html','w',encoding='utf-8').write('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+head+'\n</head>\n<body>'+body+'</body>\n</html>\n')
open('app.js','w',encoding='utf-8').write(js)
print(len(names), sorted(names))
