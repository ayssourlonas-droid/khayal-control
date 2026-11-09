"""Original procedural Delta Strike art. Run with Blender --background --python tools/build_models.py."""
import bpy, math, os, json
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public','models')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
ivory=mat('Pearl ceramic aluminum',(.73,.79,.81),.68,.3); edge=mat('Cold silver leading edges',(.4,.53,.61),.8,.25)
navy=mat('Deep midnight glass',(.014,.045,.075),.68,.17); dark=mat('Carbon exhaust',(.024,.031,.037),.65,.5)
orange=mat('Vermilion identification',(.95,.16,.035),.3,.34); red=mat('Enemy crimson',(.38,.035,.028),.55,.37)
olive=mat('Olive armor',(.19,.24,.13),.38,.5); boatmat=mat('Blue naval steel',(.11,.18,.24),.6,.42)
concrete=mat('Warm concrete',(.46,.46,.41),0,.85); road=mat('Asphalt',(.075,.09,.1),0,.95); white=mat('Warm navigation white',(.94,.85,.63),.25,.4)

def mesh(name,verts,faces,material):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);o.data.materials.append(material);return o

def box(name,loc,scale,material,bevel=.07):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if bevel:
  mod=o.modifiers.new('Manufactured edge highlights','BEVEL');mod.width=bevel;mod.segments=1;o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 return o

def prism(name,poly,z0,z1,material):
 n=len(poly); return mesh(name,[(x,y,z0) for x,y in poly]+[(x,y,z1) for x,y in poly],[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],material)

def cyl(name,loc,radius,depth,material,axis=None,vertices=12):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(material)
 if axis:o.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler()
 return o

def fuselage(name,material):
 rings=[(-6,.75,.28),(-4.5,1.12,.46),(-1,1,.56),(2.6,.62,.48),(5,.29,.18),(6.5,.025,.035)]
 verts=[]
 for y,w,h in rings:
  verts.extend([(w*math.cos(i*math.tau/8),y,h*math.sin(i*math.tau/8)) for i in range(8)])
 faces=[tuple(reversed(range(8))),tuple(range(40,48))]
 for j in range(len(rings)-1):
  for i in range(8):faces.append((j*8+i,j*8+(i+1)%8,(j+1)*8+(i+1)%8,(j+1)*8+i))
 return mesh(name,verts,faces,material)

def fighter(enemy=False):
 base=red if enemy else ivory
 fuselage('Faceted lifting fuselage',base)
 for s in [-1,1]:
  prism('Swept delta wing '+str(s),[(s*.55,3.1),(s*5,-4.4),(s*4.5,-5.2),(s*.7,-3.7)],-.15,.03,base)
  prism('Silver leading-edge rail '+str(s),[(s*.6,3),(s*5,-4.4),(s*4.65,-4.3),(s*.6,2.5)],.035,.068,edge)
  prism('Orange wing slash '+str(s),[(s*2.65,-1.75),(s*3.12,-2.4),(s*3.8,-4.85),(s*3.15,-4.6)],.075,.088,orange)
  prism('Inset elevon '+str(s),[(s*1.35,-3.5),(s*3,-4.35),(s*2.8,-4.6),(s*1.3,-4)],.08,.105,edge)
  cyl('Twin jet exhaust '+str(s),(s*.57,-5.95,.03),.42,.55,dark,(0,1,0))
  cyl('Exhaust inner ember '+str(s),(s*.57,-6.235,.03),.24,.01,orange,(0,1,0))
  # canted vertical tail
  mesh('Canted tail stabilizer '+str(s),[(s*.65,-5,.2),(s*.9,-2.65,.35),(s*1.25,-4,1.65),(s*1.3,-5.5,1.25)],[(0,1,2,3)],base)
  box('Shoulder intake '+str(s),(s*.86,-.95,.12),(.45,1.15,.57),dark)
 prism('Navy armored canopy',[(-.47,.3),(-.43,2),(-.15,3.1),(.15,3.1),(.43,2),(.47,.3)],.4,.91,navy)
 box('Canopy spine',(0,.28,.82),(.075,.3,.18),edge,.015)
 prism('Nose identification stripe',[(-.12,3.1),(0,5.8),(.12,3.1)],.38,.395,orange)

def boat():
 prism('Deep angular hull',[(-2.65,-8.5),(2.65,-8.5),(3,4.8),(0,8.5),(-3,4.8)],-.7,.65,boatmat)
 prism('Raised perimeter deck',[(-2.45,-8),(2.45,-8),(2.7,4.6),(0,8),(-2.7,4.6)],.65,.83,edge)
 box('Armored cabin',(0,-1.4,1.6),(3.3,4.2,1.6),boatmat,.18)
 box('Bridge windows front',(0,.74,1.87),(2.8,.05,.55),navy,.01)
 for s in [-1,1]:box('Bridge side windows',(s*1.67,-1.1,1.88),(.04,2.8,.55),navy,.01)
 cyl('Turret ring',(0,4,1),1.1,.4,dark)
 box('Forward gun turret',(0,4,1.55),(1.5,1.9,.8),boatmat,.18)
 cyl('Naval gun barrel',(0,6,1.8),.15,2.7,dark,(0,1,.08))
 cyl('Radar mast',(0,-2,3.6),.085,3.4,edge)
 box('Radar array',(0,-2,5.1),(2.2,.17,.45),edge)
 for x in [-1.65,1.65]:
  for y in [-6.6,-4.8]:cyl('Deck ventilation',(x,y,1),.3,.4,dark)

def heli():
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,location=(0,.9,0));o=bpy.context.object;o.name='Armored helicopter cabin';o.scale=(1.35,2.65,1);o.data.materials.append(olive)
 prism('Wraparound cockpit',[(-1,1.4),(-.68,3.1),(.68,3.1),(1,1.4)],.1,.73,navy)
 mesh('Tapered tail boom',[(-.5,-1.1,-.15),(.5,-1.1,-.15),(.35,-1.1,.55),(-.35,-1.1,.55),(-.12,-6.2,.5),(.12,-6.2,.5),(.12,-6.2,.75),(-.12,-6.2,.75)],[(0,1,2,3),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2),(4,7,6,5)],olive)
 prism('Tail stabilizer',[(-1.8,-5),(1.8,-5),(1.2,-5.7),(-1.2,-5.7)],.55,.66,olive)
 box('Tail fin',(0,-5.8,1),(.15,1,1.5),olive)
 cyl('Rotor mast',(0,0,1.45),.13,1,dark)
 rotor=box('Rotor',(0,0,2),(9,.22,.08),dark,.015)
 other=box('Rotor cross blade',(0,0,2),(.22,9,.08),dark,.015);other.parent=rotor;other.matrix_parent_inverse=rotor.matrix_world.inverted()
 for s in [-1,1]:
  box('Landing skid',(s*1.2,.1,-1.1),(.15,4.6,.14),dark)
  for y in [-1,1.3]:box('Skid strut',(s*.98,y,-.75),(.14,.14,.8),edge)
 cyl('Tail rotor hub',(.28,-5.8,1),.13,.5,dark,(1,0,0))
 box('Tail rotor',(.56,-5.8,1),(.08,1.7,.12),dark)

def bridge():
 box('Concrete bridge deck',(0,0,11.5),(110,10,1),concrete,.12)
 box('Road surface',(0,0,12.04),(110,8.4,.08),road,.01)
 for y in [-4.7,4.7]:box('Continuous parapet',(0,y,12.55),(110,.4,1.1),concrete,.05)
 for x in [-45,-25,0,25,45]:
  for y in [-3.5,3.5]:box('Tapered concrete pier',(x,y,5.7),(2.6,2.8,11.4),concrete,.12)
 for x in range(-52,54,6):box('Lane paint',(x,0,12.1),(3,.14,.02),white,0)

report={}
for name,build in [('player',lambda:fighter(False)),('jet',lambda:fighter(True)),('boat',boat),('helicopter',heli),('bridge',bridge)]:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 build();bpy.context.view_layer.update()
 verts=[o.matrix_world@Vector(corner) for o in bpy.context.scene.objects if o.type=='MESH' for corner in o.bound_box]
 dims=[max(v[i] for v in verts)-min(v[i] for v in verts) for i in range(3)]
 report[name]={'dimensions_blender_xyz':dims,'dimensions_gltf_xyz':[dims[0],dims[2],dims[1]],'objects':[o.name for o in bpy.context.scene.objects]}
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art',name+'.blend'))
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',export_apply=True)
with open(os.path.join(ROOT,'art','model-report.json'),'w') as f:json.dump(report,f,indent=2)
print('ASSET_REPORT',json.dumps({k:v['dimensions_gltf_xyz'] for k,v in report.items()}))
