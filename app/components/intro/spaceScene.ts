import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";

const TEX = "/intro/tex/";

/**
 * Timeline of the space -> Earth part of the intro (seconds). One continuous shot:
 *  0 -  7    deep inside the Milky Way beside a distant star; the camera slowly turns
 *  7 - 11    towards a distant planet: Saturn
 * 11 - 15    Jupiter, then Mars
 * 15 - 20    Earth is revealed and grows
 * 20 - 28    Earth rotates, country and ocean names on the globe, South America comes round
 * 28 - 34.5  accelerating dive onto the Guyana rainforest, through the cloud deck
 */
export const T = {
  earthArrive: 18.5,
  labelsIn: 19.5,
  labelsOut: 29,
  dive: 27.5,
  whiteout: 33,
  end: 34.5,
};
export const SPACE_DURATION = T.end;

type Label = { name: string; lat: number; lon: number; kind?: "ocean" | "target" | "falls" };

const LABELS: Label[] = [
  { name: "Atlantic Ocean", lat: 12, lon: -38, kind: "ocean" },
  { name: "South Atlantic", lat: -28, lon: -18, kind: "ocean" },
  { name: "Pacific Ocean", lat: 2, lon: -118, kind: "ocean" },
  { name: "Indian Ocean", lat: -18, lon: 75, kind: "ocean" },
  { name: "Southern Ocean", lat: -60, lon: -30, kind: "ocean" },
  { name: "Arctic Ocean", lat: 80, lon: 0, kind: "ocean" },
  { name: "Caribbean Sea", lat: 15, lon: -75, kind: "ocean" },
  { name: "Mediterranean", lat: 35, lon: 18, kind: "ocean" },
  { name: "Guyana", lat: 5.6, lon: -58.9, kind: "target" },
  { name: "Kaieteur Falls", lat: 5.17, lon: -59.48, kind: "falls" },
  { name: "Brazil", lat: -10, lon: -52 },
  { name: "Venezuela", lat: 7.5, lon: -66 },
  { name: "Colombia", lat: 4, lon: -73.5 },
  { name: "Peru", lat: -9.5, lon: -75 },
  { name: "Bolivia", lat: -17, lon: -64.5 },
  { name: "Argentina", lat: -35, lon: -65 },
  { name: "Chile", lat: -28, lon: -70.5 },
  { name: "Suriname", lat: 4, lon: -55.8 },
  { name: "Ecuador", lat: -1.5, lon: -78.5 },
  { name: "Paraguay", lat: -23, lon: -58 },
  { name: "Mexico", lat: 23, lon: -102 },
  { name: "United States", lat: 39, lon: -98 },
  { name: "Canada", lat: 58, lon: -105 },
  { name: "Cuba", lat: 21.8, lon: -79 },
  { name: "Greenland", lat: 72, lon: -40 },
  { name: "Iceland", lat: 65, lon: -18.5 },
  { name: "United Kingdom", lat: 54, lon: -2 },
  { name: "Spain", lat: 40, lon: -4 },
  { name: "France", lat: 46.5, lon: 2.5 },
  { name: "Germany", lat: 51, lon: 10 },
  { name: "Italy", lat: 42.5, lon: 12.5 },
  { name: "Morocco", lat: 31.5, lon: -7 },
  { name: "Algeria", lat: 28, lon: 2.5 },
  { name: "Libya", lat: 27, lon: 17 },
  { name: "Egypt", lat: 26.5, lon: 30 },
  { name: "Mali", lat: 17.5, lon: -4 },
  { name: "Nigeria", lat: 9.5, lon: 8 },
  { name: "Ethiopia", lat: 9, lon: 39.5 },
  { name: "DR Congo", lat: -3, lon: 23.5 },
  { name: "Kenya", lat: 0.5, lon: 38 },
  { name: "Angola", lat: -12.5, lon: 18 },
  { name: "Namibia", lat: -22, lon: 17 },
  { name: "South Africa", lat: -29, lon: 24.5 },
  { name: "Madagascar", lat: -19.5, lon: 46.7 },
  { name: "Saudi Arabia", lat: 24, lon: 45 },
  { name: "Iran", lat: 32, lon: 54 },
  { name: "India", lat: 22, lon: 79 },
];

// ---------- GLSL ----------

const NOISE = /* glsl */ `
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
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }
`;

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Faint emission nebula with dust lanes around the distant star.
const NEBULA_FRAG = /* glsl */ `
  uniform vec3 novaDir;
  varying vec3 vDir;
  ${NOISE}
  void main() {
    vec3 d = normalize(vDir);
    float a1 = acos(clamp(dot(d, novaDir), -1.0, 1.0));
    float mask = exp(-a1 * a1 * 4.0);
    vec3 p = d * 3.2;
    float warp = fbm(p * 1.6);
    float n1 = fbm(p + warp * 1.1);
    float n2 = fbm(p * 2.7 + 13.0 + warp);
    float gas = smoothstep(0.42, 0.92, n1) * mask;
    float dust = smoothstep(0.52, 0.78, n2) * mask;
    vec3 magenta = vec3(0.95, 0.22, 0.52);
    vec3 teal = vec3(0.16, 0.52, 0.95);
    vec3 amber = vec3(1.0, 0.58, 0.28);
    vec3 col = mix(magenta, teal, smoothstep(0.35, 0.72, n2));
    col = mix(col, amber, smoothstep(0.72, 0.95, n1) * 0.7);
    col *= gas * 0.9;
    col *= 1.0 - dust * 0.75;
    float alpha = clamp(gas * 0.5 + dust * 0.35, 0.0, 0.8);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

// The star: a real photosphere texture, gently boiling, hot white-yellow at
// the centre and darkening to deep orange-red at the limb.
const SUN_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vObj = position;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SUN_FRAG = /* glsl */ `
  uniform sampler2D sunMap;
  uniform float time;
  uniform float radius;
  varying vec2 vUv;
  varying vec3 vObj;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  ${NOISE}
  void main() {
    vec3 n = normalize(vNormalW);
    float mu = clamp(dot(n, normalize(cameraPosition - vPosW)), 0.0, 1.0);
    vec3 p = vObj / radius;
    // slow convective churn: warp the texture a touch and flicker fine granules
    vec2 warp = vec2(fbm(p * 6.0 + time * 0.14), fbm(p * 6.0 + 7.0 - time * 0.14)) - 0.5;
    vec2 suv = vUv;
    vec3 tex = texture2D(sunMap, suv + warp * 0.006).rgb;
    float boil = fbm(p * 34.0 + vec3(0.0, time * 0.4, time * 0.28));
    float flicker = fbm(p * 12.0 + vec3(time * 0.25, 0.0, -time * 0.2));
    vec3 col = tex * (0.78 + 0.34 * boil + 0.18 * flicker);
    // hotter core
    float lum = max(col.r, max(col.g, col.b));
    col = mix(col, vec3(1.0, 0.9, 0.66) * lum, pow(mu, 2.5) * 0.28);
    // limb darkening and reddening
    col *= 0.32 + 0.68 * pow(mu, 0.6);
    col *= mix(vec3(1.0, 0.5, 0.25), vec3(1.0), smoothstep(0.0, 0.55, mu));
    gl_FragColor = vec4(col * 1.2, 1.0);
    #include <colorspace_fragment>
  }
`;

// Corona as seen in eclipse photographs: a pearly inner glow, many fine
// radial streamers of varying length, a thin red chromosphere hugging the
// limb and small prominences just above it.
const CORONA_FRAG = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float r = length(q);
    float disc = 0.27;
    if (r < disc * 0.985) discard;
    float d = r - disc;
    vec3 dir = vec3(q / max(r, 1e-4), 0.0);
    float drift = time * 0.03;

    // streamers: fine angular structure, each ray with its own reach
    float reach = 0.3 + 0.7 * fbm(dir * 2.4 + vec3(3.0, 1.0, drift));
    float fine = noise(dir * 20.0 + vec3(0.0, 0.0, drift)) * 0.65 + noise(dir * 44.0 + vec3(5.0, 2.0, drift)) * 0.35;
    float rays = pow(fine, 3.0) * exp(-d / (0.035 + 0.11 * reach));

    float inner = exp(-d * 20.0);
    float halo = exp(-d * 7.0) * 0.05;
    float chromo = exp(-d * 150.0);
    float prom = smoothstep(0.6, 0.8, fbm(dir * 10.0 + vec3(0.0, 0.0, time * 0.16) + (d * 28.0 - time * 0.35))) * exp(-d * 60.0);

    // hot plasma boiling off the surface and streaming outward
    float wisps = fbm(vec3(dir.xy * 5.0, d * 9.0 - time * 0.55) + fbm(vec3(dir.xy * 11.0, d * 20.0 - time * 0.9)) * 0.8);
    wisps = smoothstep(0.45, 0.85, wisps) * exp(-d * 8.0);

    vec3 corona = vec3(1.0, 0.97, 0.92) * (inner * 0.55 + rays * 0.26 + halo) + vec3(1.0, 0.75, 0.45) * wisps * 0.18;
    vec3 fire = vec3(1.0, 0.32, 0.1) * (chromo * 1.1 + prom * 2.2);
    vec3 col = (corona + fire) * smoothstep(1.0, 0.6, r);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const BILLBOARD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Heat shimmer: the image around the star wavers like air over a hot road.
const HEAT_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    center: { value: new THREE.Vector2(0.5, 0.5) },
    radius: { value: 0.1 },
    aspect: { value: 16 / 9 },
    time: { value: 0 },
    strength: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 center;
    uniform float radius;
    uniform float aspect;
    uniform float time;
    uniform float strength;
    varying vec2 vUv;
    void main() {
      vec2 rel = vUv - center;
      rel.x *= aspect;
      float dist = length(rel);
      // strongest just outside the limb, fading out over a few radii
      float band = smoothstep(radius * 2.6, radius * 1.25, dist) * smoothstep(radius * 1.06, radius * 1.2, dist);
      vec2 p = vUv * vec2(aspect, 1.0) / max(radius, 0.001);
      vec2 wobble = vec2(
        sin(p.y * 26.0 + time * 6.3) + sin(p.y * 41.0 - time * 8.1 + p.x * 9.0) * 0.5,
        cos(p.x * 29.0 - time * 5.7) + cos(p.x * 45.0 + time * 7.3 + p.y * 7.0) * 0.5
      );
      vec2 uv = vUv + wobble * band * strength * radius * 0.0035;
      gl_FragColor = texture2D(tDiffuse, uv);
    }
  `,
};

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  uniform float cloudShift;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float ndl = dot(n, sunDir);
    float dayMix = smoothstep(-0.15, 0.2, ndl);
    vec3 day = pow(texture2D(dayMap, vUv).rgb, vec3(1.08)) * 1.12;
    vec3 night = texture2D(nightMap, vUv).rgb * vec3(1.0, 0.8, 0.5) * 1.8;
    float water = texture2D(specMap, vUv).r;
    float cloudS = texture2D(cloudMap, vUv + vec2(cloudShift - 0.0025, 0.0012)).r;
    day *= 1.0 - cloudS * 0.4;
    vec3 lit = day * (0.03 + max(ndl, 0.0) * 1.2);
    vec3 h = normalize(sunDir + v);
    float sp = pow(max(dot(n, h), 0.0), 160.0) * water * 0.3 * dayMix;
    vec3 col = mix(night, lit, dayMix) + vec3(1.0, 0.9, 0.75) * sp;
    // warm terminator glow
    col += vec3(1.0, 0.45, 0.2) * exp(-pow(ndl / 0.08, 2.0)) * 0.08;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    col = mix(col, vec3(0.4, 0.62, 1.0) * smoothstep(-0.2, 0.5, ndl), fres * 0.38);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const CLOUD_FRAG = /* glsl */ `
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  uniform float cloudShift;
  uniform float boost;
  varying vec2 vUv;
  varying vec3 vNormalW;
  void main() {
    vec3 n = normalize(vNormalW);
    float a = texture2D(cloudMap, vUv + vec2(cloudShift, 0.0)).r;
    float ndl = dot(n, sunDir);
    float light = 0.04 + smoothstep(-0.15, 0.45, ndl) * 1.05;
    gl_FragColor = vec4(vec3(light), clamp(a * (0.95 + boost) + boost * 0.25, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 sunDir;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float rim = pow(clamp(0.75 - dot(n, v), 0.0, 1.0), 3.0);
    float lit = smoothstep(-0.35, 0.55, dot(n, sunDir));
    gl_FragColor = vec4(vec3(0.3, 0.55, 1.0) * rim * 1.1 * lit, 1.0);
  }
`;

// ---------- procedural sprite textures ----------

function canvasTex(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  draw(cv.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radial(stops: [number, string][], size = 256) {
  return canvasTex(size, (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
  });
}

function starSpikes() {
  return canvasTex(512, (c, s) => {
    const m = s / 2;
    const g = c.createRadialGradient(m, m, 0, m, m, m);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.04, "rgba(255,250,240,0.9)");
    g.addColorStop(0.15, "rgba(255,210,160,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      c.save();
      c.translate(m, m);
      c.rotate((i * Math.PI) / 3 + 0.26);
      const lg = c.createLinearGradient(0, 0, m, 0);
      lg.addColorStop(0, "rgba(255,248,235,0.7)");
      lg.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = lg;
      c.beginPath();
      c.moveTo(0, -2.5);
      c.lineTo(m, 0);
      c.lineTo(0, 2.5);
      c.fill();
      c.restore();
    }
  });
}

// ---------- helpers ----------

/** Point on a SphereGeometry for a latitude / longitude in degrees. */
function latLonToVec(lat: number, lon: number, r = 1) {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.cos(lo) * r, Math.sin(la) * r, -Math.cos(la) * Math.sin(lo) * r);
}

const smooth = (x: number) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const range = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/** Monotone cubic (Fritsch–Carlson) interpolation through (xs, ys). */
function monotone(xs: number[], ys: number[]) {
  const n = xs.length;
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = xs.map((_, i) => (i === 0 ? 0 : i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
    );
  };
}

// ---------- labels painted onto the globe ----------

/** Equirectangular transparent texture with names at their lat/lon, wrapped on a sphere. */
function globeLabels(labels: Label[], maxAniso: number) {
  const W = 8192, H = 4096;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d")!;
  const spacing = (px: string) => ((c as unknown as { letterSpacing: string }).letterSpacing = px);
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const l of labels) {
    const x = ((l.lon + 180) / 360) * W;
    const y = ((90 - l.lat) / 180) * H;
    c.save();
    c.translate(x, y);
    // undo the horizontal squeeze the sphere applies away from the equator
    c.scale(1 / Math.cos(THREE.MathUtils.degToRad(l.lat)), 1);
    c.shadowColor = "rgba(0,0,0,0.75)";
    c.shadowBlur = 10;
    if (l.kind === "ocean") {
      c.font = "italic 400 84px Georgia, serif";
      spacing("14px");
      c.fillStyle = "rgba(190,222,255,0.78)";
      c.fillText(l.name, 0, 0);
    } else if (l.kind === "target") {
      c.font = "600 64px Arial, sans-serif";
      spacing("12px");
      c.fillStyle = "rgba(240,222,170,0.95)";
      c.fillText(l.name.toUpperCase(), 0, -34);
    } else if (l.kind === "falls") {
      c.fillStyle = "rgba(240,222,170,1)";
      c.beginPath();
      c.arc(0, 0, 7, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(240,222,170,0.8)";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, 18, 0, Math.PI * 2);
      c.stroke();
      c.font = "italic 400 30px Georgia, serif";
      c.textAlign = "left";
      c.fillStyle = "rgba(255,255,255,0.95)";
      c.fillText(l.name, 28, 2);
    } else {
      c.font = "500 44px Arial, sans-serif";
      spacing("7px");
      c.fillStyle = "rgba(255,255,255,0.86)";
      c.fillText(l.name.toUpperCase(), 0, 0);
    }
    c.restore();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  return t;
}

/** A small, faint far-away galaxy for the deep-space backdrop. */
function distantGalaxy(seed: number) {
  return canvasTex(256, (c, s) => {
    const m = s / 2;
    c.translate(m, m);
    c.rotate(seed * 2.1);
    c.scale(1, 0.28 + (seed % 3) * 0.18);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, m);
    g.addColorStop(0, "rgba(255,240,220,0.9)");
    g.addColorStop(0.12, "rgba(255,225,190,0.45)");
    g.addColorStop(0.45, "rgba(170,190,255,0.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(-m, -m, s, s);
  });
}

// ---------- scene ----------

export type SpaceSceneHandle = {
  start: () => void;
  /** Render one exact frame of the timeline (used to bake the intro film). */
  renderAt: (t: number) => void;
  dispose: () => void;
};

export function createSpaceScene(opts: {
  canvas: HTMLCanvasElement;
  /** Unused: labels are painted onto the globe. */
  labelLayer?: HTMLDivElement;
  onReady: () => void;
  onTick?: (t: number) => void;
  onFinish: () => void;
  /** No real-time loop: frames are drawn only through renderAt(). */
  manual?: boolean;
  pixelRatio?: number;
}): SpaceSceneHandle {
  const { canvas } = opts;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: !!opts.manual,
  });
  renderer.setPixelRatio(opts.pixelRatio ?? Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.002, 8000);

  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);
  const textures: THREE.Texture[] = [];
  const load = (f: string, srgb = true) => {
    const t = loader.load(TEX + f);
    textures.push(t);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };

  // Milky Way panorama (inside the galaxy)
  const sky = load("milkyway_8k.jpg");
  sky.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = sky;
  scene.backgroundIntensity = 0.9;
  scene.backgroundRotation.set(0.5, 2.2, 0.35);


  const supernovaPos = new THREE.Vector3(-430, 115, -1150);

  // Nebula shell that travels with the camera
  const nebula = new THREE.Mesh(
    new THREE.SphereGeometry(6000, 128, 64),
    new THREE.ShaderMaterial({
      uniforms: {
        novaDir: { value: supernovaPos.clone().normalize() },
      },
      vertexShader: SKY_VERT,
      fragmentShader: NEBULA_FRAG,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    }),
  );
  nebula.renderOrder = -1;
  scene.add(nebula);

  // Near stars — parallax that sells the speed
  {
    const n = 6000;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const tints = [
      [1, 1, 1],
      [0.8, 0.88, 1],
      [1, 0.92, 0.8],
      [1, 0.85, 0.7],
    ];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1600;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 900;
      pos[i * 3 + 2] = -Math.random() * 1800 + 300;
      const w = 0.35 + Math.pow(Math.random(), 3) * 0.65;
      const tint = tints[Math.floor(Math.random() * tints.length)];
      col.set([w * tint[0], w * tint[1], w * tint[2]], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    scene.add(
      new THREE.Points(
        g,
        new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false }),
      ),
    );
  }

  // Sun, with lens flare
  const sunPos = new THREE.Vector3(1400, 160, 500);
  const sunDir = sunPos.clone().normalize();
  const sunLight = new THREE.DirectionalLight(0xfff3e2, 3.4);
  sunLight.position.copy(sunPos);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x1a2233, 0.06));
  {
    const flare = new Lensflare();
    flare.addElement(
      new LensflareElement(radial([[0, "rgba(255,252,240,1)"], [0.06, "rgba(255,240,210,0.9)"], [0.2, "rgba(255,200,150,0.18)"], [1, "rgba(0,0,0,0)"]]), 380, 0),
    );
    flare.addElement(new LensflareElement(radial([[0, "rgba(255,225,190,0.35)"], [1, "rgba(0,0,0,0)"]]), 900, 0));
    flare.position.copy(sunPos);
    scene.add(flare);
  }

  // The star we start beside: a real, churning photosphere with a corona
  const STAR_R = 34;
  const sunUniforms = { time: { value: 0 }, radius: { value: STAR_R }, sunMap: { value: load("sun_4k.jpg") } };
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(STAR_R, 128, 128),
    new THREE.ShaderMaterial({ uniforms: sunUniforms, vertexShader: SUN_VERT, fragmentShader: SUN_FRAG }),
  );
  star.position.copy(supernovaPos);
  scene.add(star);
  const corona = new THREE.Mesh(
    new THREE.PlaneGeometry(STAR_R * 2 / 0.27, STAR_R * 2 / 0.27),
    new THREE.ShaderMaterial({
      uniforms: sunUniforms,
      vertexShader: BILLBOARD_VERT,
      fragmentShader: CORONA_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  corona.position.copy(supernovaPos);
  scene.add(corona);
  // Distant galaxies, pinned "at infinity" (they travel with the sky shell)
  [
    [0.55, 0.3, -0.78, 70],
    [-0.8, 0.45, -0.4, 45],
    [0.2, -0.35, -0.92, 38],
    [-0.35, 0.7, 0.6, 55],
    [0.9, -0.1, 0.35, 32],
    [-0.6, -0.5, -0.62, 48],
  ].forEach(([x, y, z, size], k) => {
    const g = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: distantGalaxy(k + 1), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }),
    );
    g.position.set(x, y, z).normalize().multiplyScalar(5000);
    g.scale.setScalar(size * 3);
    nebula.add(g);
  });

  // Planets
  const sphere = (r: number, seg = 96) => new THREE.SphereGeometry(r, seg, seg);
  const planet = (tex: string, r: number, pos: THREE.Vector3, tilt = 0) => {
    const m = new THREE.Mesh(sphere(r), new THREE.MeshStandardMaterial({ map: load(tex), roughness: 1, metalness: 0 }));
    m.position.copy(pos);
    m.rotation.z = tilt;
    scene.add(m);
    return m;
  };

  const saturnPos = new THREE.Vector3(-60, 14, -270);
  const saturn = planet("saturn_2k.jpg", 9, saturnPos, 0.47);
  {
    const inner = 11.2, outer = 21.5;
    const g = new THREE.RingGeometry(inner, outer, 200, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    const ring = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        map: load("saturn_ring.png"),
        transparent: true,
        side: THREE.DoubleSide,
        roughness: 1,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2 + 0.5;
    saturn.add(ring);
  }

  const jupiterPos = new THREE.Vector3(42, -9, -130);
  const jupiter = planet("jupiter_4k.jpg", 11, jupiterPos, 0.05);
  const marsPos = new THREE.Vector3(-5.5, 1.3, -34);
  const mars = planet("mars_2k.jpg", 0.95, marsPos, 0.44);
  const moon = planet("moon_2k.jpg", 0.27, new THREE.Vector3(-2.8, 0.8, -6.5));

  // Earth
  const earth = new THREE.Group();
  scene.add(earth);
  const cloudTex = load("earth_clouds_4k.jpg", false);
  cloudTex.wrapS = THREE.RepeatWrapping;
  const eu = {
    dayMap: { value: load("earth_day_8k.jpg") },
    nightMap: { value: load("earth_night_4k.jpg") },
    specMap: { value: load("earth_spec_4k.jpg", false) },
    cloudMap: { value: cloudTex },
    sunDir: { value: sunDir },
    cloudShift: { value: 0 },
    boost: { value: 0 },
  };
  earth.add(new THREE.Mesh(sphere(1, 192), new THREE.ShaderMaterial({ uniforms: eu, vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG })));
  const clouds = new THREE.Mesh(
    sphere(1.007, 192),
    new THREE.ShaderMaterial({ uniforms: eu, vertexShader: EARTH_VERT, fragmentShader: CLOUD_FRAG, transparent: true, depthWrite: false }),
  );
  earth.add(clouds);
  scene.add(
    new THREE.Mesh(
      sphere(1.016, 128),
      new THREE.ShaderMaterial({
        uniforms: { sunDir: { value: sunDir } },
        vertexShader: EARTH_VERT,
        fragmentShader: ATMO_FRAG,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    ),
  );

  // Rotate so that Kaieteur Falls ends up facing the camera (+z)
  const TARGET_LAT = 5.17, TARGET_LON = -59.48;
  const finalRotY = -Math.PI / 2 - THREE.MathUtils.degToRad(TARGET_LON);
  const startRotY = finalRotY - 4.4;
  earth.rotation.x = THREE.MathUtils.degToRad(TARGET_LAT);

  // Country / ocean names painted on the globe (above the clouds), plus a
  // separate layer for Guyana and Kaieteur Falls that stays on for the dive.
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const labelLayerMat = (tex: THREE.Texture) =>
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false });
  const worldLabels = labelLayerMat(globeLabels(LABELS.filter((l) => !l.kind || l.kind === "ocean"), aniso));
  const guyanaLabel = labelLayerMat(globeLabels(LABELS.filter((l) => l.kind === "target"), aniso));
  const fallsLabel = labelLayerMat(globeLabels(LABELS.filter((l) => l.kind === "falls"), aniso));
  earth.add(new THREE.Mesh(sphere(1.0095, 192), worldLabels));
  earth.add(new THREE.Mesh(sphere(1.0096, 192), guyanaLabel));
  earth.add(new THREE.Mesh(sphere(1.0097, 192), fallsLabel));

  // Post
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const heat = new ShaderPass(HEAT_SHADER);
  composer.addPass(heat);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.7, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 64 : 45;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  // ----- camera choreography -----
  const earthCenter = new THREE.Vector3(0, 0, 0);
  const keys = [
    // beside a distant star, looking at it
    { t: 0, pos: new THREE.Vector3(-330, 125, -930), look: supernovaPos },
    { t: 3.5, pos: new THREE.Vector3(-285, 108, -800), look: supernovaPos },
    // the camera slowly turns its angle toward a distant planet
    { t: 7, pos: new THREE.Vector3(-170, 68, -480), look: saturnPos },
    // pass each planet on its sunlit side (sun is towards +x)
    { t: 10.5, pos: new THREE.Vector3(10, 30, -222), look: saturnPos },
    { t: 13.5, pos: new THREE.Vector3(92, 4, -104), look: jupiterPos },
    { t: 15.8, pos: new THREE.Vector3(2.4, 2.4, -28), look: marsPos },
    { t: 17.6, pos: new THREE.Vector3(6.5, 1.4, -3), look: earthCenter },
    { t: T.earthArrive + 2.4, pos: new THREE.Vector3(0.35, 0.8, 5.6), look: earthCenter },
    { t: T.dive, pos: new THREE.Vector3(0.12, 0.3, 3.1), look: earthCenter },
  ];
  const curve = new THREE.CatmullRomCurve3(
    keys.map((k) => k.pos),
    false,
    "centripetal",
  );
  // arc-length position of each key on the curve
  const lengths = curve.getLengths(2000);
  const total = lengths[lengths.length - 1];
  const keyU = keys.map((_, i) => lengths[Math.round((i / (keys.length - 1)) * 2000)] / total);
  const uAt = monotone(
    keys.map((k) => k.t),
    keyU,
  );

  const look = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const surfacePoint = () => {
    earth.updateMatrixWorld();
    return latLonToVec(TARGET_LAT, TARGET_LON).applyMatrix4(earth.matrixWorld);
  };

  const placeCamera = (t: number) => {
    const last = keys[keys.length - 1];
    if (t <= last.t) {
      camera.position.copy(curve.getPointAt(THREE.MathUtils.clamp(uAt(t), 0, 1)));
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1].t) i++;
      const seg = (t - keys[i].t) / (keys[i + 1].t - keys[i].t);
      look.lerpVectors(keys[i].look, keys[i + 1].look, smooth(seg * 1.7));
    } else {
      // dive: ease in, and tilt from looking at the globe to looking down at the target
      const d = range(t, T.dive, T.end);
      const p = surfacePoint();
      const end = p.clone().multiplyScalar(1.16);
      camera.position.lerpVectors(last.pos, end, 1 - Math.pow(1 - d, 2.2));
      tmp.copy(p).multiplyScalar(0.985);
      look.lerpVectors(last.look, tmp, smooth(d * 1.4));
    }
    camera.lookAt(look);
  };

  const updateLabels = (t: number) => {
    const base = range(t, T.labelsIn, T.labelsIn + 1.8) * (1 - range(t, T.labelsOut - 1.8, T.labelsOut));
    const dive = range(t, T.dive + 0.6, T.dive + 1.8);
    worldLabels.opacity = base * 0.9;
    // Guyana stays a little longer than the rest, then only the falls marker remains
    guyanaLabel.opacity = range(t, T.labelsIn, T.labelsIn + 1.8) * (1 - range(t, T.dive + 0.8, T.dive + 2.2));
    fallsLabel.opacity = dive * (1 - range(t, T.whiteout - 2.2, T.whiteout - 1.2));
  };

  let raf = 0;
  let started = false;
  let finished = false;
  const clock = new THREE.Clock();
  // Debug / preview: ?introT=24 jumps the timeline to that second
  let t = Number(new URLSearchParams(location.search).get("introT") || 0);

  const draw = (t: number, now: number) => {
    earth.rotation.y = THREE.MathUtils.lerp(startRotY, finalRotY, range(t, T.earthArrive - 4, T.dive + 0.5));
    eu.cloudShift.value = now * 0.0012;
    eu.boost.value = range(t, T.whiteout - 3, T.end) * 2.5;
    saturn.visible = jupiter.visible = t < T.earthArrive;
    saturn.rotation.y = now * 0.05;
    jupiter.rotation.y = now * 0.07;
    mars.rotation.y = now * 0.05;
    moon.rotation.y = now * 0.02;
    bloom.strength = THREE.MathUtils.lerp(0.6, 0.8, range(t, 5, 8)) * (1 - range(t, 15, 19)) + 0.35 * range(t, 15, 19);

    placeCamera(t);
    sunUniforms.time.value = now;
    star.rotation.y = now * 0.02;
    corona.quaternion.copy(camera.quaternion);
    // where the star sits on screen, and how big it looks, for the heat shimmer
    {
      const sp = supernovaPos.clone().project(camera);
      const distToStar = camera.position.distanceTo(supernovaPos);
      const onScreen = sp.z < 1 && Math.abs(sp.x) < 1.6 && Math.abs(sp.y) < 1.6;
      heat.uniforms.center.value.set((sp.x + 1) / 2, (sp.y + 1) / 2);
      heat.uniforms.radius.value = STAR_R / (distToStar * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / 2;
      heat.uniforms.aspect.value = camera.aspect;
      heat.uniforms.time.value = now;
      heat.uniforms.strength.value = onScreen ? 1 : 0;
    }
    nebula.position.copy(camera.position);
    earth.updateMatrixWorld();
    updateLabels(t);
    composer.render();
    opts.onTick?.(t);
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    // advance by real frame time, but never jump more than 1/20 s on a hitch
    const dt = Math.min(clock.getDelta(), 0.05);
    if (started) t += dt;
    draw(t, clock.elapsedTime);

    if (started && t >= T.end && !finished) {
      finished = true;
      opts.onFinish();
    }
  };

  manager.onLoad = () => {
    // push every texture and shader to the GPU now, so nothing uploads mid-flight
    textures.forEach((tx) => renderer.initTexture(tx));
    renderer.compile(scene, camera);
    opts.onReady();
  };
  manager.onError = (u) => console.error("intro texture failed:", u);
  if (!opts.manual) frame();

  return {
    start: () => {
      started = true;
    },
    // in the baked film, slow drifts (planet spin, cloud motion) follow the timeline
    renderAt: (time: number) => draw(time, time + 5),
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      composer.dispose();
      renderer.dispose();
    },
  };
}
