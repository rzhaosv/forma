#!/usr/bin/env python3
"""Post to Reddit via the official API (no browser). One-time setup:
  1. Log in as the posting account, open https://www.reddit.com/prefs/apps → "create another app…"
     name: forma-poster, type: script, redirect uri: http://localhost:8765/callback → create.
  2. Save the client id (under the app name) and secret to ~/.config/reddit_forma.json:
     {"client_id":"...","client_secret":"...","user_agent":"forma-poster/0.1 by <username>"}
  3. Run `python3 reddit_post.py auth` once: it opens a consent URL, you click Allow, a refresh token is stored.
Then: python3 reddit_post.py post <subreddit> "<title>" body.md [flair-text]
      python3 reddit_post.py comment <thing_id t3_xxx|t1_xxx> reply.md
"""
import json, os, sys, time, secrets, webbrowser, urllib.parse, urllib.request, base64, http.server
CFG=os.path.expanduser('~/.config/reddit_forma.json')
def cfg(): return json.load(open(CFG))
def save(d): json.dump(d,open(CFG,'w'),indent=1)
def basic(c): return 'Basic '+base64.b64encode(f"{c['client_id']}:{c['client_secret']}".encode()).decode()
def token(c):
    if c.get('access_exp',0)>time.time()+60: return c['access_token']
    data=urllib.parse.urlencode({'grant_type':'refresh_token','refresh_token':c['refresh_token']}).encode()
    req=urllib.request.Request('https://www.reddit.com/api/v1/access_token',data=data,headers={'Authorization':basic(c),'User-Agent':c['user_agent']})
    r=json.load(urllib.request.urlopen(req)); c['access_token']=r['access_token']; c['access_exp']=time.time()+r.get('expires_in',3600); save(c); return c['access_token']
def api(c,path,data=None):
    req=urllib.request.Request('https://oauth.reddit.com'+path,data=urllib.parse.urlencode(data).encode() if data else None,headers={'Authorization':'bearer '+token(c),'User-Agent':c['user_agent']})
    return json.load(urllib.request.urlopen(req))
def auth():
    c=cfg(); state=secrets.token_hex(8)
    url='https://www.reddit.com/api/v1/authorize?'+urllib.parse.urlencode({'client_id':c['client_id'],'response_type':'code','state':state,'redirect_uri':'http://localhost:8765/callback','duration':'permanent','scope':'submit read identity flair'})
    print('Open and click Allow:\n',url); webbrowser.open(url)
    code={}
    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(s):
            q=urllib.parse.parse_qs(urllib.parse.urlparse(s.path).query); code['v']=q.get('code',[None])[0]
            s.send_response(200); s.end_headers(); s.wfile.write(b'Done. You can close this tab.')
        def log_message(*a): pass
    http.server.HTTPServer(('localhost',8765),H).handle_request()
    data=urllib.parse.urlencode({'grant_type':'authorization_code','code':code['v'],'redirect_uri':'http://localhost:8765/callback'}).encode()
    req=urllib.request.Request('https://www.reddit.com/api/v1/access_token',data=data,headers={'Authorization':basic(c),'User-Agent':c['user_agent']})
    r=json.load(urllib.request.urlopen(req)); c['refresh_token']=r['refresh_token']; c['access_token']=r['access_token']; c['access_exp']=time.time()+r['expires_in']; save(c)
    print('authorized as', api(c,'/api/v1/me')['name'])
def post(sub,title,bodyfile,flair=None):
    c=cfg(); d={'sr':sub,'kind':'self','title':title,'text':open(bodyfile).read(),'api_type':'json','resubmit':'true'}
    if flair:
        for f in api(c,f'/r/{sub}/api/link_flair_v2'):
            if f['text'].lower()==flair.lower(): d['flair_id']=f['id']; break
    r=api(c,'/api/submit',d); j=r.get('json',{}); print(json.dumps(j.get('errors') or j.get('data'),indent=1))
def comment(thing,bodyfile):
    c=cfg(); r=api(c,'/api/comment',{'thing_id':thing,'text':open(bodyfile).read(),'api_type':'json'}); print(json.dumps(r.get('json',{}).get('errors') or 'ok'))
if __name__=='__main__':
    a=sys.argv[1:]
    if not a or a[0]=='auth': auth()
    elif a[0]=='post': post(a[1],a[2],a[3],a[4] if len(a)>4 else None)
    elif a[0]=='comment': comment(a[1],a[2])
