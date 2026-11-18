import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export interface SceneProps {
  phase: 'idle' | 'spin' | 'reveal';
  motion: boolean;
  active: boolean;
  quality: 'auto' | 'high' | 'low';
  onError: () => void;
  onReady: () => void;
  onStill: (image: string) => void;
}
export default function ChamberScene(props: SceneProps) {
  const mount = useRef<HTMLDivElement>(null),
    latest = useRef(props),
    wake = useRef<() => void>(() => {});
  useEffect(() => {
    latest.current = props;
    wake.current();
  }, [props]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        preserveDrawingBuffer: !props.motion,
      });
    } catch {
      latest.current.onError();
      return;
    }
    const low =
      props.quality === 'low' ||
      (props.quality === 'auto' &&
        ((navigator.hardwareConcurrency || 4) <= 4 || matchMedia('(pointer:coarse)').matches));
    renderer.setPixelRatio(Math.min(devicePixelRatio, low ? 1.15 : 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(37, 1, 0.1, 40);
    // A procedural studio environment gives metal real reflections without HDR downloads.
    const studio = new RoomEnvironment();
    const generator = new THREE.PMREMGenerator(renderer);
    const environment = generator.fromScene(studio, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.38;
    studio.dispose();
    generator.dispose();
    camera.position.set(0.15, 2.5, 10.3);
    camera.lookAt(0, 2.25, 0);
    const root = new THREE.Group();
    scene.add(root);
    const materials: THREE.Material[] = [];
    const metal = (color: number, roughness = 0.4, metalness = 0.7) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      materials.push(m);
      return m;
    };
    const dark = metal(0x252c39, 0.36, 0.76),
      edge = metal(0x646d7a, 0.26, 0.8),
      black = metal(0x10141c, 0.48, 0.65),
      bronze = metal(0xa27c43, 0.3, 0.75),
      lit = new THREE.MeshBasicMaterial({ color: 0xe83246 }),
      gold = new THREE.MeshBasicMaterial({ color: 0xd9ac60 });
    materials.push(lit, gold);
    const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D = root) => {
      const object = new THREE.Mesh(g, m);
      parent.add(object);
      return object;
    };
    const hero = new THREE.Group();
    hero.position.y = 0.25;
    root.add(hero);
    // An original faceted study of a human form, not a copyrighted character model.
    function part(
      g: THREE.BufferGeometry,
      m: THREE.Material,
      x: number,
      y: number,
      z: number,
      sx = 1,
      sy = 1,
      sz = 1,
    ) {
      const obj = mesh(g, m, hero);
      obj.position.set(x, y, z);
      obj.scale.set(sx, sy, sz);
      return obj;
    }
    part(new THREE.IcosahedronGeometry(0.39, 1), edge, 0, 4.05, 0, 0.78, 1.25, 0.83);
    const torsoShape = new THREE.Shape();
    torsoShape.moveTo(-0.36, 0);
    torsoShape.lineTo(-0.47, 0.65);
    torsoShape.lineTo(-0.84, 1.35);
    torsoShape.lineTo(-0.4, 1.53);
    torsoShape.lineTo(0.4, 1.53);
    torsoShape.lineTo(0.84, 1.35);
    torsoShape.lineTo(0.47, 0.65);
    torsoShape.lineTo(0.36, 0);
    torsoShape.closePath();
    part(
      new THREE.ExtrudeGeometry(torsoShape, {
        depth: 0.4,
        bevelEnabled: true,
        bevelSize: 0.075,
        bevelThickness: 0.06,
        bevelSegments: 1,
        steps: 1,
      }),
      dark,
      0,
      2.16,
      -0.22,
    );
    part(new THREE.CylinderGeometry(0.2, 0.26, 0.19, 6), black, 0, 3.77, 0);
    part(new THREE.DodecahedronGeometry(0.48, 0), dark, 0, 2.0, 0, 1, 0.55, 0.65);
    for (const sign of [-1, 1]) {
      const shoulder = part(
        new THREE.IcosahedronGeometry(0.33, 0),
        edge,
        sign * 0.77,
        3.45,
        0,
        1,
        0.9,
        0.9,
      );
      shoulder.rotation.z = sign * -0.25;
      const arm = part(new THREE.CylinderGeometry(0.18, 0.14, 0.83, 5), dark, sign * 0.95, 2.98, 0);
      arm.rotation.z = sign * 0.26;
      const forearm = part(
        new THREE.CylinderGeometry(0.16, 0.11, 0.73, 5),
        edge,
        sign * 1.12,
        2.28,
        0.03,
      );
      forearm.rotation.z = sign * 0.13;
      part(new THREE.DodecahedronGeometry(0.15, 0), black, sign * 1.17, 1.86, 0.04, 0.8, 1.4, 1);
      const thigh = part(
        new THREE.CylinderGeometry(0.24, 0.17, 0.88, 6),
        dark,
        sign * 0.29,
        1.48,
        0,
      );
      thigh.rotation.z = sign * -0.07;
      part(new THREE.IcosahedronGeometry(0.2, 0), edge, sign * 0.33, 1.02, 0.03, 1, 0.8, 1);
      const shin = part(
        new THREE.CylinderGeometry(0.16, 0.12, 0.74, 5),
        dark,
        sign * 0.35,
        0.59,
        0,
      );
      shin.rotation.z = sign * -0.035;
      part(new THREE.BoxGeometry(0.31, 0.22, 0.62), black, sign * 0.38, 0.17, 0.14);
      const seam = part(
        new THREE.BoxGeometry(0.018, 0.43, 0.012),
        bronze,
        sign * 0.35,
        2.99,
        0.285,
      );
      seam.rotation.z = sign * -0.27;
    }
    const sternum = part(
      new THREE.OctahedronGeometry(0.13, 0),
      bronze,
      0,
      3.23,
      0.33,
      0.75,
      1.4,
      0.4,
    );
    sternum.rotation.z = Math.PI / 4;
    const floor = mesh(new THREE.CylinderGeometry(1.85, 2.0, 0.16, 64), metal(0x070a12, 0.72, 0.3));
    floor.position.y = 0.15;
    const lip = mesh(new THREE.TorusGeometry(1.87, 0.022, 5, 100), gold);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 0.25;
    const base = mesh(new THREE.CylinderGeometry(2.04, 2.1, 0.1, 64), dark);
    base.position.y = 0.02;
    const mechanical = new THREE.Group();
    mechanical.position.set(0, 2.55, -0.7);
    root.add(mechanical);
    const rim = mesh(new THREE.TorusGeometry(2.44, 0.09, 5, 8), dark, mechanical);
    rim.rotation.z = Math.PI / 8;
    rim.scale.y = 1.13;
    const ring = mesh(
      new THREE.TorusGeometry(2.27, 0.014, 4, 100, Math.PI * 1.28),
      bronze,
      mechanical,
    );
    ring.rotation.z = -0.3;
    ring.scale.y = 1.13;
    const energy = mesh(
      new THREE.TorusGeometry(2.42, 0.025, 4, 90, Math.PI * 0.58),
      lit,
      mechanical,
    );
    energy.rotation.z = 0.3;
    energy.scale.y = 1.13;
    const energy2 = mesh(
      new THREE.TorusGeometry(2.42, 0.016, 4, 90, Math.PI * 0.22),
      gold,
      mechanical,
    );
    energy2.rotation.z = 3.15;
    energy2.scale.y = 1.13;
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const tick = mesh(
        new THREE.BoxGeometry(i % 5 === 0 ? 0.13 : 0.065, 0.012, 0.02),
        i % 5 === 0 ? edge : black,
        mechanical,
      );
      tick.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6 * 1.13, 0);
      tick.rotation.z = a;
    }
    for (const sign of [-1, 1]) {
      const rail = mesh(new THREE.BoxGeometry(0.055, 5.6, 0.15), black);
      rail.position.set(sign * 2.74, 2.5, -0.85);
      const slit = mesh(new THREE.BoxGeometry(0.012, 2.7, 0.02), lit);
      slit.position.set(sign * 2.74, 2.6, -0.74);
    }
    const light = new THREE.AmbientLight(0x798ca8, 1.1);
    scene.add(light);
    const key = new THREE.DirectionalLight(0xe5ebff, 5);
    key.position.set(-3, 6, 4);
    scene.add(key);
    const warm = new THREE.DirectionalLight(0xf0c889, 3.5);
    warm.position.set(4, 2, 1);
    scene.add(warm);
    const redLight = new THREE.PointLight(0xe83246, 17, 12, 2);
    redLight.position.set(-2, 2, 2);
    scene.add(redLight);
    const back = new THREE.DirectionalLight(0x98b7dd, 3);
    back.position.set(0, 4, -4);
    scene.add(back);
    let frame = 0,
      last = 0,
      visible = true,
      dirty = true,
      elapsed = 0,
      previousPhase = '',
      reportedReady = false,
      warmup = 4,
      stillPhase = '';
    const pointer = { x: 0, y: 0 };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      dirty = true;
      wake.current();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      dirty = true;
      wake.current();
    });
    intersection.observe(host);
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && latest.current.motion) {
        const r = host.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width - 0.5;
        pointer.y = (e.clientY - r.top) / r.height - 0.5;
        dirty = true;
        wake.current();
      }
    };
    const leave = () => {
      pointer.x = 0;
      pointer.y = 0;
      dirty = true;
      wake.current();
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    const lost = (event: Event) => {
      event.preventDefault();
      latest.current.onError();
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    function request() {
      if (!frame && visible && latest.current.active && !document.hidden)
        frame = requestAnimationFrame(render);
    }
    function render(time: number) {
      frame = 0;
      const p = latest.current;
      if (!visible || !p.active || document.hidden) return;
      const interval = p.phase === 'spin' && !low ? 1000 / 60 : 1000 / 30;
      if (time - last < interval) {
        request();
        return;
      }
      const dt = Math.min(0.1, (time - last) / 1000);
      last = time;
      if (p.phase !== previousPhase) {
        lit.color.set(p.phase === 'reveal' ? 0xd9ac60 : 0xe83246);
        redLight.intensity = p.phase === 'spin' ? 25 : p.phase === 'reveal' ? 9 : 17;
        previousPhase = p.phase;
        dirty = true;
      }
      if (p.motion) {
        elapsed += dt;
        const speed = p.phase === 'spin' ? 1.6 : p.phase === 'reveal' ? 0.08 : 0.035;
        mechanical.rotation.z += dt * speed;
        hero.rotation.y = Math.sin(elapsed * 0.22) * 0.075 + pointer.x * 0.18;
        root.rotation.y = pointer.x * 0.06;
        root.rotation.x = pointer.y * 0.025;
        dirty = true;
      }
      if (dirty || warmup > 0) {
        warmup = Math.max(0, warmup - 1);
        renderer.render(scene, camera);
        dirty = false;
        // Freeze reduced-motion views into a self-rendered bitmap, then stop the loop.
        if (!p.motion && warmup === 0 && stillPhase !== p.phase) {
          stillPhase = p.phase;
          latest.current.onStill(renderer.domElement.toDataURL('image/png'));
        }
        if (!reportedReady && warmup === 0) {
          reportedReady = true;
          host!.dataset.ready = 'true';
          latest.current.onReady();
        }
      }
      if (p.motion || warmup > 0) request();
    }
    wake.current = () => {
      dirty = true;
      request();
    };
    document.addEventListener('visibilitychange', request);
    request();
    return () => {
      wake.current = () => {};
      document.removeEventListener('visibilitychange', request);
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      materials.forEach((m) => m.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
    // A scene is constructed once. Current visual state is read through latest to avoid reallocating meshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.quality]);
  useEffect(() => {
    const host = mount.current;
    if (host) host.dataset.phase = props.phase;
  }, [props.phase]);
  return <div className="webgl-chamber" ref={mount} aria-hidden="true" />;
}
