import json,os,uuid
def it(kind,name,text,x,y,w,h,ev=None,bg='#ffffff',color='#222222',**kw):
    d={"id":str(uuid.uuid4()),"kind":kind,"name":name,"text":text,"x":x,"y":y,"width":f"{w}px","height":f"{h}px","bg":bg,"color":color,"events":ev or {}}
    d.update(kw); return d
def proj(name,pages,fw='none',theme='#20242a'):
    ps=[]
    for pg in pages:
        n,i=pg[0],pg[1]; d={"id":str(uuid.uuid4()),"name":n,"items":i}
        if len(pg)>2: d["events"]={"onload":pg[2].get("onload",""),"onshow":pg[2].get("onshow","")}
        ps.append(d)
    return {"name":name,"projectVersion":"1.0.0","icon":"","favicon":"","themeColor":theme,"type":"app","framework":fw,"titlebar":True,"active":0,"pages":ps}
def save(fn,p):
    for pg in p['pages']:
        for i in pg['items']: i['y']+=56; i['x']=round(i['x']*.84); i['width']=str(round(float(i['width'][:-2])*.84))+'px'  # abaixo da TitleBar (52px) e dentro dos 390px da página
    dest=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','examples',fn+'.flowmobile')
    json.dump(p,open(dest,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
BTN='#2563eb'
