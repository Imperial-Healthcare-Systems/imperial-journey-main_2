import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Second half of the intro film, rendered offline (see /intro-render?scene=ground):
 * out of the clouds low over the Amazon rainforest with eagles alongside, towards a
 * giant table mountain where a river pours ~650 m off the cliff, breaking into spray
 * and mist as it falls; the camera follows the water down, then the river to the sea.
 * Units are metres.
 */
export const G = {
  eaglesFrom: 4.5,
  eaglesTo: 11.5,
  /** the falls are framed on the right for the website content */
  reveal: 21,
  end: 52,
};

// ---------------------------------------------------------------- noise (CPU)

function hash2(ix: number, iz: number) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function noise2(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm2(x: number, z: number, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * noise2(x * f, z * f);
    f *= 2.03;
    a *= 0.5;
  }
  return v / (1 - Math.pow(0.5, oct));
}
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// seeded random for deterministic placement
let seed = 1234567;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;

// ---------------------------------------------------------------- landscape

const TOP = 720; // top of the table mountain (tepui)
const P = TOP;
const LIPZ = -250; // where the river leaves the cliff
const LIP_Y = TOP - 1.5; // river surface at the lip
const BASE_Y = 62; // plunge pool surface
const FALL_W = 130; // width of the main fall
const OUT = 3.6; // how far the jet arcs out from the cliff (m per sqrt(m) of drop)

function riverX(z: number) {
  const s = z - LIPZ;
  return z < LIPZ ? 60 * Math.sin(s / 480) + 22 * Math.sin(s / 170) : 170 * Math.sin(s / 1300) + 55 * Math.sin(s / 420);
}
function riverLevel(z: number) {
  return z < LIPZ ? LIP_Y : (BASE_Y - 0.5) * (1 - sstep(LIPZ + 2500, 15500, z)) + 0.5;
}
function riverW(z: number) {
  if (z < LIPZ) return 48 + 8 * Math.sin(z / 300) + 14 * sstep(LIPZ - 400, LIPZ, z);
  return 70 + 0.006 * (z - LIPZ) + 120 * Math.exp(-(((z - (LIPZ + 170)) / 120) ** 2));
}
function coastZ(x: number) {
  return 15600 + 500 * Math.sin(x / 1700);
}
/** the southern cliff of the tepui, recessed into an amphitheatre behind the falls */
function edgeZ(x: number) {
  return (
    LIPZ +
    292 * (1 - Math.exp(-((x / 380) ** 2))) +
    110 * Math.sin(x / 420) +
    50 * (Math.sin(x / 160 + 1) - Math.sin(1)) +
    250 * Math.sin(x / 2600)
  );
}
const MESAS: [number, number, number, number][] = [
  [-9500, -7000, 1900, 520],
  [7800, -9800, 2300, 640],
  [-11500, 3500, 1600, 430],
  [9800, 5200, 1700, 460],
  [-2500, -15500, 2600, 700],
];

function height(x: number, z: number) {
  const n = fbm2(x * 0.0011, z * 0.0011, 5);
  const d = fbm2(x * 0.007 + 31, z * 0.007 - 17, 4);
  const rx = riverX(z), dx = Math.abs(x - rx), rw = riverW(z), lvl = riverLevel(z);

  // Amazon lowland, dropping below the sea at the coast
  let low = 35 + 45 * n + 8 * d;
  const c = sstep(coastZ(x) - 1500, coastZ(x) + 800, z);
  low = low * (1 - c) - 35 * c;
  if (z > LIPZ) low = mix(lvl + 3, low, sstep(rw * 1.2, rw * 1.2 + 600, dx));

  // the table mountain, with a rugged vertical rim
  const jag = (xx: number) => 90 * (fbm2(xx * 0.003, 1.1, 4) - 0.5) + 22 * (noise2(xx * 0.02, 3.7) - 0.5);
  const e = edgeZ(x) + jag(x) - jag(0) * Math.exp(-((x / 300) ** 2));
  const side = 3800 + 300 * Math.sin(z / 900);
  const m = sstep(e + 40, e - 6, z) * sstep(side + 60, side - 10, Math.abs(x));
  const top = TOP + (26 * n + 7 * d) * (z < LIPZ ? sstep(rw * 1.3, rw * 1.3 + 250, dx) : 1);
  let h = mix(low, top, m);

  // more table mountains on the horizon
  for (const [mx, mz, r, mh] of MESAS) {
    const dist = Math.hypot(x - mx, z - mz) * (1 + (noise2(x * 0.002, z * 0.002) - 0.5) * 0.35);
    h = Math.max(h, h + mh * (1 - sstep(r * 0.82, r, dist)) + 40 * d * (1 - sstep(r * 0.8, r, dist)));
  }

  // river channel (on top of the mountain, and the plunge pool / lowland river below)
  const ch = 1 - sstep(rw * 0.75, rw * 1.05, dx);
  const bed = z < LIPZ ? TOP - 6 : lvl - 4;
  return mix(h, Math.min(h, bed), ch);
}

// ---------------------------------------------------------------- GLSL

const GNOISE = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }
`;

// shared lighting / aerial perspective uniforms
const SUN_DIR = new THREE.Vector3(0.45, 0.62, 0.64).normalize();
const SUN_COL = new THREE.Color(1.0, 0.95, 0.86);
const SKY_ZENITH = new THREE.Color(0.2, 0.42, 0.78);
const SKY_HORIZON = new THREE.Color(0.64, 0.75, 0.87);
const FOG_DENSITY = 0.00008;

const LIGHT_UNIFORMS = () => ({
  sunDir: { value: SUN_DIR },
  sunCol: { value: SUN_COL },
  skyCol: { value: SKY_ZENITH },
  fogCol: { value: SKY_HORIZON },
  fogDensity: { value: FOG_DENSITY },
  time: { value: 0 },
});

const FOG_GLSL = /* glsl */ `
  uniform vec3 fogCol;
  uniform float fogDensity;
  vec3 applyFog(vec3 col, float dist) {
    float f = 1.0 - exp(-fogDensity * fogDensity * dist * dist);
    return mix(col, fogCol, clamp(f, 0.0, 1.0));
  }
`;

const SKY_VERT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vDir;
  void main() {
    vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
  }
`;
const SKY_FRAG = /* glsl */ `
  #include <logdepthbuf_pars_fragment>
  uniform vec3 sunDir;
  uniform vec3 skyCol;
  uniform vec3 fogCol;
  varying vec3 vDir;
  ${GNOISE}
  void main() {
    #include <logdepthbuf_fragment>
    vec3 d = normalize(vDir);
    float h = max(d.y, 0.0);
    vec3 col = mix(fogCol, skyCol, pow(h, 0.55));
    float s = max(dot(d, sunDir), 0.0);
    col += vec3(1.0, 0.9, 0.75) * (pow(s, 8.0) * 0.25 + pow(s, 900.0) * 12.0);
    // soft cumulus and wisps, projected onto a cloud layer
    if (d.y > 0.02) {
      vec2 cp = d.xz / (d.y + 0.12) * 1.6;
      float c1 = fbm(vec3(cp * 1.1, 0.0));
      float c2 = fbm(vec3(cp * 3.7 + 9.0, 1.0));
      float cloud = smoothstep(0.5, 0.78, c1 * 0.75 + c2 * 0.35);
      cloud *= smoothstep(0.02, 0.18, d.y);
      vec3 cc = mix(vec3(0.78, 0.8, 0.84), vec3(1.0, 0.99, 0.97), smoothstep(0.4, 0.9, c2));
      col = mix(col, cc, cloud * 0.9);
    }
    col = mix(col, fogCol * 0.92, smoothstep(0.0, -0.2, d.y));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const WATER_VERT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  attribute float rapids;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vRapids;
  void main() {
    vUv = uv;
    vRapids = rapids;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
    #include <logdepthbuf_vertex>
  }
`;
// tea-coloured blackwater river (the Potaro is stained by the forest)
const RIVER_FRAG = /* glsl */ `
  #include <logdepthbuf_pars_fragment>
  uniform vec3 sunDir;
  uniform vec3 sunCol;
  uniform vec3 skyCol;
  uniform float time;
  uniform vec3 deep;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vRapids;
  ${FOG_GLSL}
  ${GNOISE}
  void main() {
    #include <logdepthbuf_fragment>
    vec2 flow = vec2(vUv.x * 18.0, vUv.y * 0.28 - time * (0.8 + vRapids * 2.2));
    float n1 = fbm(vec3(flow, time * 0.05));
    float n2 = fbm(vec3(flow * 3.1 + 11.0, time * 0.08));
    vec3 n = normalize(vec3((n1 - 0.5) * 0.35 + (n2 - 0.5) * 0.2, 1.0, (n2 - 0.5) * 0.35));
    vec3 v = normalize(cameraPosition - vPos);
    float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
    vec3 refl = mix(skyCol * 1.1, vec3(0.8, 0.85, 0.9), 0.4);
    vec3 col = mix(deep, refl, fres * 0.75);
    vec3 h = normalize(sunDir + v);
    col += sunCol * pow(max(dot(n, h), 0.0), 180.0) * 2.5;
    // white water where the river races to the edge / churns below the falls
    float streaks = fbm(vec3(vUv.x * 40.0, vUv.y * 0.9 - time * (1.2 + vRapids * 3.0), time * 0.1));
    float foam = smoothstep(0.5, 0.72, streaks * 0.6 + n2 * 0.4 + vRapids * 0.3) * (0.25 + vRapids * 0.75);
    foam += smoothstep(0.66, 0.74, n1) * 0.08;
    float edge = smoothstep(0.08, 0.0, min(vUv.x, 1.0 - vUv.x));
    foam = clamp(foam + edge * 0.25 * n2, 0.0, 1.0);
    col = mix(col, vec3(0.9, 0.92, 0.93) * (0.55 + 0.5 * max(dot(n, sunDir), 0.0)), foam);
    col = applyFog(col, distance(cameraPosition, vPos));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const SEA_FRAG = /* glsl */ `
  #include <logdepthbuf_pars_fragment>
  uniform vec3 sunDir;
  uniform vec3 sunCol;
  uniform vec3 skyCol;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vRapids;
  ${FOG_GLSL}
  ${GNOISE}
  void main() {
    #include <logdepthbuf_fragment>
    vec2 p = vPos.xz * 0.012;
    float n1 = fbm(vec3(p + vec2(time * 0.05, time * 0.08), time * 0.06));
    float n2 = fbm(vec3(p * 4.0 - vec2(time * 0.12, 0.0), time * 0.1));
    vec3 n = normalize(vec3((n1 - 0.5) * 0.5 + (n2 - 0.5) * 0.25, 1.0, (n2 - 0.5) * 0.5));
    vec3 v = normalize(cameraPosition - vPos);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
    float coast = 15600.0 + 500.0 * sin(vPos.x / 1700.0);
    float shallow = smoothstep(coast + 1800.0, coast - 200.0, vPos.z);
    vec3 water = mix(vec3(0.01, 0.07, 0.12), vec3(0.05, 0.28, 0.3), shallow);
    // river water staining the sea at the mouth
    float plume = exp(-pow((vPos.x - (110.0 * sin(vPos.z / 1100.0) + 40.0 * sin(vPos.z / 430.0))) / 700.0, 2.0)) * smoothstep(coast + 2500.0, coast, vPos.z);
    water = mix(water, vec3(0.16, 0.11, 0.06), plume * 0.6);
    vec3 col = mix(water, skyCol * 1.05 + 0.1, fres);
    vec3 h = normalize(sunDir + v);
    col += sunCol * pow(max(dot(n, h), 0.0), 240.0) * 3.0;
    // surf along the beach
    float surf = smoothstep(260.0, 0.0, abs(vPos.z - coast - 120.0 - 60.0 * sin(time * 0.6 + vPos.x * 0.004)));
    surf *= smoothstep(0.35, 0.7, n2 + 0.25);
    col = mix(col, vec3(0.93, 0.95, 0.96), surf * 0.8);
    col = applyFog(col, distance(cameraPosition, vPos));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// the falling curtain of water
const FALL_VERT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vN;
  void main() {
    vUv = uv;
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
    #include <logdepthbuf_vertex>
  }
`;
const FALL_FRAG = /* glsl */ `
  #include <logdepthbuf_pars_fragment>
  uniform vec3 sunDir;
  uniform vec3 sunCol;
  uniform vec3 skyCol;
  uniform float time;
  uniform float layer;
  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vN;
  ${FOG_GLSL}
  ${GNOISE}
  void main() {
    #include <logdepthbuf_fragment>
    float v = 1.0 - vUv.y; // 0 at the lip, 1 at the pool
    float speed = 0.55 + layer * 0.2;
    // water accelerates as it falls: stretch the streaks with the drop
    float along = sqrt(v) * 15.0 - time * speed * 2.4;
    float streak = fbm(vec3(vUv.x * 55.0 + layer * 7.0, along, layer * 3.0));
    float fine = noise(vec3(vUv.x * 210.0 + layer * 13.0, along * 3.5, time * 0.5));
    float ribbons = noise(vec3(vUv.x * 9.0 + layer * 4.0, along * 0.25, 1.0));
    float body = streak * 0.6 + fine * 0.3 + (ribbons - 0.5) * 0.55;
    // the sheet tears into strands and spray as it falls
    float breakup = smoothstep(0.15, 0.95, v);
    float a = smoothstep(0.25 + breakup * 0.32, 0.72, body);
    a *= smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
    // it reaches the bottom, only thinning slightly in its last metres
    a *= 1.0 - smoothstep(0.86, 1.0, v) * 0.35;
    a = clamp(a * (1.1 - layer * 0.35) + (1.0 - breakup) * 0.45, 0.0, 1.0);
    // tea-coloured at the lip, aerated white further down
    vec3 water = mix(vec3(0.62, 0.48, 0.3), vec3(0.93, 0.95, 0.96), smoothstep(0.0, 0.18, v));
    float lit = 0.62 + 0.45 * max(dot(normalize(vN), sunDir), 0.0);
    vec3 col = water * (sunCol * lit) * (0.78 + 0.35 * ribbons) + skyCol * 0.12;
    col = applyFog(col, distance(cameraPosition, vPos));
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// spray droplets flung out of the plunge pool (all motion is a function of time)
const SPRAY_VERT = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  attribute vec4 seedv;
  uniform float time;
  uniform float pixelRatio;
  uniform vec3 impact;
  uniform float width;
  varying float vAlpha;
  varying float vDist;
  void main() {
    float life = 1.8 + seedv.w * 2.8;
    float age = mod(time + seedv.z * life, life);
    float ph = age / life;
    float ang = seedv.y * 6.2831853;
    float fromSheet = step(0.72, seedv.x);
    vec3 origin = impact + vec3((fract(seedv.x * 7.31) - 0.5) * width * 1.5, 10.0 + fromSheet * seedv.w * 40.0, (fract(seedv.y * 3.7) - 0.5) * 30.0);
    float sp = 5.0 + seedv.w * 16.0;
    vec3 vel = vec3(cos(ang) * sp * 1.4, 9.0 + fract(seedv.z * 5.3) * 22.0, abs(sin(ang)) * sp * 1.4 + 4.0);
    vec3 p = origin + vel * age + vec3(0.0, -4.9, 0.0) * age * age + vec3(0.0, 0.0, 2.5) * age;
    p.y = max(p.y, impact.y - 1.0);
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
    gl_PointSize = (1.5 + seedv.w * 3.2) * pixelRatio * (520.0 / -mv.z);
    vAlpha = (1.0 - ph) * (1.0 - ph) * smoothstep(0.0, 0.05, ph) * 0.45;
    vDist = -mv.z;
  }
`;
const SPRAY_FRAG = /* glsl */ `
  #include <logdepthbuf_pars_fragment>
  varying float vAlpha;
  varying float vDist;
  uniform vec3 sunCol;
  ${FOG_GLSL}
  void main() {
    #include <logdepthbuf_fragment>
    vec2 c = gl_PointCoord - 0.5;
    float a = exp(-dot(c, c) * 14.0) * vAlpha;
    vec3 col = applyFog(vec3(0.95, 0.97, 0.98) * sunCol, vDist);
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// ---------------------------------------------------------------- procedural textures

function canvasTex(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void, srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  draw(cv.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Tileable rainforest canopy seen from above: sunlit crowns and shaded gaps. */
function canopyTexture() {
  const t = canvasTex(1024, (c, s) => {
    c.fillStyle = "#23361a";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 5200; i++) {
      const x = rnd() * s, y = rnd() * s;
      const r = 5 + Math.pow(rnd(), 2) * 30;
      const hue = 85 + rnd() * 45;
      const light = 18 + rnd() * 22;
      for (const [ox, oy] of [[0, 0], [s, 0], [-s, 0], [0, s], [0, -s]]) {
        const g = c.createRadialGradient(x + ox - r * 0.35, y + oy - r * 0.35, r * 0.1, x + ox, y + oy, r);
        g.addColorStop(0, `hsl(${hue},${40 + rnd() * 20}%,${light + 16}%)`);
        g.addColorStop(0.7, `hsl(${hue},45%,${light}%)`);
        g.addColorStop(1, "rgba(10,20,8,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function cloudTexture(k: number) {
  return canvasTex(256, (c, s) => {
    const m = s / 2;
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.pow(rnd(), 0.8) * m * 0.55;
      const x = m + Math.cos(a) * d * 1.2;
      const y = m + Math.sin(a) * d * 0.7 - (k % 2) * 10;
      const r = m * (0.18 + rnd() * 0.3);
      const shade = 225 + Math.round(rnd() * 30) - (y > m ? 18 : 0);
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${shade},${shade},${shade + 4},0.3)`);
      g.addColorStop(1, `rgba(${shade},${shade},${shade},0)`);
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

/** Body plumage: rows of overlapping rounded feathers. */
function plumageTexture() {
  const t = canvasTex(512, (c, s) => {
    c.fillStyle = "#6d6d6d";
    c.fillRect(0, 0, s, s);
    const rows = 30, cols = 22;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const x = ((k + (r % 2) * 0.5) / cols) * s;
        const y = (r / rows) * s;
        const w = s / cols, h = (s / rows) * 1.8;
        const g = c.createLinearGradient(x, y, x, y + h);
        const v = 150 + rnd() * 50;
        g.addColorStop(0, `rgb(${v * 0.55},${v * 0.55},${v * 0.57})`);
        g.addColorStop(0.75, `rgb(${v},${v},${v * 1.02})`);
        g.addColorStop(1, `rgb(${v * 0.4},${v * 0.4},${v * 0.42})`);
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(x, y + h * 0.5, w * 0.62, h * 0.55, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** One flight feather: dark vane, pale edge, rachis down the middle and fine barbs. */
function featherTexture(dark: string, edge: string, bars: boolean) {
  return canvasTex(128, (c, s) => {
    const g = c.createLinearGradient(0, 0, s, 0);
    g.addColorStop(0, edge);
    g.addColorStop(0.18, dark);
    g.addColorStop(0.82, dark);
    g.addColorStop(1, edge);
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    // barbs
    for (let y = -s; y < s * 2; y += 3) {
      c.strokeStyle = `rgba(255,255,255,${0.03 + rnd() * 0.05})`;
      c.beginPath();
      c.moveTo(s / 2, y);
      c.lineTo(0, y + s * 0.35);
      c.moveTo(s / 2, y);
      c.lineTo(s, y + s * 0.35);
      c.stroke();
    }
    if (bars) {
      c.fillStyle = "rgba(0,0,0,0.35)";
      for (let y = 10; y < s; y += 26) c.fillRect(0, y, s, 9);
    }
    // rachis
    c.strokeStyle = "rgba(210,200,185,0.55)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(s / 2, 0);
    c.lineTo(s / 2, s);
    c.stroke();
  });
}

// ---------------------------------------------------------------- builders

function buildTerrain(w: number, d: number, segW: number, segD: number, cx: number, cz: number, sink: (x: number, z: number) => number) {
  const g = new THREE.PlaneGeometry(w, d, segW, segD);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + cx, z = pos.getZ(i) + cz;
    pos.setXYZ(i, x, height(x, z) - sink(x, z), z);
  }
  g.computeVertexNormals();
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const forest = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), ny = nrm.getY(i);
    const n = noise2(x * 0.004, z * 0.004);
    let r: number, gg: number, b: number, f: number;
    const dxr = Math.abs(x - riverX(z));
    if (y < 1.5) {
      // sand / sea floor
      [r, gg, b] = [0.62, 0.55, 0.4];
      f = 0;
    } else if (ny < 0.62) {
      // dark wet rock, streaked by seepage and hung with moss and ferns
      const wet = sstep(0.25, 0.65, noise2(x * 0.04, y * 0.06 + z * 0.04));
      const stain = 0.75 + 0.5 * noise2(x * 0.13 + z * 0.13, y * 0.5);
      const moss = sstep(0.42, 0.7, noise2((x + z) * 0.025, y * 0.018)) * 0.85;
      const rock = [mix(0.2, 0.08, wet) * stain, mix(0.17, 0.07, wet) * stain, mix(0.14, 0.06, wet) * stain];
      [r, gg, b] = [mix(rock[0], 0.09, moss), mix(rock[1], 0.17, moss), mix(rock[2], 0.06, moss)];
      f = sstep(0.3, 0.62, ny) * 0.6 + moss * 0.3;
    } else if (z > LIPZ + 400 && y < riverLevel(z) + 5 && dxr > riverW(z) * 0.95 && dxr < riverW(z) * 1.4 && noise2(z * 0.004, 1.3) > 0.55) {
      // sandbars on the bends of the Amazon river
      [r, gg, b] = [0.62, 0.52, 0.36];
      f = 0;
    } else if (y > P - 8 && y < P + 8 && dxr < riverW(z) * 1.5 && z < LIPZ + 10 && z > LIPZ - 900) {
      // bare pink sandstone slabs along the river near the lip
      [r, gg, b] = [0.5, 0.42, 0.34];
      f = sstep(riverW(z) * 1.1, riverW(z) * 1.5, dxr);
    } else if (y < 5 && z > coastZ(x) - 900) {
      [r, gg, b] = [0.78, 0.7, 0.52];
      f = 0;
    } else {
      [r, gg, b] = [mix(0.16, 0.24, n), mix(0.24, 0.3, n), mix(0.12, 0.15, n)];
      f = 1;
    }
    col.set([r, gg, b], i * 3);
    forest[i] = f;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("forest", new THREE.BufferAttribute(forest, 1));
  return g;
}

/** A ribbon mesh following the river centreline between two z values. */
function riverRibbon(z0: number, z1: number, step: number, rapidsAt: (z: number) => number, widthScale = 1) {
  const zs: number[] = [];
  for (let z = z0; z <= z1; z += step) zs.push(z);
  const pos = new Float32Array(zs.length * 2 * 3);
  const uv = new Float32Array(zs.length * 2 * 2);
  const rap = new Float32Array(zs.length * 2);
  const idx: number[] = [];
  let len = 0;
  zs.forEach((z, i) => {
    const x = riverX(z), w = riverW(z) * widthScale, y = riverLevel(z);
    if (i > 0) len += Math.hypot(x - riverX(zs[i - 1]), step);
    pos.set([x - w, y, z, x + w, y, z], i * 6);
    uv.set([0, len, 1, len], i * 4);
    rap.set([rapidsAt(z), rapidsAt(z)], i * 2);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("rapids", new THREE.BufferAttribute(rap, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Point on a falling curtain: u across (0..1), v down (0..1). */
function fallPoint(u: number, v: number, x0: number, lipY: number, lipZ: number, baseY: number, width: number, out: number, offsetZ = 0) {
  const dy = v * (lipY - baseY);
  const lipCurve = 6 * (u - 0.5) * (u - 0.5); // slightly horseshoe-shaped lip
  const x = x0 + (u - 0.5) * width * (1 + 0.55 * v);
  const z = lipZ + 1.5 + lipCurve * 10 + out * Math.sqrt(dy + 0.3) + offsetZ;
  return new THREE.Vector3(x, lipY + 0.8 - dy, z);
}

/** The curtain of water: over the lip and down a ballistic arc. */
function fallSheet(x0: number, lipY: number, lipZ: number, baseY: number, width: number, out: number, offsetZ = 0, segV = 240) {
  const g = new THREE.PlaneGeometry(1, 1, 80, segV);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const p = fallPoint(pos.getX(i) + 0.5, 0.5 - pos.getY(i), x0, lipY, lipZ, baseY, width, out, offsetZ);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g.computeVertexNormals();
  return g;
}

/** A single feather lying in the XZ plane, quill at the origin, pointing along -Z. */
function featherGeometry(len: number, w: number) {
  const sh = new THREE.Shape();
  sh.moveTo(-w * 0.12, 0);
  sh.quadraticCurveTo(-w * 0.55, len * 0.35, -w * 0.45, len * 0.82);
  sh.quadraticCurveTo(-w * 0.2, len * 1.02, 0, len);
  sh.quadraticCurveTo(w * 0.28, len * 0.97, w * 0.5, len * 0.8);
  sh.quadraticCurveTo(w * 0.58, len * 0.3, w * 0.12, 0);
  sh.lineTo(-w * 0.12, 0);
  const g = new THREE.ShapeGeometry(sh, 10);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    uv.setXY(i, x / w + 0.5, y / len);
    // gentle camber and an upward curl towards the tip
    pos.setXYZ(i, x, (y / len) * (y / len) * len * 0.06 - (x / w) * (x / w) * w * 0.12, -y);
  }
  g.computeVertexNormals();
  return g;
}

/** Harpy eagle — the great eagle of the Amazon. Forward is +Z. */
function buildEagle() {
  const eagle = new THREE.Group();

  // body: slate above, white below
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const r = 0.135 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.7) * (1 - 0.25 * t);
    prof.push(new THREE.Vector2(Math.max(r, 0.004), (t - 0.45) * 0.86));
  }
  const bodyG = new THREE.LatheGeometry(prof, 28);
  bodyG.rotateX(Math.PI / 2); // lathe axis Y -> Z (tail at -Z, chest at +Z)
  bodyG.scale(1, 0.85, 1);
  {
    const p = bodyG.attributes.position as THREE.BufferAttribute;
    const c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const up = sstep(-0.02, 0.05, p.getY(i));
      const v = mix(0.95, 0.12, up);
      c.set([v, v, v * 1.02], i * 3);
    }
    bodyG.setAttribute("color", new THREE.BufferAttribute(c, 3));
  }
  const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, map: plumageTexture() });
  eagle.add(new THREE.Mesh(bodyG, bodyMat));

  // head with the harpy's pale grey face and split crest
  const grey = new THREE.MeshStandardMaterial({ color: 0x8c8c88, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.85 });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.14, 16), grey);
  neck.rotation.x = Math.PI / 2 - 0.35;
  neck.position.set(0, 0.03, 0.38);
  eagle.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.068, 24, 18), grey);
  head.scale.set(1, 0.92, 1.18);
  head.position.set(0, 0.06, 0.46);
  eagle.add(head);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 0.2 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), eyeMat);
    eye.position.set(0.045 * side, 0.075, 0.5);
    eagle.add(eye);
  }
  for (const side of [-1, 1]) {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 8), dark);
    crest.position.set(0.03 * side, 0.12, 0.43);
    crest.rotation.set(-0.9, 0, -0.35 * side);
    eagle.add(crest);
  }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.075, 10), dark);
  beak.rotation.x = Math.PI / 2 + 0.45;
  beak.position.set(0, 0.04, 0.535);
  eagle.add(beak);
  // tucked feet with yellow talons
  const feet = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd9a531, roughness: 0.6 }));
  feet.position.set(0, -0.08, -0.12);
  eagle.add(feet);

  const upperTex = featherTexture("#2b2c30", "#6a6b70", false);
  const primTex = featherTexture("#121214", "#2e2f33", true);
  const tailTex = featherTexture("#1a1a1d", "#8a8a86", true);
  const mat = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, side: THREE.DoubleSide, roughness: 0.82 });
  const covertMat = mat(upperTex), primMat = mat(primTex), tailMat = mat(tailTex);

  // tail: fanned feathers
  const tail = new THREE.Group();
  tail.position.set(0, 0.0, -0.3);
  for (let i = 0; i < 12; i++) {
    const a = (i / 11 - 0.5) * 0.7;
    const f = new THREE.Mesh(featherGeometry(0.34, 0.075), tailMat);
    f.rotation.y = a;
    f.position.y = -0.002 * Math.abs(i - 5.5);
    tail.add(f);
  }
  eagle.add(tail);

  const makeWing = (side: 1 | -1) => {
    const root = new THREE.Group();
    root.position.set(0.08 * side, 0.04, 0.08);
    // arm: overlapping coverts and a trailing row of secondaries
    for (let i = 0; i < 11; i++) {
      const x = (0.03 + i * 0.045) * side;
      const sec = new THREE.Mesh(featherGeometry(0.44 - i * 0.006, 0.1), covertMat);
      sec.position.set(x, -0.004, -0.02);
      sec.rotation.y = -0.05 * side;
      root.add(sec);
      const cov = new THREE.Mesh(featherGeometry(0.22, 0.095), covertMat);
      cov.position.set(x, 0.006, 0.1);
      root.add(cov);
      const lesser = new THREE.Mesh(featherGeometry(0.12, 0.085), covertMat);
      lesser.position.set(x, 0.012, 0.14);
      root.add(lesser);
    }
    // hand: splayed primaries ("fingers")
    const hand = new THREE.Group();
    hand.position.x = 0.52 * side;
    const prims: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const f = new THREE.Mesh(featherGeometry(0.5 + i * 0.012, 0.095 - i * 0.003), primMat);
      f.position.set((0.02 + i * 0.018) * side, -0.002 * i, 0.06 - i * 0.012);
      // fan from pointing back to pointing out along the span
      f.rotation.y = (-0.2 - i * 0.19) * side;
      hand.add(f);
      prims.push(f);
      const pc = new THREE.Mesh(featherGeometry(0.15, 0.07), covertMat);
      pc.position.set((0.02 + i * 0.02) * side, 0.008, 0.08);
      pc.rotation.y = (-0.2 - i * 0.12) * side;
      hand.add(pc);
    }
    root.add(hand);
    eagle.add(root);
    return { root, hand, prims };
  };
  const L = makeWing(-1), R = makeWing(1);

  return {
    group: eagle,
    pose(flap: number, dihedral: number) {
      L.root.rotation.z = -(dihedral + flap);
      R.root.rotation.z = dihedral + flap;
      // the hand lags the arm and the primaries bend up on the downstroke
      L.hand.rotation.z = -flap * 0.55;
      R.hand.rotation.z = flap * 0.55;
      const bend = Math.max(0, -flap) * 0.5 + 0.08;
      L.prims.forEach((f, i) => (f.rotation.x = bend * (0.4 + i * 0.08)));
      R.prims.forEach((f, i) => (f.rotation.x = bend * (0.4 + i * 0.08)));
    },
  };
}

// ---------------------------------------------------------------- scene

export type GroundSceneHandle = { renderAt: (t: number) => void; dispose: () => void };

export function createGroundScene(opts: { canvas: HTMLCanvasElement; pixelRatio?: number; onReady: () => void }): GroundSceneHandle {
  seed = 1234567;
  const { canvas } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(opts.pixelRatio ?? 1.5);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SKY_HORIZON.clone(), FOG_DENSITY);
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.3, 90000);

  const shared = LIGHT_UNIFORMS();

  // sky
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(50000, 32, 16),
    new THREE.ShaderMaterial({ uniforms: shared, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false }),
  );
  sky.renderOrder = -10;
  scene.add(sky);

  // light for standard materials (trees, rocks, eagles), with sky ambient
  const sun = new THREE.DirectionalLight(SUN_COL, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(8192, 8192);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 1.5;
  scene.add(sun);
  scene.add(sun.target);
  /** keep a shadow box centred just ahead of the camera */
  const aimShadows = (focus: THREE.Vector3, size: number) => {
    const cam = sun.shadow.camera as THREE.OrthographicCamera;
    cam.left = cam.bottom = -size;
    cam.right = cam.top = size;
    cam.near = 1;
    cam.far = 6000;
    cam.updateProjectionMatrix();
    sun.target.position.copy(focus);
    sun.position.copy(focus).addScaledVector(SUN_DIR, 3000);
    sun.target.updateMatrixWorld();
  };
  scene.add(new THREE.HemisphereLight(0xbcd3ea, 0x3a3a26, 1.1));

  // terrain: a wide low-res landscape and a detailed patch around the falls
  const canopy = canopyTexture();
  canopy.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // standard material (shadows, fog, log-depth) with the canopy texture blended in
  const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
  terrainMat.onBeforeCompile = (sh) => {
    sh.uniforms.canopy = { value: canopy };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float forest;\nvarying float vForest;\nvarying vec3 vWPos;\nvarying vec3 vWN;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvForest = forest;\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D canopy;\nvarying float vForest;\nvarying vec3 vWPos;\nvarying vec3 vWN;\n" + GNOISE)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          vec3 c1 = texture2D(canopy, vWPos.xz / 230.0).rgb;
          vec3 c2 = texture2D(canopy, vWPos.xz / 61.0 + 0.37).rgb;
          diffuseColor.rgb *= mix(vec3(1.0), c1 * c2 * 3.2, vForest);
        }
        float steep = 1.0 - smoothstep(0.42, 0.72, normalize(vWN).y);
        if (steep > 0.001) {
          vec3 q = vWPos;
          float strata = noise(vec3((q.x + q.z) * 0.004, q.y * 0.07, 0.0));
          float grain = noise(q * 0.15) * 0.5 + noise(q * 0.6) * 0.3 + noise(q * 2.1) * 0.2;
          float seep = noise(vec3((q.x + q.z) * 0.045, q.y * 0.003, 1.0));
          vec3 rock = mix(vec3(0.13, 0.11, 0.095), vec3(0.3, 0.25, 0.2), strata) * (0.55 + 0.7 * grain);
          rock *= mix(1.0, 0.4, smoothstep(0.55, 0.8, seep));
          float moss = smoothstep(0.56, 0.74, noise(q * 0.018 + 5.0) * 0.6 + noise(q * 0.08) * 0.4);
          rock = mix(rock, vec3(0.08, 0.15, 0.05) * (0.75 + 0.4 * grain), moss * 0.6);
          diffuseColor.rgb = mix(diffuseColor.rgb, rock, steep);
        }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          float st = 1.0 - smoothstep(0.42, 0.72, normalize(vWN).y);
          vec3 b = vec3(noise(vWPos * 0.09), noise(vWPos * 0.09 + 13.0), noise(vWPos * 0.09 + 29.0)) - 0.5;
          b += (vec3(noise(vWPos * 0.4), noise(vWPos * 0.4 + 7.0), noise(vWPos * 0.4 + 17.0)) - 0.5) * 0.6;
          normal = normalize(normal + b * st * 1.4);
        }`,
      );
  };
  const nearBox = { x0: -1600, x1: 1600, z0: -1700, z1: 2300 };
  const inNear = (x: number, z: number) => x > nearBox.x0 + 40 && x < nearBox.x1 - 40 && z > nearBox.z0 + 40 && z < nearBox.z1 - 40;
  const farLand = new THREE.Mesh(buildTerrain(34000, 38000, 520, 580, 0, 2500, (x, z) => (inNear(x, z) ? 12 : 0)), terrainMat);
  farLand.receiveShadow = true;
  scene.add(farLand);
  const nearLand = new THREE.Mesh(buildTerrain(3200, 4000, 700, 900, 0, 300, () => 0), terrainMat);
  nearLand.receiveShadow = true;
  nearLand.castShadow = true;
  scene.add(nearLand);

  // rivers and sea
  const riverUniforms = { ...shared, deep: { value: new THREE.Color(0.07, 0.045, 0.025) } };
  const riverMat = new THREE.ShaderMaterial({ uniforms: riverUniforms, vertexShader: WATER_VERT, fragmentShader: RIVER_FRAG });
  const amazonMat = new THREE.ShaderMaterial({
    uniforms: { ...shared, deep: { value: new THREE.Color(0.2, 0.13, 0.07) } },
    vertexShader: WATER_VERT,
    fragmentShader: RIVER_FRAG,
  });
  scene.add(new THREE.Mesh(riverRibbon(-6500, LIPZ + 1.5, 6, (z) => sstep(LIPZ - 160, LIPZ - 5, z)), riverMat));
  scene.add(
    new THREE.Mesh(
      riverRibbon(LIPZ + 45, 16200, 6, (z) => 1 - sstep(LIPZ + 80, LIPZ + 520, z) + 0.2 * (1 - sstep(LIPZ + 520, LIPZ + 1600, z))),
      amazonMat,
    ),
  );
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(90000, 40000, 1, 1), new THREE.ShaderMaterial({ uniforms: shared, vertexShader: WATER_VERT, fragmentShader: SEA_FRAG }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, 0.3, 34000);
  (sea.geometry as THREE.BufferGeometry).setAttribute("rapids", new THREE.BufferAttribute(new Float32Array(4), 1));
  scene.add(sea);

  // the falls: two layers of falling water
  const fallMats = [0, 1].map(
    (layer) =>
      new THREE.ShaderMaterial({
        uniforms: { ...shared, layer: { value: layer } },
        vertexShader: FALL_VERT,
        fragmentShader: FALL_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
  );
  const front = new THREE.Mesh(fallSheet(riverX(LIPZ), LIP_Y, LIPZ, BASE_Y, FALL_W, OUT), fallMats[0]);
  scene.add(front);
  const back = new THREE.Mesh(fallSheet(riverX(LIPZ), LIP_Y, LIPZ, BASE_Y, FALL_W * 0.96, OUT, -5), fallMats[1]);
  back.renderOrder = -1;
  scene.add(back);
  const fallMeshes: THREE.Object3D[] = [front, back];
  // thinner falls streaming off the cliff on either side
  const sideFalls = [-1150, -620, 700, 1380].map((x0, k) => {
    const lz = edgeZ(x0);
    const top = height(x0, lz - 30) - 1;
    const base = height(x0, lz + 90) + 2;
    const w = 14 + k * 5;
    const mesh = new THREE.Mesh(fallSheet(x0, top, lz - 2, base, w, 1.4, 0, 160), fallMats[0]);
    scene.add(mesh);
    fallMeshes.push(mesh);
    return { x0, lz, top, base, w };
  });

  // spray
  const impact = new THREE.Vector3(riverX(LIPZ), BASE_Y, LIPZ + 1.5 + OUT * Math.sqrt(LIP_Y - BASE_Y));
  const sprayN = 55000;
  const sprayG = new THREE.BufferGeometry();
  const sp = new Float32Array(sprayN * 3);
  const ss = new Float32Array(sprayN * 4);
  for (let i = 0; i < sprayN; i++) ss.set([rnd(), rnd(), rnd(), rnd()], i * 4);
  sprayG.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  sprayG.setAttribute("seedv", new THREE.BufferAttribute(ss, 4));
  sprayG.boundingSphere = new THREE.Sphere(impact, 400);
  const sprayMat = new THREE.ShaderMaterial({
    uniforms: { ...shared, pixelRatio: { value: renderer.getPixelRatio() }, impact: { value: impact }, width: { value: FALL_W } },
    vertexShader: SPRAY_VERT,
    fragmentShader: SPRAY_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const spray = new THREE.Points(sprayG, sprayMat);
  scene.add(spray);

  // soft particles: sprites fade out where they meet terrain, rock or trees
  const depthRT = new THREE.WebGLRenderTarget(1, 1);
  depthRT.depthTexture = new THREE.DepthTexture(1, 1);
  const softUniforms = {
    sceneDepth: { value: depthRT.depthTexture as THREE.Texture },
    resolution: { value: new THREE.Vector2(1, 1) },
    camNear: { value: 1 },
    camFar: { value: 70000 },
  };
  const softSprite = (m: THREE.SpriteMaterial, softness: number) => {
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, softUniforms, { softness: { value: softness } });
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\n#include <packing>\nuniform sampler2D sceneDepth;\nuniform vec2 resolution;\nuniform float camNear;\nuniform float camFar;\nuniform float softness;",
        )
        .replace(
          "#include <opaque_fragment>",
          `float sceneZ = perspectiveDepthToViewZ(texture2D(sceneDepth, gl_FragCoord.xy / resolution).x, camNear, camFar);
          float partZ = perspectiveDepthToViewZ(gl_FragCoord.z, camNear, camFar);
          diffuseColor.a *= smoothstep(0.0, softness, partZ - sceneZ);
          #include <opaque_fragment>`,
        );
    };
    return m;
  };
  const transient: THREE.Object3D[] = [];

  // mist billowing out of the gorge
  const cloudTex = [0, 1, 2, 3, 4, 5].map(cloudTexture);
  type Puff = { sprite: THREE.Sprite; a: number; r: number; rise: number; drift: number; period: number; off: number; size: number; peak: number; y0: number };
  const puffs: Puff[] = [];
  for (let i = 0; i < 420; i++) {
    const big = i < 200;
    const m = softSprite(new THREE.SpriteMaterial({ map: cloudTex[i % 6], transparent: true, depthWrite: false, fog: true, color: 0xf2f5f7 }), 30);
    const s = new THREE.Sprite(m);
    scene.add(s);
    transient.push(s);
    puffs.push({
      sprite: s,
      a: rnd() * Math.PI * 2,
      r: 5 + rnd() * (big ? 110 : 60),
      rise: big ? 5 + rnd() * 5 : 2 + rnd() * 4,
      drift: 3 + rnd() * 5,
      period: big ? 20 + rnd() * 12 : 6 + rnd() * 6,
      off: rnd(),
      size: big ? 160 + rnd() * 200 : 60 + rnd() * 80,
      peak: big ? 0.05 : 0.07,
      y0: big ? BASE_Y + 10 : BASE_Y - 4,
    });
  }

  // spray that the falling water turns into: puffs that travel down with it
  type FallPuff = { sprite: THREE.Sprite; u: number; off: number; period: number; size: number; push: number };
  const fallPuffs: FallPuff[] = [];
  for (let i = 0; i < 360; i++) {
    const m = softSprite(new THREE.SpriteMaterial({ map: cloudTex[i % 6], transparent: true, depthWrite: false, fog: true, color: 0xf4f6f8 }), 20);
    const s = new THREE.Sprite(m);
    scene.add(s);
    transient.push(s);
    fallPuffs.push({ sprite: s, u: rnd(), off: rnd(), period: 5 + rnd() * 3, size: 35 + rnd() * 55, push: rnd() });
  }

  // clouds: the deck we descend through, a scattered sky, and low haze over the forest
  const cloudLayer = (n: number, place: () => [number, number, number, number, number]) => {
    for (let i = 0; i < n; i++) {
      const [x, y, z, size, op] = place();
      const m = softSprite(
        new THREE.SpriteMaterial({ map: cloudTex[i % 6], transparent: true, depthWrite: false, fog: true, opacity: op, rotation: rnd() * Math.PI * 2 }),
        60,
      );
      const s = new THREE.Sprite(m);
      s.position.set(x, y, z);
      s.scale.setScalar(size);
      scene.add(s);
      transient.push(s);
    }
  };
  cloudLayer(1100, () => [-5000 + (rnd() - 0.5) * 3200, 1250 + rnd() * 650, 8700 + (rnd() - 0.5) * 3400, 180 + rnd() * 420, 0.9]);
  // morning mist lying over the Amazon canopy
  cloudLayer(320, () => [-7000 + rnd() * 9000, 100 + rnd() * 110, 800 + rnd() * 9500, 350 + rnd() * 550, 0.1]);
  cloudLayer(160, () => [(rnd() - 0.5) * 14000, 100 + rnd() * 120, 3000 + rnd() * 12000, 400 + rnd() * 500, 0.07]);
  // clouds clinging to the cliff face
  cloudLayer(40, () => {
    let x = (rnd() - 0.5) * 6000;
    if (Math.abs(x) < 300) x += Math.sign(x || 1) * 300;
    return [x, 330 + rnd() * 300, edgeZ(x) + 80 + rnd() * 220, 260 + rnd() * 240, 0.13];
  });
  cloudLayer(90, () => [(rnd() - 0.5) * 7000, TOP + 40 + rnd() * 120, -4500 + rnd() * 3800, 300 + rnd() * 400, 0.08]);

  // rainforest canopy: thousands of individual crowns
  const crownGeoms = [0, 1, 2, 3].map((k) => {
    const g = mergeVertices(new THREE.IcosahedronGeometry(1, 4).deleteAttribute("normal").deleteAttribute("uv"));
    const p = g.attributes.position as THREE.BufferAttribute;
    const c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      // leafy clumps on the crown
      const bump = 0.78 + 0.3 * noise2(x * 2.2 + k * 10, z * 2.2 + y * 1.7) + 0.14 * noise2(x * 7.3 + k, z * 7.3 - y * 5.1);
      const flat = y < 0 ? 0.35 : 1;
      p.setXYZ(i, x * bump, y * bump * flat, z * bump);
      const ao = 0.45 + 0.55 * sstep(-0.6, 0.8, y);
      c.set([ao, ao, ao], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    g.computeVertexNormals();
    return g;
  });
  const crownMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0 });
  crownMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLeafPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLeafPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLeafPos;\n" + GNOISE)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float leafA = noise(vLeafPos * 1.1);
        float leafB = noise(vLeafPos * 3.3 + 7.0);
        float leafC = noise(vLeafPos * 9.0 + 3.0);
        float leaf = leafA * 0.45 + leafB * 0.35 + leafC * 0.2;
        diffuseColor.rgb *= 0.45 + 1.05 * leaf;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.15, 1.25, 0.8), smoothstep(0.6, 0.85, leafB) * 0.5);`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        vec3 bumpN = vec3(noise(vLeafPos * 1.6), noise(vLeafPos * 1.6 + 11.0), noise(vLeafPos * 1.6 + 23.0)) - 0.5;
        bumpN += (vec3(noise(vLeafPos * 5.0), noise(vLeafPos * 5.0 + 5.0), noise(vLeafPos * 5.0 + 9.0)) - 0.5) * 0.6;
        normal = normalize(normal + bumpN * 1.1);`,
      );
  };
  const crowns: { x: number; y: number; z: number; r: number; h: number; c: THREE.Color }[] = [];
  const trunks: [number, number, number, number, number][] = [];
  const tryCrown = (x: number, z: number, minR: number, maxR: number) => {
    const dxr = Math.abs(x - riverX(z));
    if (dxr < riverW(z) * 1.15) return;
    const y = height(x, z);
    if (y < 3) return;
    const e = 3;
    const sl = Math.hypot(height(x + e, z) - height(x - e, z), height(x, z + e) - height(x, z - e)) / (2 * e);
    if (sl > 0.9) return;
    if (z > LIPZ - 40 && z < LIPZ + 440 && dxr < 240 && y < BASE_Y + 25) return; // keep the plunge pool clear
    // a closed canopy with emergent giants standing clear of it
    const emergent = rnd() < 0.05;
    const r = (minR + Math.pow(rnd(), 1.6) * (maxR - minR)) * (emergent ? 1.8 : 1);
    const hue = 0.2 + rnd() * 0.13;
    const c = new THREE.Color().setHSL(hue, 0.3 + rnd() * 0.32, 0.07 + rnd() * 0.12);
    if (rnd() < 0.06) c.setHSL(0.23 + rnd() * 0.04, 0.55, 0.22); // fresh lime-green flush
    if (rnd() < 0.01) c.setHSL(0.12 + rnd() * 0.04, 0.6, 0.3); // flowering ipê
    const crownY = emergent ? y + 16 + r * 0.2 : y + r * 0.35;
    crowns.push({ x, y: crownY, z, r, h: r * (0.45 + rnd() * 0.3), c });
    if (emergent) trunks.push([x, y - 2, z, crownY - y + 2, 0.9 + r * 0.04]);
  };
  // dense around the falls, on the mountain top and in the valley below
  for (let x = nearBox.x0; x < nearBox.x1; x += 8) for (let z = nearBox.z0; z < nearBox.z1; z += 8) tryCrown(x + (rnd() - 0.5) * 7, z + (rnd() - 0.5) * 7, 5, 12);
  // the Amazon lowland we fly over
  for (let i = 0; i < 170000; i++) tryCrown(-6600 + rnd() * 6400, 1200 + rnd() * 8800, 7, 16);
  // the mountain top seen from the lip
  for (let i = 0; i < 40000; i++) tryCrown(-3200 + rnd() * 6400, -4600 + rnd() * 2900, 7, 14);
  // along the river down to the sea
  for (let i = 0; i < 70000; i++) {
    const z = 2300 + rnd() * 13800;
    tryCrown(riverX(z) + (rnd() - 0.5) * 2400, z, 7, 15);
  }
  const perGeom = Math.ceil(crowns.length / crownGeoms.length);
  const m4 = new THREE.Matrix4();
  crownGeoms.forEach((g, k) => {
    const list = crowns.slice(k * perGeom, (k + 1) * perGeom);
    const inst = new THREE.InstancedMesh(g, crownMat, list.length);
    inst.castShadow = true;
    inst.receiveShadow = true;
    list.forEach((c, i) => {
      m4.compose(new THREE.Vector3(c.x, c.y, c.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28), new THREE.Vector3(c.r, c.h, c.r));
      inst.setMatrixAt(i, m4);
      inst.setColorAt(i, c.c);
    });
    inst.frustumCulled = false;
    scene.add(inst);
  });

  // trunks of the emergent giants
  {
    const tg = new THREE.CylinderGeometry(0.7, 1, 1, 7);
    tg.translate(0, 0.5, 0);
    const trunkInst = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: 0x8a8272, roughness: 0.9 }), trunks.length);
    trunks.forEach(([x, y, z, hgt, rad], i) => {
      m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(rad, hgt, rad));
      trunkInst.setMatrixAt(i, m4);
    });
    trunkInst.castShadow = true;
    trunkInst.frustumCulled = false;
    scene.add(trunkInst);
  }

  // palms along the Amazon and scattered through the forest
  {
    const frondTex = canvasTex(256, (c, sz) => {
      c.clearRect(0, 0, sz, sz);
      c.strokeStyle = "#3f5a25";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(sz / 2, 0);
      c.lineTo(sz / 2, sz);
      c.stroke();
      for (let y = 6; y < sz - 4; y += 5) {
        const len = sz * 0.46 * Math.sin((Math.PI * y) / sz);
        c.strokeStyle = `hsl(${88 + rnd() * 20},${38 + rnd() * 18}%,${18 + rnd() * 14}%)`;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(sz / 2, y);
        c.lineTo(sz / 2 - len, y + 14);
        c.moveTo(sz / 2, y);
        c.lineTo(sz / 2 + len, y + 14);
        c.stroke();
      }
    });
    const fronds: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 13; k++) {
      const g = new THREE.PlaneGeometry(2.6, 6.5, 1, 8);
      const pp = g.attributes.position as THREE.BufferAttribute;
      const a = (k / 13) * Math.PI * 2 + rnd() * 0.3;
      const lift = 0.35 + rnd() * 0.45;
      for (let i = 0; i < pp.count; i++) {
        const across = pp.getX(i);
        const l = pp.getY(i) + 3.25; // 0..6.5 along the frond
        const rr = l * Math.cos(lift * 0.6);
        const y = l * Math.sin(lift) - 0.06 * l * l;
        const x = Math.cos(a) * rr - Math.sin(a) * across;
        const z = Math.sin(a) * rr + Math.cos(a) * across;
        pp.setXYZ(i, x, y - Math.abs(across) * 0.25, z);
      }
      g.computeVertexNormals();
      fronds.push(g);
    }
    const frondGeo = mergeGeometries(fronds);
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1, 6);
    trunkGeo.translate(0, 0.5, 0);
    const spots: [number, number, number, number][] = [];
    for (let i = 0; i < 9000; i++) {
      const z = LIPZ + 600 + rnd() * 15000;
      const side = rnd() < 0.5 ? -1 : 1;
      const x = riverX(z) + side * riverW(z) * (1.2 + rnd() * 3.5);
      const y = height(x, z);
      if (y > 2) spots.push([x, y, z, 16 + rnd() * 12]);
    }
    for (let i = 0; i < 6000; i++) {
      const x = -6600 + rnd() * 6400, z = 1200 + rnd() * 8800;
      if (Math.abs(x - riverX(z)) < riverW(z) * 1.2) continue;
      spots.push([x, height(x, z), z, 18 + rnd() * 10]);
    }
    const frondInst = new THREE.InstancedMesh(
      frondGeo,
      new THREE.MeshStandardMaterial({ map: frondTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.85 }),
      spots.length,
    );
    const palmTrunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x6b6152, roughness: 0.95 }), spots.length);
    spots.forEach(([x, y, z, hgt], i) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 0.12, rnd() * 6.28, (rnd() - 0.5) * 0.12));
      m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, hgt, 1));
      palmTrunks.setMatrixAt(i, m4);
      const s = 0.9 + rnd() * 0.5;
      m4.compose(new THREE.Vector3(x, y + hgt, z), q, new THREE.Vector3(s, s, s));
      frondInst.setMatrixAt(i, m4);
      frondInst.setColorAt(i, new THREE.Color().setHSL(0.22 + rnd() * 0.06, 0.4, 0.45 + rnd() * 0.2));
    });
    [frondInst, palmTrunks].forEach((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false;
      scene.add(o);
    });
  }

  // boulders around the pool, on the lip and down the gorge
  const rockGeo = mergeVertices(new THREE.IcosahedronGeometry(1, 4).deleteAttribute("normal").deleteAttribute("uv"));
  {
    const p = rockGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = 0.72 + 0.45 * noise2(x * 1.7 + 3, z * 1.7 + y * 2.3) + 0.08 * noise2(x * 6.1, y * 6.1 + z * 3.3);
      p.setXYZ(i, x * k, y * k * 0.7, z * k);
    }
    rockGeo.computeVertexNormals();
  }
  const rocks: [number, number, number, number][] = [];
  for (let i = 0; i < 160; i++) {
    const z = LIPZ + 60 + rnd() * 520;
    const side = rnd() < 0.5 ? -1 : 1;
    const x = riverX(z) + side * (riverW(z) * (0.55 + rnd() * 0.6));
    rocks.push([x, riverLevel(z) - 1, z, 4 + rnd() * 11]);
  }
  // the water crashes onto this pile of giant boulders
  for (let i = 0; i < 46; i++) {
    const u = rnd();
    const x = riverX(LIPZ) + (u - 0.5) * FALL_W * 1.7;
    const z = LIPZ + 50 + rnd() * 110;
    rocks.push([x, BASE_Y - 4 + rnd() * 6, z, 10 + rnd() * 22]);
  }
  for (let i = 0; i < 40; i++) {
    const z = LIPZ - 120 + rnd() * 115;
    const x = riverX(z) + (rnd() < 0.5 ? -1 : 1) * riverW(z) * (0.9 + rnd() * 0.5);
    rocks.push([x, P - 2, z, 3 + rnd() * 6]);
  }
  const rockInst = new THREE.InstancedMesh(rockGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }), rocks.length);
  rockInst.castShadow = true;
  rockInst.receiveShadow = true;
  rocks.forEach(([x, y, z, s], i) => {
    m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(), rnd() * 6, rnd())), new THREE.Vector3(s, s, s));
    rockInst.setMatrixAt(i, m4);
    rockInst.setColorAt(i, new THREE.Color().setHSL(0.07 + rnd() * 0.03, 0.14, 0.07 + rnd() * 0.07));
  });
  scene.add(rockInst);

  // eagles
  const eagles = [buildEagle(), buildEagle(), buildEagle()];
  eagles.forEach((e) => scene.add(e.group));

  // ------------------------------------------------ camera choreography
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const keys: { t: number; pos: THREE.Vector3; look: THREE.Vector3 }[] = [
    // out of the clouds, low over the Amazon
    { t: 0, pos: V(-5200, 1750, 8400), look: V(-4300, 950, 6700) },
    { t: 3.5, pos: V(-4700, 1150, 7200), look: V(-3100, 520, 4800) },
    { t: 8, pos: V(-3700, 560, 5400), look: V(-1500, 450, 2200) },
    // the table mountain and its waterfall grow ahead
    { t: 12.5, pos: V(-2400, 470, 3600), look: V(-200, 450, 200) },
    { t: 17, pos: V(-1100, 420, 2200), look: V(0, 420, LIPZ) },
    // the full height, framed on the right for the website content
    { t: G.reveal, pos: V(650, 330, 1650), look: V(-560, 420, LIPZ) },
    // climb to the lip...
    { t: 27, pos: V(420, 700, 750), look: V(-20, 620, LIPZ) },
    { t: 31, pos: V(170, 800, LIPZ + 230), look: V(0, 330, LIPZ + 70) },
    // ...and ride down with the water into the spray
    { t: 35, pos: V(130, 420, LIPZ + 520), look: V(0, 160, LIPZ + 100) },
    { t: 38.5, pos: V(90, 150, LIPZ + 640), look: V(0, 80, LIPZ + 100) },
    // then follow the river out to the sea
    { t: 42, pos: V(260, 300, 1900), look: V(riverX(4800), 120, 4800) },
    { t: 47, pos: V(riverX(9000), 650, 9000), look: V(riverX(14000), 80, 14500) },
    { t: G.end, pos: V(riverX(13200), 800, 13200), look: V(0, 0, 18800) },
  ];
  const curve = new THREE.CatmullRomCurve3(
    keys.map((k) => k.pos),
    false,
    "centripetal",
  );
  const lengths = curve.getLengths(4000);
  const total = lengths[lengths.length - 1];
  const keyU = keys.map((_, i) => lengths[Math.round((i / (keys.length - 1)) * 4000)] / total);
  const easeInOut = (x: number) => x * x * (3 - 2 * x);
  const uAt = (t: number) => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const s = THREE.MathUtils.clamp((t - keys[i].t) / (keys[i + 1].t - keys[i].t), 0, 1);
    // blend linear with eased so speed changes gently at each key
    return mix(keyU[i], keyU[i + 1], s * 0.6 + easeInOut(s) * 0.4);
  };
  const lookAt = (t: number) => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const s = THREE.MathUtils.clamp((t - keys[i].t) / (keys[i + 1].t - keys[i].t), 0, 1);
    return new THREE.Vector3().lerpVectors(keys[i].look, keys[i + 1].look, easeInOut(s));
  };
  const camAt = (t: number) => curve.getPointAt(THREE.MathUtils.clamp(uAt(t), 0, 1));

  // eagle paths are defined relative to the camera, so they always pass through shot
  const eagleOffset = (i: number, t: number) => {
    const s = (t - G.eaglesFrom) / (G.eaglesTo - G.eaglesFrom);
    if (i === 0) return new THREE.Vector3(-26 + 50 * s, -5 + 2 * Math.sin(s * 3), 22 - 6 * s); // glides across ahead
    if (i === 1) return new THREE.Vector3(55 - 60 * s, 8 + 4 * s, 80 - 10 * s); // further off, flapping
    return new THREE.Vector3(-4.2 + 1.5 * s, 1.2 - 1.8 * s, -7 + 34 * s); // overtakes right beside the camera
  };
  const frame = (t: number) => {
    const c = camAt(t);
    const f = new THREE.Vector3().subVectors(lookAt(t), c).normalize();
    const r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
    const u = new THREE.Vector3().crossVectors(r, f);
    return { c, f, r, u };
  };
  const eagleWorld = (i: number, t: number) => {
    const { c, f, r, u } = frame(t);
    const o = eagleOffset(i, t);
    return c.clone().addScaledVector(r, o.x).addScaledVector(u, o.y).addScaledVector(f, o.z);
  };

  // ------------------------------------------------ post
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.4, 0.92));
  composer.addPass(new OutputPass());
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    const pr = renderer.getPixelRatio();
    depthRT.setSize(w * pr, h * pr);
    softUniforms.resolution.value.set(w * pr, h * pr);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const draw = (t: number) => {
    shared.time.value = t;
    // camera
    camera.position.copy(camAt(t));
    camera.lookAt(lookAt(t));
    camera.fov = t < 3.5 ? 55 : 50;
    // near plane follows altitude: precise depth up close, no z-fighting from high up
    const eaglesNear = t > G.eaglesFrom - 0.5 && t < G.eaglesTo + 0.5;
    const ground = Math.max(camera.position.y - height(camera.position.x, camera.position.z), 1);
    camera.near = eaglesNear ? 0.5 : THREE.MathUtils.clamp(ground / 60, 0.5, 6);
    camera.far = 70000;
    camera.updateProjectionMatrix();
    sky.position.copy(camera.position);
    {
      const ahead = lookAt(t).clone().sub(camera.position).normalize();
      const focus = camera.position.clone().addScaledVector(ahead, 700);
      focus.y = Math.min(focus.y, P);
      aimShadows(focus, 900);
    }

    // mist
    for (const p of puffs) {
      const ph = (t / p.period + p.off) % 1;
      const age = ph * p.period;
      const rr = p.r + age * 2.5;
      p.sprite.position.set(impact.x + Math.cos(p.a) * rr, p.y0 + age * p.rise, impact.z + Math.sin(p.a) * rr * 0.6 + age * p.drift);
      p.sprite.scale.setScalar(p.size * (0.6 + ph * 0.9));
      p.sprite.material.opacity = p.peak * Math.sin(Math.PI * ph);
    }

    // spray travelling down with the water, spreading as it falls
    for (const f of fallPuffs) {
      const ph = (t / f.period + f.off) % 1;
      const v = 0.28 + ph * 0.72;
      const pt = fallPoint(f.u, v, riverX(LIPZ), LIP_Y, LIPZ, BASE_Y, FALL_W, OUT, 6 + f.push * 30 * v);
      f.sprite.position.copy(pt);
      f.sprite.scale.setScalar(f.size * (0.5 + v * 1.6));
      f.sprite.material.opacity = 0.07 * Math.sin(Math.PI * ph) * (0.4 + 0.6 * v);
    }

    // eagles
    eagles.forEach((e, i) => {
      const on = t > G.eaglesFrom && t < G.eaglesTo;
      e.group.visible = on;
      if (!on) return;
      const p = eagleWorld(i, t);
      const ahead = eagleWorld(i, t + 0.05);
      e.group.position.copy(p);
      e.group.lookAt(ahead);
      const vel = ahead.clone().sub(p);
      const bank = THREE.MathUtils.clamp(-vel.x * 0.02, -0.5, 0.5);
      e.group.rotateZ(bank);
      const flapRate = i === 1 ? 2.3 : 2.6;
      const flapping = i === 1 ? 1 : i === 2 ? 1 - sstep(G.eaglesFrom + 2.5, G.eaglesFrom + 3.5, t) : sstep(G.eaglesFrom + 3, G.eaglesFrom + 3.4, t) * (1 - sstep(G.eaglesFrom + 4.4, G.eaglesFrom + 4.8, t));
      e.pose(Math.sin(t * flapRate * Math.PI * 2 + i) * 0.55 * flapping, 0.12 + (1 - flapping) * 0.06);
    });

    // debug: inspect an eagle up close (?eagleCam=<angle>)
    const eagleCam = new URLSearchParams(location.search).get("eagleCam");
    if (eagleCam !== null && eagles[2].group.visible) {
      const e = eagles[2].group;
      const ang = Number(eagleCam) || 0;
      const off = new THREE.Vector3(Math.sin(ang) * 3.2, 1.4, Math.cos(ang) * 3.2).applyQuaternion(e.quaternion);
      camera.position.copy(e.position).add(off);
      camera.near = 0.05;
      camera.lookAt(e.position);
      camera.updateProjectionMatrix();
    }

    // depth pre-pass of the solid world for the soft particles
    softUniforms.camNear.value = camera.near;
    softUniforms.camFar.value = camera.far;
    const hidden = [...transient, sky, spray, ...fallMeshes];
    hidden.forEach((o) => (o.visible = false));
    const wasVisible = eagles.map((e) => e.group.visible);
    renderer.setRenderTarget(depthRT);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    hidden.forEach((o) => (o.visible = true));
    eagles.forEach((e, i) => (e.group.visible = wasVisible[i]));

    composer.render();
  };

  (window as unknown as { __ijGround: unknown }).__ijGround = { scene, camera, renderer };
  requestAnimationFrame(() => opts.onReady());

  return {
    renderAt: draw,
    dispose: () => {
      composer.dispose();
      renderer.dispose();
    },
  };
}
