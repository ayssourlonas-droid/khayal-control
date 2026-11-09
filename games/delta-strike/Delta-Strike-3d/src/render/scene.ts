import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Terrain } from './terrain';
import { direction, damp, type Vec3 } from '../core/math';
import { bridgeWidth, riverAt, type EntityKind } from '../core/world';
import type { Simulation, GameEvent } from '../core/simulation';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  max: number;
}
export class GameScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(58, 1, 0.5, 2200);
  private terrain: Terrain;
  private sun: THREE.DirectionalLight;
  private templates = new Map<string, THREE.Group>();
  private entities = new Map<number, THREE.Group>();
  private projectiles = new Map<number, THREE.Mesh>();
  private entityTemplates = new Map<EntityKind, THREE.Group>();
  private particles: Particle[] = [];
  private player = new THREE.Group();
  private exhaust = new THREE.Group();
  private bulletGeometry = new THREE.SphereGeometry(0.5, 5, 4);
  private flameGeometry = new THREE.ConeGeometry(0.65, 4.5, 8);
  private bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffe7a0 });
  private enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff593e });
  private missileMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  private smokeGeometry = new THREE.IcosahedronGeometry(1, 0);
  private smokeMaterial = new THREE.MeshBasicMaterial({ color: 0xffa356, transparent: true });
  private flameMaterial = new THREE.MeshBasicMaterial({
    color: 0x93dce7,
    transparent: true,
    opacity: 0.85,
  });
  private markerMat = new THREE.MeshBasicMaterial({
    color: 0x7be4bd,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  private reticleWorld = new THREE.Vector3();
  private cameraTarget = new THREE.Vector3();
  private lookTarget = new THREE.Vector3();
  private shake = 0;
  private titleTime = 0;
  private lastPhase = '';
  private sector = -1;
  private jetRotation = new THREE.Euler();
  reducedMotion = false;
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.scene.background = new THREE.Color(0xa8c8ca);
    this.scene.fog = new THREE.FogExp2(0xa8c8ca, 0.00155);
    this.scene.add(new THREE.HemisphereLight(0xd9eef0, 0x7c684c, 2.5));
    this.sun = new THREE.DirectionalLight(0xffe7c6, 3.4);
    this.sun.position.set(-160, 240, 120);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -160,
      right: 160,
      top: 180,
      bottom: -120,
      near: 1,
      far: 650,
    });
    this.sun.shadow.bias = -0.0008;
    this.sun.shadow.normalBias = 0.6;
    this.scene.add(this.sun, this.sun.target);
    this.terrain = new Terrain(this.scene);
    this.scene.add(this.player);
    for (const x of [-1.15, 1.15]) {
      const flame = new THREE.Mesh(this.flameGeometry, this.flameMaterial);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0, 7);
      this.exhaust.add(flame);
    }
    this.player.add(this.exhaust);
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1800, 24, 12),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color(0x638eaa) },
          bottom: { value: new THREE.Color(0xd6e2d8) },
        },
        vertexShader:
          'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:
          'uniform vec3 top;uniform vec3 bottom;varying vec3 vPosition;void main(){float h=normalize(vPosition).y;gl_FragColor=vec4(mix(bottom,top,smoothstep(-0.06,0.8,h)),1.0);}',
      }),
    );
    sky.name = 'sky';
    this.scene.add(sky);
    this.resize();
  }
  async load(onProgress: (n: number) => void) {
    const loader = new GLTFLoader();
    let loaded = 0;
    const kinds = ['player', 'boat', 'helicopter', 'jet', 'bridge'];
    await Promise.all(
      kinds.map(async (kind) => {
        const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${kind}.glb`);
        gltf.scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        this.templates.set(kind, gltf.scene);
        onProgress(++loaded / kinds.length);
      }),
    );
    const mesh = this.templates.get('player')!.clone(true);
    this.player.add(mesh);
  }
  resize() {
    const w = window.innerWidth,
      h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
  setQuality(high: boolean) {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, high ? 1.75 : 1));
    this.renderer.shadowMap.enabled = high;
    this.resize();
  }
  private makeEntity(kind: EntityKind) {
    const cached = this.entityTemplates.get(kind);
    if (cached) return cached.clone(true);
    const group = new THREE.Group();
    if (kind === 'fuel') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 0.45, 6, 40), this.markerMat);
      group.add(ring);
      const inner = new THREE.Mesh(new THREE.TorusGeometry(11.7, 0.1, 4, 40), this.markerMat);
      group.add(inner);
      const depot = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 3, 12),
        new THREE.MeshStandardMaterial({ color: 0xa3c7ac, metalness: 0.25, roughness: 0.55 }),
      );
      depot.position.set(0, -9, 0);
      group.add(depot);
      const cross = new THREE.Group();
      for (const s of [
        [4, 0.3, 1],
        [1, 0.3, 4],
      ]) {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(...(s as [number, number, number])),
          this.markerMat,
        );
        m.position.y = -7.4;
        cross.add(m);
      }
      group.add(cross);
    } else {
      const model = this.templates.get(kind)!.clone(true);
      if (kind === 'bridge') {
        model.name = 'bridge-span';
        model.position.y = -19;
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(9, 16, 7),
          new THREE.MeshStandardMaterial({ color: 0x656f68, roughness: 0.7 }),
        );
        tower.position.y = 0;
        tower.castShadow = true;
        group.add(tower);
        const light = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 7.2), this.enemyMaterial);
        light.position.y = 6;
        group.add(light);
      }
      group.add(model);
    }
    this.entityTemplates.set(kind, group);
    return group.clone(true);
  }
  effects(events: GameEvent[]) {
    for (const event of events) {
      if (event.kind === 'hit') {
        this.shake = 0.55;
        continue;
      }
      if (event.kind !== 'explosion') continue;
      if (event.size > 5) this.shake = Math.max(this.shake, 0.22);
      for (let i = 0; i < Math.min(25, event.size * 2); i++) {
        if (this.particles.length >= 180) {
          const old = this.particles.shift()!;
          this.scene.remove(old.mesh);
          old.mesh.material instanceof THREE.Material && old.mesh.material.dispose();
        }
        const material = this.smokeMaterial.clone();
        material.color.set(i % 3 === 0 ? 0x4e534c : i % 2 === 0 ? 0xffd39a : 0xef7741);
        const mesh = new THREE.Mesh(this.smokeGeometry, material);
        mesh.position.set(event.pos.x, event.pos.y, event.pos.z);
        const s = event.size * (0.05 + Math.random() * 0.11);
        mesh.scale.setScalar(s);
        const max = 0.4 + Math.random() * 0.8;
        this.particles.push({
          mesh,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * event.size,
            Math.random() * event.size,
            (Math.random() - 0.5) * event.size,
          ),
          life: max,
          max,
        });
        this.scene.add(mesh);
      }
    }
  }
  render(sim: Simulation, dt: number, alpha: number) {
    const title = sim.phase === 'title';
    const active = sim.phase === 'playing';
    const p = sim.player;
    if (title) this.titleTime += dt;
    const titleD = 140 + this.titleTime * 18;
    const pos = title
      ? { x: riverAt(titleD).center + 12, y: 32 + Math.sin(this.titleTime * 0.3) * 2, z: -titleD }
      : p.pos;
    const distance = -pos.z;
    this.terrain.update(distance, sim.time + this.titleTime);
    const sky = this.scene.getObjectByName('sky')!;
    sky.position.copy(this.camera.position);
    const moving = active && this.lastPhase === sim.phase;
    this.player.position.set(
      moving ? THREE.MathUtils.lerp(p.previous.x, pos.x, alpha) : pos.x,
      moving ? THREE.MathUtils.lerp(p.previous.y, pos.y, alpha) : pos.y,
      moving ? THREE.MathUtils.lerp(p.previous.z, pos.z, alpha) : pos.z,
    );
    this.jetRotation.set(
      title ? 0.04 : p.pitch,
      title ? 0.04 : -p.yaw,
      title ? -0.12 - Math.sin(this.titleTime * 0.4) * 0.04 : -p.roll,
      'YXZ',
    );
    this.player.rotation.copy(this.jetRotation);
    this.player.visible = sim.phase !== 'crashed' && sim.phase !== 'lost';
    this.exhaust.scale.z =
      active && p.speed > 80 ? 2.2 : 1 + Math.sin((sim.time + this.titleTime) * 40) * 0.1;
    this.sun.position.set(pos.x - 170, 250, pos.z + 100);
    this.sun.target.position.set(pos.x, 0, pos.z - 80);
    this.sun.target.updateMatrixWorld();
    if (title) {
      this.cameraTarget.set(pos.x + 22, pos.y + 19, pos.z + 46);
      this.lookTarget.set(pos.x - (this.camera.aspect < 0.85 ? 42 : 72), 12, pos.z - 70);
    } else {
      const forward = direction(p.yaw, 0);
      this.cameraTarget.set(pos.x - forward.x * 36, pos.y + 12, pos.z - forward.z * 36);
      this.lookTarget.set(
        pos.x + forward.x * 90,
        pos.y + Math.sin(p.pitch) * 45 + 1,
        pos.z + forward.z * 90,
      );
    }
    const snap = this.lastPhase !== sim.phase || this.sector !== sim.sector;
    if (snap) {
      this.camera.position.copy(this.cameraTarget);
      this.camera.lookAt(this.lookTarget);
    } else {
      this.camera.position.lerp(this.cameraTarget, 1 - Math.exp(-dt * (title ? 2 : 5)));
      this.camera.lookAt(this.lookTarget);
    }
    this.shake = damp(this.shake, 0, 5, dt);
    if (!this.reducedMotion && this.shake > 0.005) {
      this.camera.position.x += (Math.random() - 0.5) * this.shake;
      this.camera.position.y += (Math.random() - 0.5) * this.shake;
    }
    this.camera.fov = damp(
      this.camera.fov,
      title ? 52 : !this.reducedMotion && p.speed > 80 ? 65 : 58,
      3,
      dt,
    );
    this.camera.updateProjectionMatrix();
    const liveIds = new Set<number>();
    for (const e of sim.entities) {
      if (e.kind === 'jet' && !e.crossing) continue;
      if (!e.active || e.pos.z > pos.z + 100 || e.pos.z < pos.z - 1250) continue;
      liveIds.add(e.id);
      let obj = this.entities.get(e.id);
      if (!obj) {
        obj = this.makeEntity(e.kind);
        this.entities.set(e.id, obj);
        this.scene.add(obj);
      }
      obj.position.set(e.pos.x, e.pos.y, e.pos.z);
      if (e.kind === 'bridge')
        obj.getObjectByName('bridge-span')!.scale.x = bridgeWidth(-e.pos.z) / 110;
      const rotor = obj.getObjectByName('Rotor');
      if (rotor) rotor.rotation.y = (sim.time + this.titleTime) * 32;
      if (e.kind === 'jet') {
        obj.rotation.y = (-e.travelDirection * Math.PI) / 2;
        obj.rotation.z = -e.travelDirection * 0.12;
      }
    }
    for (const [id, obj] of this.entities)
      if (!liveIds.has(id)) {
        this.scene.remove(obj);
        this.entities.delete(id);
      }
    const ids = new Set<number>();
    for (const b of sim.bullets) {
      ids.add(b.id);
      let mesh = this.projectiles.get(b.id);
      if (!mesh) {
        mesh = new THREE.Mesh(
          this.bulletGeometry,
          b.enemy ? this.enemyMaterial : b.missile ? this.missileMaterial : this.bulletMaterial,
        );
        this.projectiles.set(b.id, mesh);
        this.scene.add(mesh);
      }
      mesh.position.set(b.pos.x, b.pos.y, b.pos.z);
      mesh.scale.set(b.missile ? 0.9 : 0.55, b.missile ? 0.9 : 0.55, b.missile ? 4 : 3);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(b.velocity.x, b.velocity.y, b.velocity.z).normalize(),
      );
    }
    for (const [id, mesh] of this.projectiles)
      if (!ids.has(id)) {
        this.scene.remove(mesh);
        this.projectiles.delete(id);
      }
    if (active || sim.phase === 'crashed' || sim.phase === 'lost' || title) {
      for (const particle of this.particles) {
        particle.life -= dt;
        particle.mesh.position.addScaledVector(particle.velocity, dt);
        particle.mesh.scale.multiplyScalar(1 + dt * 0.9);
        (particle.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          particle.life / particle.max,
        );
      }
      this.particles = this.particles.filter((particle) => {
        if (particle.life > 0) return true;
        this.scene.remove(particle.mesh);
        (particle.mesh.material as THREE.Material).dispose();
        return false;
      });
    }
    this.lastPhase = sim.phase;
    this.sector = sim.sector;
    this.renderer.render(this.scene, this.camera);
  }
  project(pos: Vec3) {
    this.reticleWorld.set(pos.x, pos.y, pos.z).project(this.camera);
    return {
      x: (this.reticleWorld.x * 0.5 + 0.5) * innerWidth,
      y: (-this.reticleWorld.y * 0.5 + 0.5) * innerHeight,
      visible: this.reticleWorld.z < 1 && this.reticleWorld.z > -1,
    };
  }
  get stats() {
    return {
      chunks: this.terrain.chunkCount,
      geometries: this.renderer.info.memory.geometries,
      drawCalls: this.renderer.info.render.calls,
    };
  }
}
