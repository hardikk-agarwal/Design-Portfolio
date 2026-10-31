// Makes the smaller image copies the site serves through srcset, so phones and grids fetch roughly what they show.
// Needs sharp, which the site itself doesn't use: `npm install --no-save sharp`, then `node scripts/size-images.mjs`.
// Rerun it after adding or replacing an image in src/assets/work/ or a hero layer.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

sharp.cache(false)
const assets = fileURLToPath(new URL('../src/assets/', import.meta.url))

// Hero layers: widths keep the masters' exact 561:701 ratio, so the photo and its cutout stay registered.
const hero = { 'hardik-bench-scene': { quality: 82, effort: 6 }, 'hardik-bench-subject': { quality: 90, alphaQuality: 100, effort: 6 } }
for (const [name, options] of Object.entries(hero)) {
  const master = readFileSync(`${assets}${name}.webp`)
  for (const width of [1122, 1683]) {
    writeFileSync(`${assets}${name}-${width}.webp`, await sharp(master).resize(width, (width / 561) * 701, { kernel: 'lanczos3' }).webp(options).toBuffer())
  }
}

// Work screens: copies at a few widths below each master; srcSetOf in src/app/lib/images.ts pairs them with it.
const work = `${assets}work/`
const sized = `${work}sized/`
if (existsSync(sized)) rmSync(sized, { recursive: true })
mkdirSync(sized)
let count = 0
for (const file of readdirSync(work).filter((name) => name.endsWith('.webp'))) {
  const master = readFileSync(work + file)
  const { width } = await sharp(master).metadata()
  for (const target of [240, 480, 800, 1200].filter((size) => size < width * 0.9)) {
    writeFileSync(`${sized}${file.replace(/\.webp$/, '')}-${target}.webp`, await sharp(master).resize(target, null, { kernel: 'lanczos3' }).webp({ quality: 82, effort: 6 }).toBuffer())
    count++
  }
}
console.log(`Wrote 4 hero layer copies and ${count} work screen copies.`)
