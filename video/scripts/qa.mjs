// Layout check without looking at frames: renders small stills with { qa: true } and prints what the probe in
// lib/film.tsx reports (clipped, off-frame or colliding text). Usage: node scripts/qa.mjs <id> [frame ...]
import { bundle } from '@remotion/bundler'
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const [id = 'store', ...args] = process.argv.slice(2)
const timeline = JSON.parse(readFileSync(`src/films/${id}/timeline.json`, 'utf8'))
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
const inputProps = { qa: true }
const browser = await openBrowser('chrome')
const composition = await selectComposition({ serveUrl, id, inputProps, puppeteerInstance: browser })
// Settled points in every scene: after the entrances, late in the scene, and just before the exit fade.
const frames = args.length ? args.map(Number) : timeline.scenes.flatMap((s) => [0.5, 0.8, 0.95].map((k) => s.from + Math.round(s.duration * k)))
let count = 0
// Full scale: a smaller `scale` lays the page out in a smaller viewport, which would distort the measurements.
for (const frame of frames) {
  const reports = []
  await renderStill({ serveUrl, composition, frame, inputProps, puppeteerInstance: browser, output: path.join(tmpdir(), 'film-qa.jpeg'), imageFormat: 'jpeg', jpegQuality: 50, onBrowserLog: ({ text }) => { if (text.startsWith('QA ')) reports.push(JSON.parse(text.slice(3))) } })
  const scene = timeline.scenes.find((s) => frame >= s.from && frame < s.from + s.duration)?.id
  const issues = reports.flatMap((r) => r.issues)
  if (!reports.length) console.log(`${frame} (${scene}): probe did not report`)
  if (issues.length) console.log(`${frame} (${scene}): ${issues.join(' | ')}`)
  count += issues.length
}
await browser.close({ silent: true })
console.log(`${frames.length} frames checked, ${count} issues`)
