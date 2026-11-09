import * as THREE from 'three';
import { groundHeight, islandAt, riverAt } from '../core/world';
import { random } from '../core/math';

const CHUNK = 160;
export class Terrain {
  private chunks = new Map<number, THREE.Group>();
  private sand = new THREE.MeshStandardMaterial({
    color: 0xbba078,
    roughness: 1,
    flatShading: true,
    vertexColors: true,
  });
  private rock = new THREE.MeshStandardMaterial({
    color: 0x9a7858,
    roughness: 1,
    flatShading: true,
  });
  private leaf = new THREE.MeshStandardMaterial({
    color: 0x4b6552,
    roughness: 1,
    flatShading: true,
  });
  private trunk = new THREE.MeshStandardMaterial({ color: 0x655246, roughness: 1 });
  private concrete = new THREE.MeshStandardMaterial({ color: 0xb0ab97, roughness: 1 });
  private rockGeo = new THREE.IcosahedronGeometry(1, 0);
  private trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 7, 5);
  private leafGeo = new THREE.ConeGeometry(3.2, 6, 5);
  private boxGeo = new THREE.BoxGeometry(1, 1, 1);
  private waterMat: THREE.MeshPhongMaterial;
  private time = { value: 0 };
  constructor(private scene: THREE.Scene) {
    this.waterMat = new THREE.MeshPhongMaterial({
      color: 0x297f81,
      specular: 0x93c6b4,
      shininess: 85,
      transparent: false,
    });
    this.waterMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.time;
      shader.vertexShader = 'uniform float uTime; varying vec3 vRiver;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n vRiver = position; transformed.y += sin(position.z * 0.16 + uTime * 1.1) * 0.13 + sin(position.x * 0.32 + uTime) * 0.1;',
      );
      shader.fragmentShader = 'uniform float uTime; varying vec3 vRiver;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\n float wave=sin(vRiver.z*0.65+sin(vRiver.x*0.18)*3.0+uTime*1.8)*sin(vRiver.x*0.45-vRiver.z*0.13+uTime*0.6); diffuseColor.rgb += smoothstep(0.72,1.0,wave)*0.095;',
      );
    };
  }
  update(d: number, time: number) {
    this.time.value = time;
    const current = Math.floor(d / CHUNK);
    for (const [id, group] of this.chunks) {
      if (id < current - 2 || id > current + 10) {
        group.traverse((o) => {
          if (o instanceof THREE.Mesh && o.userData.ownGeometry) o.geometry.dispose();
          if (o instanceof THREE.InstancedMesh) o.dispose();
        });
        this.scene.remove(group);
        this.chunks.delete(id);
      }
    }
    for (let id = current - 2; id <= current + 10; id++) {
      if (!this.chunks.has(id)) {
        const group = this.build(id);
        this.chunks.set(id, group);
        this.scene.add(group);
      }
    }
  }
  private buildIsland(id: number) {
    const positions: number[] = [],
      colors: number[] = [];
    const columns = [-1, -0.87, -0.55, 0, 0.55, 0.87, 1];
    // Each strip uses the same world samples as the banks, including chunk seams.
    // Collapsed tips emit only real triangles, so every normal still faces up.
    for (let row = 0; row < 10; row++) {
      const start = id * CHUNK + row * 16;
      const first = islandAt(start),
        last = islandAt(start + 16);
      if (!first && !last) continue;
      const samples = [first, last].map((island, index) => {
        const d = start + index * 16;
        const center = island?.center ?? (first ?? last)!.center;
        return columns.map((column) => {
          const x = center + column * (island?.halfWidth ?? 0);
          return [x, island ? groundHeight(x, d) : 0, -d];
        });
      });
      const triangle = (a: number[], b: number[], c: number[], shore: boolean) => {
        const up = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
        if (up <= 0.00001) return;
        const color = new THREE.Color(shore ? 0xd9cda6 : 0xaaa17b);
        positions.push(...a, ...b, ...c);
        for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
      };
      for (let col = 0; col < columns.length - 1; col++) {
        const shore = col === 0 || col === columns.length - 2;
        triangle(samples[0][col], samples[0][col + 1], samples[1][col], shore);
        triangle(samples[0][col + 1], samples[1][col + 1], samples[1][col], shore);
      }
    }
    if (!positions.length) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const island = new THREE.Mesh(geometry, this.sand);
    island.name = 'river-island';
    island.receiveShadow = true;
    island.castShadow = true;
    island.userData.ownGeometry = true;
    return island;
  }
  private build(id: number) {
    const group = new THREE.Group();
    const rng = random(id * 3517 + 572);
    for (const side of [-1, 1]) {
      const positions: number[] = [],
        colors: number[] = [],
        indices: number[] = [];
      const offsets = [0, 5, 17, 34, 60, 100, 170, 280, 460, 720];
      for (let row = 0; row <= 10; row++) {
        const d = id * CHUNK + (row * CHUNK) / 10;
        const river = riverAt(d);
        for (let col = 0; col < offsets.length; col++) {
          const x = river.center + side * (river.width / 2 + offsets[col]);
          positions.push(x, groundHeight(x, d), -d);
          const shade = 0.89 + rng() * 0.2;
          const c = new THREE.Color(
            col < 2 ? 0xd9cda6 : col < 4 ? 0xbaa783 : 0xa69a7c,
          ).multiplyScalar(shade);
          colors.push(c.r, c.g, c.b);
          if (row < 10 && col < offsets.length - 1) {
            const a = row * offsets.length + col,
              b = a + offsets.length;
            if (side === 1) indices.push(a, a + 1, b, a + 1, b + 1, b);
            else indices.push(a, b, a + 1, a + 1, b, b + 1);
          }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, this.sand);
      mesh.receiveShadow = true;
      mesh.userData.ownGeometry = true;
      group.add(mesh);
    }
    const island = this.buildIsland(id);
    if (island) group.add(island);
    const waterPos: number[] = [],
      waterIndices: number[] = [];
    for (let i = 0; i <= 10; i++) {
      const d = id * CHUNK + (i * CHUNK) / 10;
      const r = riverAt(d);
      waterPos.push(r.center - r.width / 2 - 0.7, 0, -d, r.center + r.width / 2 + 0.7, 0, -d);
      if (i < 10) {
        const a = i * 2;
        waterIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(waterPos, 3));
    wg.setIndex(waterIndices);
    wg.computeVertexNormals();
    const water = new THREE.Mesh(wg, this.waterMat);
    water.receiveShadow = true;
    water.userData.ownGeometry = true;
    group.add(water);
    const rocks = new THREE.InstancedMesh(this.rockGeo, this.rock, 34);
    const trunks = new THREE.InstancedMesh(this.trunkGeo, this.trunk, 38);
    const leaves = new THREE.InstancedMesh(this.leafGeo, this.leaf, 38);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 30; i++) {
      const d = id * CHUNK + rng() * CHUNK;
      const r = riverAt(d);
      const side = rng() < 0.5 ? -1 : 1;
      const x = r.center + side * (r.width / 2 + 24 + rng() * 140);
      const y = groundHeight(x, d);
      const s = 0.75 + rng() * 0.9;
      dummy.position.set(x, y + 3.3 * s, -d);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(0, rng() * 6, 0);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      dummy.position.y = y + 7 * s;
      dummy.scale.set(s * 1.3, s, s * 1.3);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
      if (i < 26) {
        const rx = x + side * 10,
          rd = d + 4;
        dummy.position.set(rx, groundHeight(rx, rd) + 1, -rd);
        dummy.scale.set(3 + rng() * 7, 2 + rng() * 5, 3 + rng() * 8);
        dummy.rotation.set(rng(), rng() * 6, rng());
        dummy.updateMatrix();
        rocks.setMatrixAt(i, dummy.matrix);
      }
    }
    let islandTrees = 0;
    for (let i = 0; i < 8; i++) {
      const d = id * CHUNK + 10 + i * 20;
      const land = islandAt(d);
      if (!land || land.halfWidth < 10 || land.height < 5) continue;
      const x = land.center + (rng() - 0.5) * land.halfWidth;
      const y = groundHeight(x, d),
        s = 0.6 + rng() * 0.5;
      dummy.position.set(x, y + 3.3 * s, -d);
      dummy.rotation.set(0, rng() * 6, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      trunks.setMatrixAt(30 + islandTrees, dummy.matrix);
      dummy.position.y = y + 7 * s;
      dummy.scale.set(s * 1.3, s, s * 1.3);
      dummy.updateMatrix();
      leaves.setMatrixAt(30 + islandTrees, dummy.matrix);
      const rx = land.center - (x - land.center);
      dummy.position.set(rx, groundHeight(rx, d) + 0.8, -d);
      dummy.scale.set(2 + rng() * 2, 1.5 + rng() * 2, 2 + rng() * 3);
      dummy.rotation.set(rng(), rng() * 6, rng());
      dummy.updateMatrix();
      rocks.setMatrixAt(26 + islandTrees, dummy.matrix);
      islandTrees++;
    }
    trunks.count = leaves.count = 30 + islandTrees;
    rocks.count = 26 + islandTrees;
    trunks.castShadow = true;
    leaves.castShadow = true;
    rocks.castShadow = true;
    group.add(rocks, trunks, leaves);
    if (id % 3 === 0) {
      const d = id * CHUNK + 80,
        r = riverAt(d),
        side = id % 2 === 0 ? 1 : -1;
      for (let i = 0; i < 3; i++) {
        const x = r.center + side * (r.width / 2 + 64 + i * 12),
          y = groundHeight(x, d);
        const building = new THREE.Mesh(this.boxGeo, this.concrete);
        building.position.set(x, y + 3, -d);
        building.scale.set(9, 6 + i * 2, 14);
        building.castShadow = true;
        group.add(building);
      }
    }
    return group;
  }
  get chunkCount() {
    return this.chunks.size;
  }
}
