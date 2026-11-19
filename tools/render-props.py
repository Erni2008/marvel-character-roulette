"""Render original game props with Blender: blender -b -t 6 -P tools/render-props.py."""
import math
import bpy
from mathutils import Vector

def material(name, color, metal, rough):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    return m

def aim(obj, point):
    obj.rotation_euler = (Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

def setup(camera, scale, width, height):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.cycles.samples = 16
    s.cycles.use_denoising = True
    s.render.film_transparent = True
    s.render.resolution_x, s.render.resolution_y = width, height
    s.render.resolution_percentage = 100
    s.world.use_nodes = True
    s.world.node_tree.nodes['Background'].inputs[0].default_value = (.25,.31,.44,1)
    s.world.node_tree.nodes['Background'].inputs[1].default_value = .35
    bpy.ops.object.camera_add(location=camera)
    s.camera = bpy.context.object
    aim(s.camera, (0,0,0))
    s.camera.data.type = 'ORTHO'
    s.camera.data.ortho_scale = scale
    for point, power, size, color in [
        ((-3,2,5),420,4,(.74,.85,1)), ((4,1,3),240,3,(1,.72,.49)),
        ((0,-4,3),110,2,(1,.35,.28))]:
        bpy.ops.object.light_add(type='AREA', location=point)
        lamp=bpy.context.object
        lamp.data.energy, lamp.data.size, lamp.data.color=power,size,color
        aim(lamp,(0,0,0))

def finish(obj, mat, bevel):
    obj.data.materials.append(mat)
    if bevel:
        mod=obj.modifiers.new('Machined edge','BEVEL')
        mod.width=bevel
        mod.segments=3
        obj.modifiers.new('Face normals','WEIGHTED_NORMAL')

def ring(radius,width,z,mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius,minor_radius=width,major_segments=96,minor_segments=12,location=(0,0,z))
    obj=bpy.context.object
    finish(obj,mat,0)
    for face in obj.data.polygons: face.use_smooth=True

def save(name):
    bpy.context.scene.render.filepath='/tmp/roulette-'+name+'.png'
    bpy.ops.render.render(write_still=True)

graphite=material('Graphite',(.022,.03,.046),.5,.36)
rim=material('Palladium',(.55,.47,.35),.85,.27)
enamel=material('Oxblood enamel',(.28,.025,.05),.35,.32)
ink=material('Midnight enamel',(.035,.06,.092),.5,.34)

setup((0,0,7),3.2,448,640)
bpy.ops.mesh.primitive_cube_add()
card=bpy.context.object
card.dimensions=(2.19,3.15,.08)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
finish(card,graphite,.055)
for radius in (.51,.58,.72): ring(radius,.007,.042,rim)
for x,y,sx,sy in [(0,1.46,1,.006),(0,-1.46,1,.006),(-1,0,.006,1.46),(1,0,.006,1.46)]:
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,.043))
    line=bpy.context.object
    line.scale=(sx*2,sy*2,.005)
    finish(line,rim,0)
bpy.ops.object.text_add(location=(0,-.15,.045))
label=bpy.context.object
label.data.body='CR'
label.data.align_x='CENTER'
label.data.size=.45
label.data.extrude=.002
label.data.materials.append(rim)
save('card')
label.data.body='?'
label.data.size=.86
label.location.y=-.29
save('card-front')

setup((0,-4.2,5.5),4.35,768,680)
for radius,depth,z,mat in [(1.98,.2,-.13,graphite),(1.88,.07,.005,ink),(.97,.15,.1,graphite),(.76,.045,.19,rim),(.72,.05,.215,graphite)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=radius,depth=depth,location=(0,0,z))
    finish(bpy.context.object,mat,.022)
for radius,width,z in [(1.96,.031,-.047),(1.91,.016,.025),(1.78,.01,.085),(1.04,.018,.095),(.79,.014,.183)]:
    ring(radius,width,z,rim)
for i in range(24):
    start=math.tau*i/24+.012
    end=math.tau*(i+1)/24-.012
    angles=[start+(end-start)*j/5 for j in range(6)]
    outline=[(r*math.cos(a), r*math.sin(a)) for r,seq in [(1.08,angles),(1.75,angles[::-1])] for a in seq]
    n=len(outline)
    mesh=bpy.data.meshes.new('Enamel insert')
    mesh.from_pydata([(x,y,z) for z in (.035,.085) for x,y in outline],[],[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)])
    obj=bpy.data.objects.new('Enamel insert',mesh)
    bpy.context.collection.objects.link(obj)
    finish(obj,enamel if i%3==0 else ink,.009)
save('wheel')
