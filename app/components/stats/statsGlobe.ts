/**
 * Background for the statistics band, in the spirit of a luxury travel film: a large dark Earth
 * rising out of the darkness with champagne-gold coastlines and points of city light, flight
 * routes arcing across it, flowing ribbons of gold silk below with sparks travelling along them,
 * and out-of-focus bokeh. Layers move at their own rates with the pointer and the scroll. The
 * scene fades in when the section arrives and only renders while it is on screen.
 */
import * as THREE from "three";

const GOLD = new THREE.Color(0.9, 0.74, 0.46);
const R = 6;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sph = (lon: number, lat: number, r = R) => {
  const la = (lat * Math.PI) / 180,
    lo = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(la) * Math.sin(lo),
    r * Math.sin(la),
    r * Math.cos(la) * Math.cos(lo),
  );
};

type Land = { rings: [number, number][][]; dots: [number, number][] };

export function createStatsGlobe(
  container: HTMLElement,
  opts: { lite: boolean; still: boolean },
) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, opts.lite ? 1.25 : 1.75),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 15);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (
    disposables.push(x),
    x
  );
  const uTime = { value: 0 };
  const uReveal = { value: 0 };
  const uPx = { value: renderer.getPixelRatio() };
  const R0 = rng(11);
  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  };

  /* ---- the Earth ---- */
  const world = new THREE.Group();
  scene.add(world);
  const globe = new THREE.Group();
  globe.rotation.set(0.25, -0.6, 0.12);
  world.add(globe);

  // a dark body that hides the far side, with a faint golden rim of atmosphere
  const body = new THREE.Mesh(
    keep(new THREE.SphereGeometry(R * 0.995, 96, 64)),
    keep(
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uReveal, uColor: { value: GOLD } },
        vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uReveal; uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
        void main(){
          float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.0);
          // lit softly from the upper left
          float l = max(dot(vN, normalize(vec3(-0.5, 0.6, 0.6))), 0.0);
          vec3 c = vec3(0.035, 0.028, 0.02) + uColor * (0.05 * l + 0.55 * f);
          gl_FragColor = vec4(c * uReveal, uReveal * 0.97);
        }`,
      }),
    ),
  );
  globe.add(body);

  // outer glow
  const halo = new THREE.Mesh(
    keep(new THREE.SphereGeometry(R * 1.12, 64, 32)),
    keep(
      new THREE.ShaderMaterial({
        ...additive,
        side: THREE.BackSide,
        uniforms: { uReveal, uColor: { value: GOLD } },
        vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform float uReveal; uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(max(0.0, 1.0 - abs(dot(vN, vV))), 4.0); float a = f * 0.22 * uReveal; gl_FragColor = vec4(uColor * a, a); }`,
      }),
    ),
  );
  world.add(halo);

  // coastlines and city lights (loaded from a small Natural Earth file)
  const lineMat = keep(
    new THREE.ShaderMaterial({
      ...additive,
      uniforms: { uReveal, uTime, uColor: { value: GOLD } },
      vertexShader: `varying float vF; varying vec3 vW;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vF = normalize(normalMatrix * normalize(position)).z; vW = position; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uReveal, uTime; uniform vec3 uColor; varying float vF; varying vec3 vW;
      void main(){
        if (vF < 0.0) discard;
        float shimmer = 0.75 + 0.25 * sin(uTime * 0.8 + vW.x * 2.0 + vW.y * 3.0);
        float a = (0.18 + 0.32 * pow(vF, 0.6)) * shimmer * uReveal;
        gl_FragColor = vec4(uColor * a, a);
      }`,
    }),
  );
  const dotMat = keep(
    new THREE.ShaderMaterial({
      ...additive,
      uniforms: { uReveal, uTime, uPx, uColor: { value: GOLD } },
      vertexShader: `attribute float aS; uniform float uTime, uPx; varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        float facing = normalize(normalMatrix * normalize(position)).z;
        vA = facing > 0.0 ? (0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (0.4 + aS) + aS * 50.0), 3.0)) * pow(facing, 0.5) : 0.0;
        gl_PointSize = uPx * (1.5 + aS * 2.2) * (15.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
      fragmentShader: `uniform float uReveal; uniform vec3 uColor; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * 0.8 * uReveal; gl_FragColor = vec4(uColor * a, a); }`,
    }),
  );
  fetch("/stats/globe-land.json")
    .then((r) => r.json())
    .then((land: Land) => {
      const pos: number[] = [];
      for (const ring of land.rings)
        for (let i = 0; i < ring.length - 1; i++) {
          const a = sph(ring[i][0], ring[i][1], R * 1.002),
            b = sph(ring[i + 1][0], ring[i + 1][1], R * 1.002);
          pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      const lg = keep(new THREE.BufferGeometry());
      lg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      globe.add(new THREE.LineSegments(lg, lineMat));
      const dots = opts.lite
        ? land.dots.filter((_, i) => i % 2 === 0)
        : land.dots;
      const dp: number[] = [],
        ds: number[] = [];
      for (const [lo, la] of dots) {
        const p = sph(lo, la, R * 1.004);
        dp.push(p.x, p.y, p.z);
        ds.push(R0());
      }
      const dg = keep(new THREE.BufferGeometry());
      dg.setAttribute("position", new THREE.Float32BufferAttribute(dp, 3));
      dg.setAttribute("aS", new THREE.Float32BufferAttribute(ds, 1));
      globe.add(new THREE.Points(dg, dotMat));
    })
    .catch(() => {});

  /* ---- flight routes arcing over the globe ---- */
  const CITIES: [number, number][] = [
    [77.2, 28.6],
    [-0.1, 51.5],
    [-74.0, 40.7],
    [139.7, 35.7],
    [55.3, 25.2],
    [151.2, -33.9],
    [2.35, 48.85],
    [-43.2, -22.9],
    [36.8, -1.3],
    [103.8, 1.35],
  ];
  const routeMat = keep(
    new THREE.ShaderMaterial({
      ...additive,
      uniforms: { uReveal, uTime, uColor: { value: GOLD } },
      vertexShader: `attribute float aT; attribute float aP; varying float vT; varying float vP; varying float vF;
      void main(){ vT = aT; vP = aP; vF = normalize(normalMatrix * normalize(position)).z; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uReveal, uTime; uniform vec3 uColor; varying float vT; varying float vP; varying float vF;
      void main(){
        float cyc = fract(uTime / 7.0 + vP);
        float head = cyc * 1.4;                 // draws, then the tail follows it off
        if (vT > head || vT < head - 0.9) discard;
        float glow = exp(-pow((head - vT) * 14.0, 2.0));
        float tail = smoothstep(head - 0.9, head - 0.2, vT);
        float a = (0.25 * tail + 0.9 * glow) * uReveal * (vF > -0.2 ? 1.0 : 0.15);
        gl_FragColor = vec4(uColor * a, a);
      }`,
    }),
  );
  {
    const pos: number[] = [],
      tt: number[] = [],
      pp: number[] = [];
    const pairs = opts.lite ? 4 : 7;
    for (let k = 0; k < pairs; k++) {
      const c1 = CITIES[k % CITIES.length],
        c2 = CITIES[(k * 3 + 4) % CITIES.length];
      const a = sph(c1[0], c1[1]).normalize(),
        b = sph(c2[0], c2[1]).normalize();
      const ang = Math.max(0.2, a.angleTo(b));
      const phase = k / pairs;
      let prev: THREE.Vector3 | null = null;
      const n = 90;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const p = a
          .clone()
          .multiplyScalar(Math.sin((1 - t) * ang))
          .add(b.clone().multiplyScalar(Math.sin(t * ang)))
          .divideScalar(Math.sin(ang));
        p.multiplyScalar(R * (1.01 + 0.18 * Math.sin(Math.PI * t)));
        if (prev) {
          pos.push(prev.x, prev.y, prev.z, p.x, p.y, p.z);
          tt.push((i - 1) / n, i / n);
          pp.push(phase, phase);
        }
        prev = p;
      }
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(tt, 1));
    g.setAttribute("aP", new THREE.Float32BufferAttribute(pp, 1));
    globe.add(new THREE.LineSegments(g, routeMat));
  }

  /* ---- ribbons of gold silk flowing across the bottom, with sparks travelling along them ---- */
  const ribbons = new THREE.Group();
  scene.add(ribbons);
  const RIB = opts.lite ? 3 : 5,
    STRANDS = opts.lite ? 10 : 18,
    SEG = 140;
  const ribMat = keep(
    new THREE.ShaderMaterial({
      ...additive,
      uniforms: { uReveal, uTime, uColor: { value: GOLD } },
      vertexShader: `attribute vec3 aR; uniform float uTime; varying float vA; varying float vU;
      // aR: ribbon index, strand offset (0..1), u along the ribbon (0..1)
      void main(){
        float r = aR.x, s = aR.y, u = aR.z;
        float x = (u - 0.5) * 44.0;
        float ph = r * 1.7;
        float y = -2.1 + r * 0.32 + sin(u * 4.0 + uTime * 0.18 + ph) * 1.1 + sin(u * 9.0 - uTime * 0.11 + ph * 2.0) * 0.35;
        float width = 0.55 + 0.45 * sin(u * 3.0 + ph + uTime * 0.1);
        y += (s - 0.5) * width * 0.9;
        float z = 6.5 + r * 0.8 + sin(u * 5.0 + ph) * 1.2;
        // the ribbon twists: strands converge where it turns edge-on
        float twist = sin(u * 6.0 + uTime * 0.15 + ph);
        y = mix(y, y - (s - 0.5) * width * 1.4 * (1.0 - abs(twist)), 0.6);
        vA = (1.0 - abs(s - 0.5) * 1.6) * (0.35 + 0.65 * abs(twist)) * smoothstep(0.0, 0.12, u) * smoothstep(1.0, 0.88, u);
        vU = u;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
      }`,
      fragmentShader: `uniform float uReveal; uniform vec3 uColor; varying float vA; varying float vU;
      void main(){ float a = vA * 0.6 * uReveal; gl_FragColor = vec4(uColor * a, a); }`,
    }),
  );
  {
    const aR: number[] = [],
      pos: number[] = [];
    for (let r = 0; r < RIB; r++)
      for (let s = 0; s < STRANDS; s++)
        for (let i = 0; i < SEG; i++) {
          aR.push(
            r,
            s / (STRANDS - 1),
            i / SEG,
            r,
            s / (STRANDS - 1),
            (i + 1) / SEG,
          );
          pos.push(0, 0, 0, 0, 0, 0);
        }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aR", new THREE.Float32BufferAttribute(aR, 3));
    const l = new THREE.LineSegments(g, ribMat);
    l.frustumCulled = false;
    ribbons.add(l);
  }
  // sparks riding the ribbons
  {
    const N = opts.lite ? 30 : 80;
    const aR: number[] = [],
      pos: number[] = [];
    for (let i = 0; i < N; i++) {
      aR.push(Math.floor(R0() * RIB), R0(), R0());
      pos.push(0, 0, 0);
    }
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aR", new THREE.Float32BufferAttribute(aR, 3));
    const m = keep(
      new THREE.ShaderMaterial({
        ...additive,
        uniforms: { uReveal, uTime, uPx, uColor: { value: GOLD } },
        vertexShader: `attribute vec3 aR; uniform float uTime, uPx; varying float vA;
        void main(){
          float r = aR.x, s = aR.y;
          float u = fract(aR.z + uTime * (0.012 + s * 0.01));
          float x = (u - 0.5) * 44.0;
          float ph = r * 1.7;
          float y = -2.1 + r * 0.32 + sin(u * 4.0 + uTime * 0.18 + ph) * 1.1 + sin(u * 9.0 - uTime * 0.11 + ph * 2.0) * 0.35;
          float width = 0.55 + 0.45 * sin(u * 3.0 + ph + uTime * 0.1);
          y += (s - 0.5) * width * 1.4 * 0.6;
          float z = 6.5 + r * 0.8 + sin(u * 5.0 + ph) * 1.2;
          vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uPx * (2.0 + s * 3.0) * (15.0 / -mv.z);
          vA = (0.4 + 0.6 * pow(0.5 + 0.5 * sin(uTime * 2.0 + s * 40.0), 2.0)) * smoothstep(0.0, 0.1, u) * smoothstep(1.0, 0.9, u);
        }`,
        fragmentShader: `uniform float uReveal; uniform vec3 uColor; varying float vA;
        void main(){ float d = length(gl_PointCoord - 0.5); float a = (smoothstep(0.5, 0.0, d) * 0.6 + smoothstep(0.15, 0.0, d)) * vA * uReveal;
          gl_FragColor = vec4(uColor * a, a); }`,
      }),
    );
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    ribbons.add(pts);
  }

  /* ---- bokeh: a few soft out-of-focus lights near the lens ---- */
  const BK = opts.lite ? 8 : 16;
  const bkPos = new Float32Array(BK * 3),
    bkS = new Float32Array(BK);
  for (let i = 0; i < BK; i++) {
    bkPos.set([(R0() - 0.5) * 22, (R0() - 0.5) * 6, 4 + R0() * 6], i * 3);
    bkS[i] = R0();
  }
  const bkGeo = keep(new THREE.BufferGeometry());
  bkGeo.setAttribute("position", new THREE.BufferAttribute(bkPos, 3));
  bkGeo.setAttribute("aS", new THREE.BufferAttribute(bkS, 1));
  const bokeh = new THREE.Points(
    bkGeo,
    keep(
      new THREE.ShaderMaterial({
        ...additive,
        uniforms: { uReveal, uTime, uPx, uColor: { value: GOLD } },
        vertexShader: `attribute float aS; uniform float uTime, uPx; varying float vA;
      void main(){ vec3 p = position; p.x += sin(uTime * 0.05 + aS * 30.0) * 0.6; p.y += sin(uTime * 0.07 + aS * 12.0) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = uPx * (14.0 + aS * 26.0) * (15.0 / -mv.z);
        vA = 0.5 + 0.5 * sin(uTime * (0.3 + aS * 0.4) + aS * 20.0); }`,
        fragmentShader: `uniform float uReveal; uniform vec3 uColor; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.3, d) * 0.08 * vA * uReveal; gl_FragColor = vec4(uColor * a, a); }`,
      }),
    ),
  );
  scene.add(bokeh);

  /* ---- sizing: a large globe, cropped by the band like a film frame ---- */
  const resize = () => {
    const w = Math.max(1, container.clientWidth),
      h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // the globe spans ~1.6x the band's height on wide screens, and its width on phones
    const dist = 15;
    const halfH = camera.aspect >= 1 ? R * 0.52 : (R * 1.05) / camera.aspect;
    camera.fov = (2 * Math.atan(halfH / dist) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    world.position.set(0, camera.aspect >= 1 ? -R * 0.22 : 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  /* ---- pointer + scroll parallax ---- */
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (e: PointerEvent) => {
    ptr.x = Math.max(
      -1,
      Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2),
    );
    ptr.y = Math.max(
      -1,
      Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2),
    );
  };
  if (!opts.lite)
    window.addEventListener("pointermove", onMove, { passive: true });

  /* ---- animation ---- */
  let raf = 0,
    running = false,
    last = 0,
    clock = 0,
    revealAt = -1;
  const DEG = Math.PI / 180;
  const frame = (dt: number) => {
    clock += dt;
    uTime.value = clock;
    if (revealAt >= 0) {
      const k = Math.min(1, (clock - revealAt) / 2.8);
      uReveal.value = k * k * (3 - 2 * k);
    }
    ptr.sx += (ptr.x - ptr.sx) * Math.min(1, dt * 2);
    ptr.sy += (ptr.y - ptr.sy) * Math.min(1, dt * 2);
    const r = container.getBoundingClientRect();
    const scroll =
      (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;

    globe.rotation.y += dt * 0.025;
    world.rotation.x = ptr.sy * 3 * DEG;
    world.rotation.y = ptr.sx * 4 * DEG;
    // the camera drifts in as the scene appears; layers move at different rates
    camera.position.z = 15 + (1 - uReveal.value) * 2.5;
    camera.position.y = scroll * 0.4;
    ribbons.position.set(-ptr.sx * 0.6, ptr.sy * 0.25 + scroll * 0.8, 0);
    bokeh.position.set(-ptr.sx * 1.4, ptr.sy * 0.5 + scroll * 1.6, 0);
    camera.lookAt(0, camera.position.y * 0.5, 0);
    renderer.render(scene, camera);
  };
  const loop = (now: number) => {
    frame(Math.min(0.05, (now - last) / 1000 || 0));
    last = now;
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || opts.still) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  if (opts.still) {
    revealAt = 0;
    clock = 4;
    uReveal.value = 1;
    setTimeout(() => frame(0), 400); // after the coastlines have loaded
  }
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        if (revealAt < 0) revealAt = clock;
        start();
      } else stop();
    },
    { rootMargin: "60px 0px" },
  );
  io.observe(container);

  return {
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
