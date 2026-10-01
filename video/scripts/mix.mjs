// Score, sound design and final mix: narration + generated music + effects.
// Music ducks under the voice; the master is normalized to -16 LUFS with a -1 dBFS ceiling.
import { mkdirSync, readFileSync } from 'node:fs'
import { readWav, writeWav } from './wav.mjs'
import { beats } from '../src/films/beats.js'

const id = process.argv[2] ?? 'store'
const tl = JSON.parse(readFileSync(`src/films/${id}/timeline.json`, 'utf8'))
const SR = 48000
const total = tl.durationInFrames / tl.fps
const N = Math.ceil(total * SR)
const at = Object.fromEntries(tl.scenes.map((s) => [s.id, s.from / tl.fps]))
const B = beats(tl, (await import(`../src/films/${id}/beats.js`)).default)
const mark = B['insight.mark'].sec
const decisions = tl.scenes.filter((s) => s.id.startsWith('decision')).map((s) => s.from / tl.fps)
const [first, second = first] = decisions
// Films without a customer quote let the takeaway close the drums and lift instead.
const quote = at.quote, drumsEnd = quote ?? at.takeaway
const ifQuote = (...points) => (quote === undefined ? [] : points)

let seed = 7
const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const noise = () => rand() * 2 - 1
const stereo = () => [new Float32Array(N), new Float32Array(N)]
const pan = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)]
const add = (bus, i, l, r) => { if (i >= 0 && i < N) { bus[0][i] += l; bus[1][i] += r } }
const send = (bus, i, v) => { if (i >= 0 && i < N) bus[i] += v }
const env = (pts) => (t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + (v1 - v0) * ((t - t0) / (t1 - t0 || 1)) } return pts.at(-1)[1] }

function coeffs(type, f, q = 0.7071) {
  const w = 2 * Math.PI * Math.min(f, SR * 0.45) / SR, c = Math.cos(w), a = Math.sin(w) / (2 * q)
  const [b0, b1, b2] = type === 'lp' ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : type === 'hp' ? [(1 + c) / 2, -(1 + c), (1 + c) / 2] : [a, 0, -a]
  const a0 = 1 + a
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: -2 * c / a0, a2: (1 - a) / a0 }
}
const filter = (type, f, q) => ({ ...coeffs(type, f, q), x1: 0, x2: 0, y1: 0, y2: 0 })
const retune = (s, type, f, q) => Object.assign(s, coeffs(type, f, q))
const run = (s, x) => { const y = s.b0 * x + s.b1 * s.x1 + s.b2 * s.x2 - s.a1 * s.y1 - s.a2 * s.y2; s.x2 = s.x1; s.x1 = x; s.y2 = s.y1; s.y1 = y; return y }

// BS.1770 integrated loudness of 48 kHz channels.
function lufs(chs, from = 0, to = chs[0].length) {
  const k1 = { b0: 1.53512485958697, b1: -2.69169618940638, b2: 1.19839281085285, a1: -1.69065929318241, a2: 0.73248077421585 }
  const k2 = { b0: 1, b1: -2, b2: 1, a1: -1.99004745483398, a2: 0.99007225036621 }
  const n = to - from, block = Math.round(0.4 * SR), hop = Math.round(0.1 * SR)
  if (n < block) return -Infinity
  const sums = chs.map((x) => { const s1 = { ...k1, x1: 0, x2: 0, y1: 0, y2: 0 }, s2 = { ...k2, x1: 0, x2: 0, y1: 0, y2: 0 }, p = new Float64Array(n + 1); for (let i = 0; i < n; i++) { const y = run(s2, run(s1, x[from + i])); p[i + 1] = p[i] + y * y } return p })
  const z = []
  for (let s = 0; s + block <= n; s += hop) z.push(sums.reduce((acc, p) => acc + (p[s + block] - p[s]) / block, 0))
  const L = (v) => -0.691 + 10 * Math.log10(v)
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length
  const abs = z.filter((v) => L(v) > -70)
  if (!abs.length) return -Infinity
  const rel = L(mean(abs)) - 10
  return L(mean(abs.filter((v) => L(v) > rel)))
}
const gainTo = (current, target) => 10 ** ((target - current) / 20)

function freeverb(input, room = 0.82, damp = 0.3) {
  const scale = SR / 44100, mk = (len) => ({ buf: new Float32Array(Math.round(len * scale)), i: 0, store: 0 })
  const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], apT = [556, 441, 341, 225]
  const combs = [combT.map(mk), combT.map((t) => mk(t + 23))], aps = [apT.map(mk), apT.map((t) => mk(t + 23))]
  const fb = room * 0.28 + 0.7, d = damp * 0.4, out = stereo()
  for (let n = 0; n < N; n++) {
    const x = input[n] * 0.015
    for (let ch = 0; ch < 2; ch++) {
      let s = 0
      for (const c of combs[ch]) { const y = c.buf[c.i]; c.store = y * (1 - d) + c.store * d; c.buf[c.i] = x + c.store * fb; if (++c.i === c.buf.length) c.i = 0; s += y }
      for (const a of aps[ch]) { const b = a.buf[a.i], y = b - s; a.buf[a.i] = s + b * 0.5; if (++a.i === a.buf.length) a.i = 0; s = y }
      out[ch][n] = s * 3
    }
  }
  return out
}

// ---- Score: D major, 92 bpm. Dmaj9, Bm9, Gmaj9, Asus2, two bars each.
const beat = 60 / 92, bar = beat * 4, chordLen = bar * 2
const mtof = (m) => 440 * 2 ** ((m - 69) / 12)
const chords = [[57, 61, 64, 66], [57, 61, 62, 66], [57, 59, 62, 66], [57, 59, 64, 66]]
const roots = [38, 35, 43, 45]
const chordAt = (t) => Math.floor(t / chordLen) % 4

const padLevel = env([[0, 0], [1.6, 0.5], [at.title, 0.72], [at.problem + 0.6, 0.55], [at.insight, 0.5], [at.insight + 0.4, 0.14], [mark - 0.1, 0.14], [mark + 0.3, 0.8], [at.result, 0.9], ...ifQuote([quote + 0.6, 1]), [at.takeaway, 0.75], [at.end + 1.4, 0.72], [total, 0]])
const padCut = env([[0, 650], [at.title, 1100], [at.problem, 850], [at.insight, 650], [mark, 1300], [first, 1500], [decisions.at(-1), 1800], [at.result, 2400], ...ifQuote([quote, 2000]), [at.takeaway, 1500], [total, 900]])
const bassLevel = env([[0, 0], [at.title, 0], [at.title + 0.4, 0.75], [at.insight, 0.75], [at.insight + 0.3, 0], [mark, 0], [mark + 0.3, 0.85], ...ifQuote([quote, 0.7]), [at.takeaway, 0.55], [total - 1, 0.3], [total, 0]])
const kickLevel = env([[0, 0], [at.problem, 0], [at.problem + 0.1, 0.32], [at.insight - 0.2, 0.32], [at.insight, 0], [first, 0], [first + 0.1, 0.55], [at.result, 0.7], [drumsEnd - 0.3, 0.7], [drumsEnd, 0]])
const hatLevel = env([[0, 0], [first, 0], [first + bar, 0.3], [at.result, 0.42], [drumsEnd - 0.3, 0.42], [drumsEnd, 0]])
const arpLevel = env([[0, 0], [second, 0], [second + 0.5, 0.45], [at.result, 0.6], ...ifQuote([quote, 0.5]), [at.takeaway + 1, 0.3], [at.end, 0.2], [total - 1.5, 0]])

const music = stereo(), musicSend = new Float32Array(N)

function saw(freq) {
  let p = rand(); const dt = freq / SR
  return () => {
    p += dt; if (p >= 1) p -= 1
    let v = 2 * p - 1
    if (p < dt) { const x = p / dt; v -= 2 * x - x * x - 1 } else if (p > 1 - dt) { const x = (p - 1) / dt; v -= x * x + 2 * x + 1 }
    return v
  }
}

{ // pads: three detuned saws per note through a moving low-pass
  const pad = stereo()
  for (let c = 0; c * chordLen < total; c++) {
    const t0 = c * chordLen
    for (const [k, m] of chords[c % 4].entries()) {
      const [gl, gr] = pan(-0.45 + 0.3 * k), osc = [-7, 0, 7].map((cents) => saw(mtof(m) * 2 ** (cents / 1200)))
      const i0 = Math.max(0, Math.floor((t0 - 0.25) * SR)), i1 = Math.min(N, Math.floor((t0 + chordLen + 1.8) * SR))
      for (let i = i0; i < i1; i++) {
        const t = i / SR, rel = t - (t0 + chordLen), a = Math.min(1, (t - t0 + 0.25) / 1.4) * (rel > 0 ? 1 - rel / 1.8 : 1)
        const v = (osc[0]() + osc[1]() + osc[2]()) * a * 0.05
        pad[0][i] += v * gl; pad[1][i] += v * gr
      }
    }
  }
  const lp = [filter('lp', 800, 0.6), filter('lp', 800, 0.6)]
  for (let i = 0; i < N; i++) {
    const t = i / SR
    if (i % 32 === 0) { const f = padCut(t) * (1 + 0.12 * Math.sin(2 * Math.PI * t / 9)); retune(lp[0], 'lp', f, 0.6); retune(lp[1], 'lp', f, 0.6) }
    const g = padLevel(t), l = run(lp[0], pad[0][i]) * g, r = run(lp[1], pad[1][i]) * g
    music[0][i] += l; music[1][i] += r; musicSend[i] += (l + r) * 0.35
  }
}

for (let c = 0; c * chordLen < total; c++) { // sub bass
  const t0 = c * chordLen, f = mtof(roots[c % 4]), i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor((t0 + chordLen + 0.3) * SR))
  for (let i = i0; i < i1; i++) {
    const tau = i / SR - t0, a = Math.min(1, tau / 0.08) * (tau > chordLen ? 1 - (tau - chordLen) / 0.3 : 1), ph = 2 * Math.PI * f * tau
    const v = (Math.sin(ph) + 0.22 * Math.sin(2 * ph)) * a * 0.2 * bassLevel(i / SR)
    music[0][i] += v; music[1][i] += v
  }
}

for (let k = 0; k * beat < total; k++) { // kick: one per bar in the problem, two per bar later
  const t = k * beat, lv = kickLevel(t)
  if (lv < 0.02 || (t < at.insight ? k % 4 : k % 2)) continue
  let ph = 0
  for (let j = 0, i0 = Math.round(t * SR); j < 0.45 * SR; j++) {
    const tau = j / SR, f = 44 + 80 * Math.exp(-tau / 0.035)
    ph += 2 * Math.PI * f / SR
    const v = (Math.sin(ph) * Math.exp(-tau / 0.22) + (tau < 0.003 ? noise() * 0.15 * (1 - tau / 0.003) : 0)) * 0.5 * lv
    add(music, i0 + j, v, v)
  }
}

for (let k = 0; (k + 0.5) * beat < total; k++) { // off-beat hats
  const t = (k + 0.5) * beat, lv = hatLevel(t)
  if (lv < 0.02) continue
  const hp = filter('hp', 7500, 0.7), [gl, gr] = pan(0.2)
  for (let j = 0, i0 = Math.round(t * SR); j < 0.08 * SR; j++) { const v = run(hp, noise()) * Math.exp(-j / SR / 0.028) * 0.12 * lv * (k % 2 ? 0.8 : 1); add(music, i0 + j, v * gl, v * gr) }
}

{ // eighth-note plucks over the chord, with a ping-pong delay
  const arp = stereo(), eighth = beat / 2, order = [0, 1, 2, 3, 2, 1, 3, 2]
  for (let k = 0; k * eighth < total; k++) {
    const t = k * eighth, lv = arpLevel(t)
    if (lv < 0.02) continue
    const f = mtof(chords[chordAt(t)][order[k % 8]] + 12), vel = 0.75 + 0.25 * rand(), [gl, gr] = pan(k % 2 ? 0.35 : -0.35)
    for (let j = 0, i0 = Math.round(t * SR); j < 1.4 * SR; j++) {
      const tau = j / SR, ph = 2 * Math.PI * f * tau
      const v = (Math.sin(ph) + 0.25 * Math.sin(2 * ph) * Math.exp(-tau / 0.1)) * Math.exp(-tau / 0.32) * Math.min(1, tau / 0.004) * 0.07 * lv * vel
      add(arp, i0 + j, v * gl, v * gr)
    }
  }
  const d = Math.round(beat * 0.75 * SR), bl = new Float32Array(d), br = new Float32Array(d)
  for (let i = 0; i < N; i++) {
    const j = i % d, l = arp[0][i] + br[j] * 0.32, r = arp[1][i] + bl[j] * 0.32
    const wl = bl[j], wr = br[j]
    bl[j] = l; br[j] = r
    const ol = arp[0][i] + wl * 0.28, or = arp[1][i] + wr * 0.28
    music[0][i] += ol; music[1][i] += or; musicSend[i] += (ol + or) * 0.4
  }
}

// ---- Sound design
const sfx = stereo(), sfxSend = new Float32Array(N)
const sounds = {
  whoosh(t, gain = 0.26, dur = 0.9) {
    const bp = filter('bp', 400, 0.9), i0 = Math.round((t - dur / 2) * SR)
    for (let j = 0; j < dur * SR; j++) {
      const u = j / (dur * SR)
      if (j % 32 === 0) retune(bp, 'bp', 400 * 9 ** u, 0.9)
      const v = run(bp, noise()) * Math.sin(Math.PI * u) ** 2 * gain, [gl, gr] = pan(-0.6 + 1.2 * u)
      add(sfx, i0 + j, v * gl, v * gr); send(sfxSend, i0 + j, v * 0.3)
    }
  },
  impact(t, gain = 0.5) {
    const lp = filter('lp', 900, 0.7), i0 = Math.round(t * SR)
    let ph = 0
    for (let j = 0; j < 1.8 * SR; j++) {
      const tau = j / SR, f = 36 + 22 * Math.exp(-tau / 0.25)
      ph += 2 * Math.PI * f / SR
      const v = (Math.sin(ph) * Math.exp(-tau / 0.5) + run(lp, noise()) * Math.exp(-tau / 0.12) * 0.6) * gain * Math.min(1, tau / 0.002)
      add(sfx, i0 + j, v, v); send(sfxSend, i0 + j, v * 0.4)
    }
  },
  riser(tEnd, gain = 0.2, dur = 1.8) {
    const bp = filter('bp', 300, 1.2), i0 = Math.round((tEnd - dur) * SR)
    let ph = 0
    for (let j = 0; j < dur * SR; j++) {
      const u = j / (dur * SR)
      if (j % 32 === 0) retune(bp, 'bp', 300 * (5000 / 300) ** u, 1.2)
      ph += 2 * Math.PI * (180 * 4 ** u) / SR
      const fade = u > 0.99 ? (1 - u) / 0.01 : 1, v = (run(bp, noise()) * 1.2 + Math.sin(ph) * 0.12) * u * u * gain * fade
      add(sfx, i0 + j, v, v); send(sfxSend, i0 + j, v * 0.3)
    }
  },
  pop(t, gain = 0.11) {
    const hp = filter('hp', 2500, 0.7), i0 = Math.round(t * SR), [gl, gr] = pan((rand() - 0.5) * 0.3)
    let ph = 0
    for (let j = 0; j < 0.12 * SR; j++) {
      const tau = j / SR
      ph += 2 * Math.PI * (620 + 380 * Math.exp(-tau / 0.02)) / SR
      const v = (Math.sin(ph) * Math.exp(-tau / 0.035) * Math.min(1, tau / 0.001) + (tau < 0.004 ? run(hp, noise()) * 0.3 : 0)) * gain
      add(sfx, i0 + j, v * gl, v * gr); send(sfxSend, i0 + j, v * 0.15)
    }
  },
  tick(t, gain = 0.08) {
    const i0 = Math.round(t * SR)
    for (let j = 0; j < 0.08 * SR; j++) { const tau = j / SR, v = Math.sin(2 * Math.PI * 1700 * tau) * Math.exp(-tau / 0.012) * gain; add(sfx, i0 + j, v, v) }
  },
  click(t, gain = 0.14) {
    for (const [offset, g] of [[0, 1], [0.07, 0.55]]) {
      const hp = filter('hp', 3000, 0.7), i0 = Math.round((t + offset) * SR)
      for (let j = 0; j < 0.05 * SR; j++) { const tau = j / SR, v = ((tau < 0.003 ? run(hp, noise()) : 0) + Math.sin(2 * Math.PI * 2400 * tau) * Math.exp(-tau / 0.008)) * gain * g; add(sfx, i0 + j, v, v) }
    }
  },
  shimmer(t, gain = 0.045, dur = 1.4) {
    const i0 = Math.round(t * SR), fs = [2637, 3520, 4186], ph = fs.map(() => rand() * 6.28)
    for (let j = 0; j < dur * SR; j++) {
      const tau = j / SR, u = tau / dur, trem = 0.7 + 0.3 * Math.sin(2 * Math.PI * 9 * tau)
      const v = fs.reduce((s, f, k) => s + Math.sin(2 * Math.PI * f * tau + ph[k]), 0) / 3 * Math.sin(Math.PI * u) * trem * gain
      add(sfx, i0 + j, v, v); send(sfxSend, i0 + j, v * 0.6)
    }
  },
  chime(t, gain = 0.14) {
    const i0 = Math.round(t * SR), fc = 1318.5
    for (let j = 0; j < 3.5 * SR; j++) {
      const tau = j / SR, index = 3 * Math.exp(-tau / 0.6)
      const v = (Math.sin(2 * Math.PI * fc * tau + index * Math.sin(2 * Math.PI * fc * 1.4 * tau)) + 0.4 * Math.sin(Math.PI * fc * tau)) * Math.exp(-tau / 1.8) * Math.min(1, tau / 0.002) * gain
      add(sfx, i0 + j, v, v); send(sfxSend, i0 + j, v * 0.5)
    }
  },
}
sounds.whoosh(at.title + 0.15)
sounds.impact(at.title + 0.35, 0.35)
for (const t of decisions) sounds.whoosh(t + 0.35, 0.2)
sounds.riser(at.result)
sounds.impact(at.result, 0.42)
sounds.chime(at.end + 0.6)
for (const b of Object.values(B)) if (b.sound) sounds[b.sound](b.sec)

// ---- Narration: 24 kHz lines upsampled 2x, high-passed and levelled to -19 LUFS each.
const voice = new Float32Array(N), duck = new Float32Array(N).fill(1)
function upsample2(x) {
  const taps = 16, y = new Float32Array(x.length * 2)
  for (let n = 0; n < x.length; n++) {
    y[2 * n] = x[n]
    let s = 0
    for (let m = n - taps + 1; m <= n + taps; m++) { if (m < 0 || m >= x.length) continue; const d = n + 0.5 - m; s += x[m] * Math.sin(Math.PI * d) / (Math.PI * d) * 0.5 * (1 + Math.cos(Math.PI * d / taps)) }
    y[2 * n + 1] = s
  }
  return y
}
for (const scene of tl.scenes) for (const line of scene.lines) {
  const { channels, rate } = readWav(`out/${id}/vo/${line.file}`)
  if (rate !== 24000) throw new Error(`${line.file}: expected 24 kHz`)
  const hp = filter('hp', 75, 0.7), y = upsample2(channels[0]).map((v) => run(hp, v)), g = gainTo(lufs([y]), -19), i0 = Math.round(line.start * SR)
  for (let j = 0; j < y.length; j++) if (i0 + j < N) voice[i0 + j] += y[j] * g
  duck.fill(0.3, Math.max(0, Math.round((line.start - 0.15) * SR)), Math.min(N, Math.round((line.start + line.seconds + 0.2) * SR)))
}
{ // smooth the duck: 120 ms down, 500 ms back up
  const down = 1 - Math.exp(-1 / (0.12 * SR)), up = 1 - Math.exp(-1 / (0.5 * SR))
  let g = 1
  for (let i = 0; i < N; i++) { g += (duck[i] - g) * (duck[i] < g ? down : up); duck[i] = g }
}

// ---- Mix
const musicVerb = freeverb(musicSend, 0.84, 0.3), sfxVerb = freeverb(sfxSend, 0.78, 0.35)
for (let i = 0; i < N; i++) for (let ch = 0; ch < 2; ch++) music[ch][i] += musicVerb[ch][i] * 0.35
const musicGain = gainTo(lufs(music), -24)
// Lift the music where nothing is spoken (title, customer quote, end card).
const lift = env([[at.title - 0.3, 1], [at.title + 0.3, 1.35], [at.problem, 1.35], [at.problem + 0.6, 1], ...ifQuote([quote - 0.3, 1], [quote + 0.5, 1.7], [at.takeaway, 1.7], [at.takeaway + 0.6, 1]), [at.end, 1], [at.end + 0.5, 1.35], [total, 1.35]])
const master = stereo()
for (let i = 0; i < N; i++) { const m = musicGain * duck[i] * lift(i / SR); for (let ch = 0; ch < 2; ch++) master[ch][i] = voice[i] + music[ch][i] * m + sfx[ch][i] + sfxVerb[ch][i] * 0.3 }
const masterGain = gainTo(lufs(master), -16)
for (const ch of master) for (let i = 0; i < N; i++) ch[i] *= masterGain

{ // look-ahead peak limiter at -1 dBFS
  const ceil = 10 ** (-1 / 20), look = Math.round(0.003 * SR), rel = 1 - Math.exp(-1 / (0.08 * SR)), need = new Float32Array(N)
  for (let i = 0; i < N; i++) need[i] = Math.min(1, ceil / Math.max(1e-9, Math.abs(master[0][i]), Math.abs(master[1][i])))
  let g = 1
  for (let i = 0; i < N; i++) {
    let m = 1
    for (let j = i; j < Math.min(N, i + look); j++) if (need[j] < m) m = need[j]
    g = m < g ? m : g + (m - g) * rel
    master[0][i] *= g; master[1][i] *= g
  }
}

mkdirSync('public', { recursive: true })
writeWav(`public/${id}-mix.wav`, master, SR)
const peak = Math.max(...master.map((ch) => ch.reduce((m, v) => Math.max(m, Math.abs(v)), 0)))
const speech = tl.scenes.flatMap((s) => s.lines).map((l) => [Math.round(l.start * SR), Math.round((l.start + l.seconds) * SR)])
const during = (bus, gain) => { const parts = [[], []]; for (const [a, b] of speech) for (let i = a; i < b; i++) for (let ch = 0; ch < 2; ch++) parts[ch].push(bus[ch][i] * gain * duck[i] * masterGain); return lufs(parts.map((p) => Float32Array.from(p))) }
console.log(JSON.stringify({
  seconds: +total.toFixed(2),
  masterLufs: +lufs(master).toFixed(1),
  peakDb: +(20 * Math.log10(peak)).toFixed(1),
  voiceLufs: +lufs([voice, voice].map((v) => v.map((x) => x * masterGain))).toFixed(1),
  musicUnderVoiceLufs: +during(music, musicGain).toFixed(1),
  scenes: Object.fromEntries(tl.scenes.map((s) => [s.id, +lufs(master, Math.round(s.from / tl.fps * SR), Math.min(N, Math.round((s.from + s.duration) / tl.fps * SR))).toFixed(1)])),
}))
