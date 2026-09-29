"""Generate modern practice centerlines from bundled Noto glyphs (OFL).
Requires Pillow and NumPy only; not part of npm build. Paths are geometric
construction suggestions, not a reconstruction of ancient stroke order.
"""
from pathlib import Path
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
S=256

def thin(a):
    a=a.copy()
    while True:
        changed=False
        for step in (0,1):
            p=[np.roll(np.roll(a,dy,0),dx,1) for dy,dx in [(1,0),(1,-1),(0,-1),(-1,-1),(-1,0),(-1,1),(0,1),(1,1)]]
            n=sum(x.astype(int) for x in p)
            transitions=sum((~p[i]&p[(i+1)%8]).astype(int) for i in range(8))
            c=(~(p[0]&p[2]&p[4])&~(p[2]&p[4]&p[6])) if not step else (~(p[0]&p[2]&p[6])&~(p[0]&p[4]&p[6]))
            remove=a&(n>=2)&(n<=6)&(transitions==1)&c
            if remove.any(): a[remove]=False;changed=True
        if not changed:return a

def simplify(p,eps=1.3):
    if len(p)<=2:return p
    a,b=np.array(p[0]),np.array(p[-1]);d=b-a
    ds=[np.linalg.norm(np.array(x)-a) if not np.dot(d,d) else np.linalg.norm(np.array(x)-(a+d*np.clip(np.dot(np.array(x)-a,d)/np.dot(d,d),0,1))) for x in p]
    k=int(np.argmax(ds))
    return simplify(p[:k+1],eps)[:-1]+simplify(p[k:],eps) if ds[k]>eps else [p[0],p[-1]]

def paths(mask):
    pixels=set(zip(*np.where(thin(mask))))
    adj={p:set() for p in pixels}
    for y,x in pixels:
        for dy,dx in [(0,1),(1,-1),(1,0),(1,1)]:
            q=(y+dy,x+dx)
            if q not in pixels:continue
            # Do not add diagonal shortcuts around orthogonal corners.
            if dy and dx and ((y+dy,x) in pixels or (y,x+dx) in pixels):continue
            adj[(y,x)].add(q);adj[q].add((y,x))
    out=[]
    while any(adj.values()):
        ends=[p for p,ns in adj.items() if len(ns)==1]
        start=min(ends or [p for p,ns in adj.items() if ns]);path=[start];prev=None;p=start
        while adj[p]:
            if prev is None:q=min(adj[p])
            else:
                # Follow the straightest continuation at an intersection.
                dy,dx=p[0]-prev[0],p[1]-prev[1]
                q=max(sorted(adj[p]),key=lambda n:((n[0]-p[0])*dy+(n[1]-p[1])*dx)/math.hypot(n[0]-p[0],n[1]-p[1]))
            adj[p].remove(q);adj[q].remove(p);path.append(q)
            # Direction from a short lookback is more stable than one pixel.
            prev=path[max(0,len(path)-5)];p=q
        length=sum(math.dist(a,b) for a,b in zip(path,path[1:]))
        if length>6:out.append(simplify(path))
    return sorted(out,key=lambda p:(min(x[0] for x in p)//24,min(x[1] for x in p)))

text=(ROOT/'src/content/signs.ts').read_text()
signs=json.loads(text[text.index('= [')+2:text.index('\n];')+2])
fontpath=str(ROOT/'public/fonts/NotoSansLinearB-Regular.otf')
allguides={};montage=Image.new('RGB',(8*160,math.ceil(len(signs)/8)*190),'#fffdf8');md=ImageDraw.Draw(montage)
for i,s in enumerate(signs):
    f=ImageFont.truetype(fontpath,round(S*.65));box=f.getbbox(s['glyph'],anchor='ls');w,h=box[2]-box[0],box[3]-box[1]
    factor=min(1,S*.76/max(w,1),S*.76/max(h,1));f=ImageFont.truetype(fontpath,round(S*.65*factor));b=f.getbbox(s['glyph'],anchor='ls')
    img=Image.new('L',(S,S));d=ImageDraw.Draw(img);d.text((S/2-(b[0]+b[2])/2,S/2-(b[1]+b[3])/2),s['glyph'],font=f,anchor='ls',fill=255)
    ps=paths(np.array(img)>100)
    allguides[s['id']]=[[{'x':round(x/S,4),'y':round(y/S,4)} for y,x in p] for p in ps]
    tile=Image.new('RGB',(S,S),'#fffdf8');td=ImageDraw.Draw(tile);td.bitmap((0,0),img,fill='#dfd3bd')
    for j,p in enumerate(ps):
        td.line([(x,y) for y,x in p],fill=['#903c27','#357878','#7b5795','#56814a'][j%4],width=2)
        y,x=p[0];td.text((x-6,y-8),str(j+1),fill='#101010')
    xx,yy=(i%8)*160,(i//8)*190;montage.paste(tile.resize((160,160)),(xx,yy));md.text((xx+8,yy+163),s['id']+' / '+str(len(ps))+' segments',fill='#302920')
(ROOT/'src/writing/guides.json').write_text(json.dumps(allguides,separators=(',',':'))+'\n')
montage.save('/tmp/linear-b-guides.png')
print('Generated',len(allguides),'guides; segment counts',min(map(len,allguides.values())),max(map(len,allguides.values())))
