"use client";

import { useEffect, useRef } from "react";

// Interactive 3D model of the S6 phone cooler: drag to turn it, it also
// turns by itself. Hot air (orange) is pulled into the fan on one side and
// ice (white flakes) blows out of the other. LEDs cycle through colors.
// three.js is loaded only in the browser, after the page is shown.
export default function Cooler3D({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import(
        "three/examples/jsm/controls/OrbitControls.js"
      );
      if (disposed) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const small = mount.clientWidth < 500;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 2.5, 5.3);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.touchAction = "pan-y";

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      // The cooler spins on its own; the camera only moves when dragged, so
      // hot air stays on the left and ice on the right.
      controls.autoRotate = false;
      controls.minPolarAngle = 0.35;
      controls.maxPolarAngle = 1.9;
      controls.target.set(0, 0, 0);

      // Light
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 6, 4);
      scene.add(key);
      const rim = new THREE.PointLight(0xff7a1a, 30, 12);
      rim.position.set(-3.5, 1.5, -2.5);
      scene.add(rim);
      const inner = new THREE.PointLight(0xb04dff, 12, 5);
      inner.position.set(0, 0.6, 0);
      scene.add(inner);

      const cooler = new THREE.Group();
      scene.add(cooler);

      const metal = new THREE.MeshStandardMaterial({ color: 0x2b2e35, metalness: 0.92, roughness: 0.3 });
      const darkMetal = new THREE.MeshStandardMaterial({ color: 0x17191d, metalness: 0.85, roughness: 0.45 });
      const brass = new THREE.MeshStandardMaterial({ color: 0xd4a94e, metalness: 1, roughness: 0.25 });

      // Body (puck), base lip, top rim
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.62, 72, 1, true), metal);
      cooler.add(body);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.66, 1.72, 0.2, 72), darkMetal);
      base.position.y = -0.4;
      cooler.add(base);
      const rimRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.13, 20, 120), metal);
      rimRing.rotation.x = Math.PI / 2;
      rimRing.position.y = 0.32;
      cooler.add(rimRing);

      // Glowing fan chamber
      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(1.38, 64),
        new THREE.MeshBasicMaterial({ color: 0x9a3cff })
      );
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 0.08;
      cooler.add(glow);

      // Fan blades (spin fast under the grille)
      const fan = new THREE.Group();
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0xff5fd2, transparent: true, opacity: 0.55 });
      for (let i = 0; i < 7; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.03, 0.32), bladeMat);
        blade.position.x = 0.6;
        const holder = new THREE.Group();
        holder.rotation.y = (i / 7) * Math.PI * 2;
        blade.rotation.x = 0.35;
        holder.add(blade);
        fan.add(holder);
      }
      fan.position.y = 0.14;
      cooler.add(fan);

      // Star grille: 6 spokes + star edges
      const grille = new THREE.Group();
      const spokeGeo = new THREE.BoxGeometry(1.32, 0.07, 0.1);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Mesh(spokeGeo, darkMetal);
        spoke.position.set(Math.cos(a) * 0.66, 0, Math.sin(a) * 0.66);
        spoke.rotation.y = -a;
        grille.add(spoke);

        const tip = new THREE.Vector3(Math.cos(a) * 1.32, 0, Math.sin(a) * 1.32);
        for (const side of [-1, 1]) {
          const b = a + (side * Math.PI) / 6;
          const valley = new THREE.Vector3(Math.cos(b) * 0.62, 0, Math.sin(b) * 0.62);
          const len = tip.distanceTo(valley);
          const edge = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.07), darkMetal);
          edge.position.copy(tip.clone().add(valley).multiplyScalar(0.5));
          edge.rotation.y = -Math.atan2(valley.z - tip.z, valley.x - tip.x);
          grille.add(edge);
        }
      }
      grille.position.y = 0.3;
      cooler.add(grille);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 32), darkMetal);
      hub.position.y = 0.34;
      cooler.add(hub);
      const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 12, 32), brass);
      brassRing.rotation.x = Math.PI / 2;
      brassRing.position.y = 0.43;
      cooler.add(brassRing);

      // LED ring on top (segments so each can take its own color)
      const ledMats: InstanceType<typeof THREE.MeshBasicMaterial>[] = [];
      const ledCount = 36;
      for (let i = 0; i < ledCount; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        ledMats.push(mat);
        const seg = new THREE.Mesh(
          new THREE.TorusGeometry(1.5, 0.045, 8, 6, (Math.PI * 2) / ledCount * 0.8),
          mat
        );
        seg.rotation.x = Math.PI / 2;
        seg.rotation.z = (i / ledCount) * Math.PI * 2;
        seg.position.y = 0.46;
        cooler.add(seg);
      }

      // RGB side vents
      const ventMats: InstanceType<typeof THREE.MeshBasicMaterial>[] = [];
      const ventCount = 40;
      for (let i = 0; i < ventCount; i++) {
        const a = (i / ventCount) * Math.PI * 2;
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        ventMats.push(mat);
        const vent = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.05), mat);
        vent.position.set(Math.cos(a) * 1.605, -0.05, Math.sin(a) * 1.605);
        vent.rotation.y = -a;
        cooler.add(vent);
      }

      cooler.rotation.x = 0.12;

      // Particle sprites
      function sprite(draw: (ctx: CanvasRenderingContext2D) => void) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext("2d")!;
        draw(ctx);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      }
      const puff = sprite((ctx) => {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.4, "rgba(255,255,255,0.45)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
      });
      const flake = sprite((ctx) => {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.translate(32, 32);
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 26);
          ctx.moveTo(0, 15);
          ctx.lineTo(7, 21);
          ctx.moveTo(0, 15);
          ctx.lineTo(-7, 21);
          ctx.stroke();
        }
      });

      type Stream = {
        points: InstanceType<typeof THREE.Points>;
        pos: Float32Array;
        vel: Float32Array;
        life: Float32Array;
        reset: (i: number, initial: boolean) => void;
        step: (i: number, dt: number) => void;
      };

      function makeStream(
        count: number,
        material: InstanceType<typeof THREE.PointsMaterial>,
        reset: Stream["reset"],
        step: Stream["step"]
      ): Stream {
        const pos = new Float32Array(count * 3);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const points = new THREE.Points(geo, material);
        // Positions change every frame, so the cached bounds are wrong.
        points.frustumCulled = false;
        scene.add(points);
        const stream: Stream = {
          points,
          pos,
          vel: new Float32Array(count * 3),
          life: new Float32Array(count),
          reset,
          step,
        };
        return stream;
      }

      const rand = (a: number, b: number) => a + Math.random() * (b - a);
      const heatCount = reduceMotion ? 60 : small ? 140 : 220;
      const iceCount = reduceMotion ? 70 : small ? 160 : 260;

      // Hot air: comes from the upper left and is sucked into the fan top.
      const heat: Stream = makeStream(
        heatCount,
        new THREE.PointsMaterial({
          size: 0.5,
          map: puff,
          color: 0xff5a1a,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
        (i, initial) => {
          heat.pos[i * 3] = rand(-4.0, -2.4);
          heat.pos[i * 3 + 1] = rand(0.9, 2.2);
          heat.pos[i * 3 + 2] = rand(-1.4, 1.4);
          heat.life[i] = initial ? Math.random() : 0;
        },
        (i, dt) => {
          const p = heat.pos;
          const tx = 0, ty = 0.45, tz = 0;
          const dx = tx - p[i * 3], dy = ty - p[i * 3 + 1], dz = tz - p[i * 3 + 2];
          const d = Math.hypot(dx, dy, dz);
          const speed = 1.6 + 2.4 / Math.max(d, 0.4);
          p[i * 3] += (dx / d) * speed * dt + Math.sin(heat.life[i] * 20 + i) * 0.01;
          p[i * 3 + 1] += (dy / d) * speed * dt + Math.cos(heat.life[i] * 17 + i) * 0.008;
          p[i * 3 + 2] += (dz / d) * speed * dt;
          heat.life[i] += dt;
          if (d < 0.35) heat.reset(i, false);
        }
      );

      // Ice: blown out of the side vents to the right, drifting down.
      const ice: Stream = makeStream(
        iceCount,
        new THREE.PointsMaterial({
          size: 0.36,
          map: flake,
          color: 0xf2fbff,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        }),
        (i, initial) => {
          const a = rand(-0.5, 0.5);
          ice.pos[i * 3] = Math.cos(a) * 1.65;
          ice.pos[i * 3 + 1] = rand(-0.25, 0.15);
          ice.pos[i * 3 + 2] = Math.sin(a) * 1.65;
          ice.vel[i * 3] = rand(1.8, 3.4);
          ice.vel[i * 3 + 1] = rand(-0.2, 0.6);
          ice.vel[i * 3 + 2] = rand(-0.9, 0.9);
          ice.life[i] = initial ? -Math.random() * 2 : 0;
        },
        (i, dt) => {
          ice.life[i] += dt;
          if (ice.life[i] < 0) {
            ice.pos[i * 3 + 1] = -100; // waiting to start
            return;
          }
          if (ice.pos[i * 3 + 1] < -50) ice.reset(i, false);
          const p = ice.pos, v = ice.vel;
          v[i * 3 + 1] -= 0.9 * dt;
          v[i * 3] *= 0.992;
          p[i * 3] += v[i * 3] * dt;
          p[i * 3 + 1] += v[i * 3 + 1] * dt;
          p[i * 3 + 2] += v[i * 3 + 2] * dt;
          if (ice.life[i] > 2.6 || p[i * 3 + 1] < -2.6) ice.reset(i, false);
        }
      );

      for (let i = 0; i < heatCount; i++) heat.reset(i, true);
      for (let i = 0; i < iceCount; i++) ice.reset(i, true);
      // Spread the hot air along its path at start.
      for (let k = 0; k < 60; k++) {
        for (let i = 0; i < heatCount; i++) if (Math.random() < 0.5) heat.step(i, 0.03);
      }

      function resize() {
        const w = mount!.clientWidth;
        const h = mount!.clientHeight;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        camera.position.z = w / h < 1.1 ? 7.4 : 6.1;
        camera.updateProjectionMatrix();
      }
      resize();
      const resizer = new ResizeObserver(resize);
      resizer.observe(mount);

      let visible = true;
      const watcher = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      watcher.observe(mount);

      const color = new THREE.Color();
      const clock = new THREE.Clock();
      let frame = 0;

      function tick() {
        frame = requestAnimationFrame(tick);
        if (!visible || document.hidden) {
          clock.getDelta();
          return;
        }
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        fan.rotation.y -= dt * (reduceMotion ? 2 : 14);
        if (!reduceMotion) cooler.rotation.y += dt * 0.45;
        ledMats.forEach((mat, i) => color.setHSL((i / ledCount + t * 0.25) % 1, 1, 0.6) && mat.color.copy(color));
        ventMats.forEach((mat, i) => color.setHSL((i / ventCount - t * 0.3 + 1) % 1, 1, 0.55) && mat.color.copy(color));
        color.setHSL((0.75 + Math.sin(t * 0.6) * 0.12 + 1) % 1, 1, 0.42);
        (glow.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.copy(color);
        inner.color.copy(color);

        for (let i = 0; i < heatCount; i++) heat.step(i, dt);
        for (let i = 0; i < iceCount; i++) ice.step(i, dt);
        heat.points.geometry.attributes.position.needsUpdate = true;
        ice.points.geometry.attributes.position.needsUpdate = true;

        controls.update();
        renderer.render(scene, camera);
      }
      tick();

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizer.disconnect();
        watcher.disconnect();
        controls.dispose();
        scene.traverse((obj) => {
          const mesh = obj as InstanceType<typeof THREE.Mesh>;
          mesh.geometry?.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
        puff.dispose();
        flake.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`cursor-grab active:cursor-grabbing ${className}`}
      role="img"
      aria-label="S6 Phone Cooler بالـ 3D: الهوا السخون كيدخل والثلج كيخرج"
    />
  );
}
