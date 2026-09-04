#!/usr/bin/env python3
"""Stage App Store version 1.6 ("Nibble" rebrand) in App Store Connect.

Run AFTER Macra 1.5 leaves review (ASC refuses to create a version while one is in review).
  python3 asc_nibble_16.py --dry-run   # read-only: report state and what would change
  python3 asc_nibble_16.py             # create 1.6, set name/subtitle, release notes, screenshots, attach build
Never submits for review. Uses the ASC key helper at landed/.credentials/asc.py.
"""
import sys, os, io, glob, json, time
sys.path.insert(0, os.path.expanduser('~/workspace/landed/.credentials'))
import asc
from PIL import Image

APP = '6755325879'
NAME = 'Nibble: AI Calorie Tracker'          # 26 chars (limit 30)
SUBTITLE = 'Photo Food Log: Macros & Diet'   # unchanged, 29 chars
WHATS_NEW = ("Macra is now Nibble! Same app you know, with a fresh name and a new look. "
             "Snap a photo, say what you ate, or scan a barcode and let AI handle the macros. "
             "Bug fixes and performance improvements.")
SHOTS = sorted(glob.glob(os.path.join(os.path.dirname(__file__), 'screenshots/nibble_aso/*.png')))
MIN_BUILD = 102
DRY = '--dry-run' in sys.argv

def die(msg, r=None):
    print('ERROR:', msg); 
    if r: print(json.dumps(r, indent=1)[:1500])
    sys.exit(1)

def find_version(vs):
    r = asc.api('GET', f'/v1/apps/{APP}/appStoreVersions?filter[platform]=IOS&filter[versionString]={vs}&fields[appStoreVersions]=versionString,appStoreState')
    return r['data'][0] if r.get('data') else None

# 1. Version 1.6
v15 = find_version('1.5'); print('1.5 state:', v15['attributes']['appStoreState'] if v15 else 'n/a')
v16 = find_version('1.6')
if v16: print('1.6 exists:', v16['id'], v16['attributes']['appStoreState'])
elif DRY: print('would create 1.6')
else:
    r = asc.api('POST', '/v1/appStoreVersions', {'data': {'type': 'appStoreVersions', 'attributes': {'platform': 'IOS', 'versionString': '1.6'},
         'relationships': {'app': {'data': {'type': 'apps', 'id': APP}}}}})
    if 'data' not in r: die('create 1.6 failed', r)
    v16 = r['data']; print('created 1.6', v16['id'])

# 2. App name / subtitle on the editable (pending) appInfo
infos = asc.api('GET', f'/v1/apps/{APP}/appInfos?fields[appInfos]=appStoreState')['data']
pending = [i for i in infos if i['attributes']['appStoreState'] in ('PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED')]
for i in infos: print('appInfo', i['id'], i['attributes']['appStoreState'])
if pending:
    loc = asc.api('GET', f"/v1/appInfos/{pending[0]['id']}/appInfoLocalizations?fields[appInfoLocalizations]=locale,name,subtitle")['data']
    for L in loc:
        if L['attributes']['locale'] != 'en-US': continue
        print('name now:', L['attributes']['name'], '| subtitle:', L['attributes']['subtitle'])
        if L['attributes']['name'] != NAME or L['attributes']['subtitle'] != SUBTITLE:
            if DRY: print('would set name ->', NAME)
            else:
                r = asc.api('PATCH', f"/v1/appInfoLocalizations/{L['id']}", {'data': {'type': 'appInfoLocalizations', 'id': L['id'], 'attributes': {'name': NAME, 'subtitle': SUBTITLE}}})
                print('name set' if 'data' in r else f'name PATCH failed: {r}')
else:
    print('no editable appInfo yet (name change must wait)')

if not v16: sys.exit(0)
vid = v16['id']

# 3. Release notes + screenshots on en-US version localization
locs = asc.api('GET', f'/v1/appStoreVersions/{vid}/appStoreVersionLocalizations?fields[appStoreVersionLocalizations]=locale,whatsNew')['data']
en = next((L for L in locs if L['attributes']['locale'] == 'en-US'), None)
if not en: die('no en-US localization on 1.6')
if DRY: print('would set whatsNew (current: %r)' % (en['attributes'].get('whatsNew') or '')[:60])
else:
    r = asc.api('PATCH', f"/v1/appStoreVersionLocalizations/{en['id']}", {'data': {'type': 'appStoreVersionLocalizations', 'id': en['id'], 'attributes': {'whatsNew': WHATS_NEW}}})
    print('whatsNew set' if 'data' in r else f'whatsNew failed: {r}')

def replace_set(display_type, files):
    sets = asc.api('GET', f"/v1/appStoreVersionLocalizations/{en['id']}/appScreenshotSets?fields[appScreenshotSets]=screenshotDisplayType")['data']
    st = next((s for s in sets if s['attributes']['screenshotDisplayType'] == display_type), None)
    if DRY: print(f'{display_type}: set {"exists" if st else "missing"}; would upload {len(files)} files'); return
    if not st:
        r = asc.api('POST', '/v1/appScreenshotSets', {'data': {'type': 'appScreenshotSets', 'attributes': {'screenshotDisplayType': display_type},
             'relationships': {'appStoreVersionLocalization': {'data': {'type': 'appStoreVersionLocalizations', 'id': en['id']}}}}})
        if 'data' not in r: die('create set failed', r)
        st = r['data']
    old = asc.api('GET', f"/v1/appScreenshotSets/{st['id']}/appScreenshots")['data']
    for o in old: asc.api('DELETE', f"/v1/appScreenshots/{o['id']}")
    for f in files:
        r = asc.upload_asset('/v1/appScreenshots', {'data': {'type': 'appScreenshots', 'attributes': {'fileName': os.path.basename(f)},
             'relationships': {'appScreenshotSet': {'data': {'type': 'appScreenshotSets', 'id': st['id']}}}}}, f, 'appScreenshots')
        print(' ', display_type, os.path.basename(f), 'ok' if 'data' in r else r)
    time.sleep(2)

# 6.7" (1290x2796) native; 6.5" gets a 1284x2778 resize so older-device listings don't keep the Macra shots
replace_set('APP_IPHONE_67', SHOTS)
tmp = '/tmp/nibble_65'; os.makedirs(tmp, exist_ok=True); r65 = []
for f in SHOTS:
    out = os.path.join(tmp, os.path.basename(f)); Image.open(f).convert('RGB').resize((1284, 2778), Image.LANCZOS).save(out); r65.append(out)
replace_set('APP_IPHONE_65', r65)

# 4. Attach newest processed build >= MIN_BUILD
b = asc.api('GET', f'/v1/builds?filter[app]={APP}&filter[processingState]=VALID&sort=-uploadedDate&limit=5&fields[builds]=version,uploadedDate,processingState')['data']
cands = [x for x in b if int(x['attributes']['version']) >= MIN_BUILD]
print('builds:', [(x['attributes']['version'], x['attributes']['processingState']) for x in b])
if cands and not DRY:
    r = asc.api('PATCH', f'/v1/appStoreVersions/{vid}', {'data': {'type': 'appStoreVersions', 'id': vid, 'relationships': {'build': {'data': {'type': 'builds', 'id': cands[0]['id']}}}}})
    print('attached build', cands[0]['attributes']['version'] if 'data' in r else r)
elif not cands: print(f'no processed build >= {MIN_BUILD} yet; attach later')
print('DONE (not submitted)')
