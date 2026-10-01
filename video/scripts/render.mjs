// Bundle once, then render review stills or the final film (+ poster and captions).
// Public films go to ../public/films; NDA films (script.json "protected": true) go to the git-ignored
// ../src/protected/<id>/film, where `npm run seal` encrypts them.
// Usage: node scripts/render.mjs <id> [film | stills <frame|auto> ...]
import { bundle } from '@remotion/bundler'
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const [id = 'store', mode = 'film', ...args] = process.argv.slice(2)
const timeline = JSON.parse(readFileSync(`src/films/${id}/timeline.json`, 'utf8'))
const { protected: nda } = JSON.parse(readFileSync(`src/films/${id}/script.json`, 'utf8'))
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
const composition = await selectComposition({ serveUrl, id })
const still = (frame, output, scale = 1) => renderStill({ serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 90, scale })

if (mode === 'stills') {
  mkdirSync(`out/${id}/stills`, { recursive: true })
  const frames = args[0] === 'auto' || !args.length ? timeline.scenes.map((s) => s.from + Math.round(s.duration * 0.8)) : args.map(Number)
  for (const frame of frames) await still(frame, `out/${id}/stills/${String(frame).padStart(5, '0')}.jpeg`, 0.5)
  console.log(`stills: ${frames.join(', ')}`)
} else {
  let last = -1
  await renderMedia({
    serveUrl, composition, codec: 'h264', crf: 22, x264Preset: 'slow', audioBitrate: '192k', pixelFormat: 'yuv420p', imageFormat: 'jpeg', jpegQuality: 92,
    outputLocation: `out/${id}/${id}.mp4`,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`render ${p * 10}%`) } },
  })
  const title = timeline.scenes.find((s) => s.id === 'title')
  await still(title.from + title.duration - 20, `out/${id}/${id}-poster.jpg`)
  const seconds = Math.round(timeline.durationInFrames / timeline.fps), duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  if (nda) {
    const dir = `../src/protected/${id}/film`
    mkdirSync(dir, { recursive: true })
    copyFileSync(`out/${id}/${id}.mp4`, `${dir}/film.mp4`)
    copyFileSync(`out/${id}/${id}-poster.jpg`, `${dir}/poster.jpg`)
    copyFileSync(`out/${id}/${id}.vtt`, `${dir}/captions.vtt`)
    writeFileSync(`${dir}/film.json`, JSON.stringify({ duration }))
    console.log(`copied the ${duration} film to src/protected/${id}/film; run npm run seal to publish it encrypted`)
  } else {
    mkdirSync('../public/films', { recursive: true })
    for (const file of [`${id}.mp4`, `${id}-poster.jpg`, `${id}.vtt`]) copyFileSync(`out/${id}/${file}`, `../public/films/${file}`)
    console.log(`copied ${id}.mp4 (${duration}), poster and captions to public/films`)
  }
}
