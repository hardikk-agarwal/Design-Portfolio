// Narration: Kokoro TTS per line, checked by transcribing it back with Whisper.
// Writes out/<id>/vo/*.wav, out/<id>/<id>.vtt and src/films/<id>/timeline.json.
import { KokoroTTS } from 'kokoro-js'
import { pipeline } from '@huggingface/transformers'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { readWav, writeWav } from './wav.mjs'

const id = process.argv[2] ?? 'store'
const spec = JSON.parse(readFileSync(`src/films/${id}/script.json`, 'utf8'))
const { fps } = spec
mkdirSync(`out/${id}/vo`, { recursive: true })

// Lines whose text, voice and speed are unchanged are reused from the last run.
const manifestPath = `out/${id}/vo/manifest.json`
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}
let models
const load = async () => (models ??= {
  tts: await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' }),
  asr: await pipeline('automatic-speech-recognition', 'Xenova/whisper-base.en'),
})

const small = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const say = (n) => n < 20 ? small[n] : n < 100 ? `${tens[Math.floor(n / 10)]} ${n % 10 ? small[n % 10] : ''}` : n >= 1000 ? `${say(Math.floor(n / 100))} ${say(n % 100)}` : `${small[Math.floor(n / 100)]} hundred ${n % 100 ? say(n % 100) : ''}`
const words = (s) => s.toLowerCase().replace(/\$(\d+)/g, '$1 dollar').replace(/%/g, ' percent').replace(/\d+/g, (d) => say(Number(d)))
  .replace(/dollars/g, 'dollar').replace(/[^a-z\s'-]/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean)
const wer = (ref, hyp) => {
  const d = Array.from({ length: ref.length + 1 }, (_, i) => [i, ...Array(hyp.length).fill(0)])
  for (let j = 1; j <= hyp.length; j++) d[0][j] = j
  for (let i = 1; i <= ref.length; i++) for (let j = 1; j <= hyp.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (ref[i - 1] === hyp[j - 1] ? 0 : 1))
  return d[ref.length][hyp.length] / ref.length
}
const to16k = (x, rate) => { const r = rate / 16000, y = new Float32Array(Math.floor(x.length / r)); for (let i = 0; i < y.length; i++) { const t = i * r, k = Math.floor(t), f = t - k; y[i] = x[k] * (1 - f) + (x[k + 1] ?? 0) * f } return y }

// Trim silence to 40 ms either side, with 8 ms fades so cuts never click.
function trim(x, rate) {
  let a = 0, b = x.length - 1
  while (a < b && Math.abs(x[a]) < 0.01) a++
  while (b > a && Math.abs(x[b]) < 0.01) b--
  const pad = Math.round(rate * 0.04), y = x.slice(Math.max(0, a - pad), Math.min(x.length, b + pad)), f = Math.round(rate * 0.008)
  for (let i = 0; i < f; i++) { y[i] *= i / f; y[y.length - 1 - i] *= i / f }
  return y
}

const scenes = [], cues = []
let cursor = 0, worst = 0
for (const scene of spec.scenes) {
  const lines = []
  let t = scene.lead ?? 0
  for (const [i, text] of scene.lines.entries()) {
    const file = `${scene.id}-${i}.wav`, path = `out/${id}/vo/${file}`, key = `${spec.voice}|${spec.speed}|${text}`
    let seconds
    if (manifest[file] === key && existsSync(path)) {
      const { channels, rate } = readWav(path)
      seconds = channels[0].length / rate
    } else {
      const { tts, asr } = await load()
      const audio = await tts.generate(text, { voice: spec.voice, speed: spec.speed })
      const x = trim(audio.audio, audio.sampling_rate)
      seconds = x.length / audio.sampling_rate
      writeWav(path, [x], audio.sampling_rate)
      const { text: heard } = await asr(to16k(x, audio.sampling_rate))
      const score = wer(words(text), words(heard))
      worst = Math.max(worst, score)
      console.log(`${score > 0.1 ? 'CHECK' : 'ok   '} ${scene.id}-${i} ${seconds.toFixed(2)}s wer=${score.toFixed(2)} | ${heard.trim()}`)
      manifest[file] = key
    }
    lines.push({ text, file, at: t, seconds })
    t += seconds + (i < scene.lines.length - 1 ? spec.gap : 0)
  }
  const duration = Math.round(Math.max(scene.min ?? 0, t + (scene.tail ?? 0)) * fps)
  scenes.push({
    id: scene.id, from: cursor, duration,
    lines: lines.map((l) => ({ text: l.text, file: l.file, start: cursor / fps + l.at, seconds: l.seconds, from: cursor + Math.round(l.at * fps), duration: Math.round(l.seconds * fps) })),
  })
  for (const l of scenes.at(-1).lines) cues.push(...split((spec.captions ?? []).reduce((s, [said, shown]) => s.replace(said, shown), l.text), l.start, l.seconds))
  cursor += duration
}

// Captions: one cue per line, split near a comma when longer than two short lines.
function split(text, start, seconds) {
  if (text.length <= 64) return [{ text, start, end: start + seconds }]
  const commas = [...text.matchAll(/, /g)].map((m) => m.index + 1)
  const cut = commas.sort((a, b) => Math.abs(a - text.length / 2) - Math.abs(b - text.length / 2))[0]
  if (!cut) return [{ text, start, end: start + seconds }]
  const mid = start + seconds * (cut / text.length)
  return [...split(text.slice(0, cut).trim(), start, mid - start), ...split(text.slice(cut).trim(), mid, start + seconds - mid)]
}
const stamp = (s) => new Date(Math.round(s * 1000)).toISOString().slice(11, 23)
const vtt = `WEBVTT\n\n${cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n')}`
writeFileSync(`out/${id}/${id}.vtt`, vtt)
writeFileSync(`src/films/${id}/timeline.json`, `${JSON.stringify({ fps, durationInFrames: cursor, scenes }, null, 2)}\n`)
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log(`${scenes.length} scenes, ${(cursor / fps).toFixed(1)}s, worst wer ${worst.toFixed(2)}`)
