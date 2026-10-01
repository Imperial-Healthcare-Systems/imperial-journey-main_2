/**
 * Draws only the lion himself from the film (bright fur; the dark backdrop is keyed out), so he
 * can walk out of the section: inside it he is shown in full, above its top edge only his
 * golden mane rises out, fading with distance.
 */

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform sampler2D uVid;
uniform vec2 uRes;      // canvas size, device px
uniform vec4 uPortal;   // the screen: x, y, w, h (device px, top-left origin)
uniform vec4 uVidRect;  // where the film is drawn
uniform float uFade;    // dip to dark at the loop point
uniform float uDpr;
uniform vec2 uBand;     // the section's top / bottom (device px)
uniform float uOut;     // how far out of the section he has come (0..1)
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = (p - uVidRect.xy) / uVidRect.zw;
  vec4 c = vec4(0.0);
  float lum = 0.0;
  if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
    c = texture2D(uVid, uv);
    lum = dot(c.rgb, vec3(0.3, 0.59, 0.11));
  }
  // signed distance to the screen's edge (negative inside)
  vec2 q = abs(p - (uPortal.xy + uPortal.zw * 0.5)) - uPortal.zw * 0.5;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);

  // ---- the lion alone (fur only, backdrop keyed out) ----
  vec2 e = min(uv, 1.0 - uv);
  float soft = smoothstep(0.0, 0.22, e.x) * smoothstep(0.0, 0.08, e.y);
  float key = smoothstep(0.035, 0.12, lum); // keep his dark fur solid
  float inBand = step(uBand.x, p.y) * step(p.y, uBand.y);
  // above the section only his golden mane rises out (grey smoke has no colour); below, nothing
  float above = step(p.y, uBand.x);
  float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  float keyOut = smoothstep(0.13, 0.28, lum) * smoothstep(0.08, 0.2, sat) * above;
  float past = max(uBand.x - p.y, p.y - uBand.y);
  float reach = 1.0 - smoothstep(220.0 * uDpr, 400.0 * uDpr, past);
  float bottomFade = 1.0 - smoothstep(-60.0 * uDpr, 0.0, p.y - uBand.y);
  float lionA = mix(keyOut * reach, key * bottomFade, inBand) * soft * uFade;

  float a = lionA * mix(1.0, uOut, 1.0 - inBand);
  gl_FragColor = vec4(c.rgb * a, a);
}`;

export function createLionPortal(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uPortal = U("uPortal"), uVidRect = U("uVidRect"), uFade = U("uFade"), uDpr = U("uDpr");
  const uBand = U("uBand"), uOut = U("uOut");
  gl.uniform1i(U("uVid"), 0);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let hasFrame = false;

  return {
    /** film rectangle in CSS px relative to the canvas */
    draw(
      portal: [number, number, number, number],
      film: [number, number, number, number],
      fade: number,
      band: [number, number] = [0, 1e6],
      out = 1,
    ) {
      const W = Math.round(canvas.clientWidth * dpr), H = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      gl.viewport(0, 0, W, H);
      if (video.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        hasFrame = true;
      }
      gl.uniform2f(uRes, W, H);
      gl.uniform4f(uPortal, ...(portal.map((v) => v * dpr) as [number, number, number, number]));
      gl.uniform4f(uVidRect, ...(film.map((v) => v * dpr) as [number, number, number, number]));
      gl.uniform1f(uFade, hasFrame ? fade : 0);
      gl.uniform1f(uDpr, dpr);
      gl.uniform2f(uBand, band[0] * dpr, band[1] * dpr);
      gl.uniform1f(uOut, out);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
