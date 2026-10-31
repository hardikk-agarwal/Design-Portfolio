// Smaller copies of the work screens, made by scripts/size-images.mjs, so phones and grids fetch roughly what they show.
// Sealed (NDA) screens are blob URLs with no copies; they keep their single full-size file. The single-file export
// (mode production) inlines every image, so it leaves the copies out.
const masters = import.meta.glob<string>('../../assets/work/*.webp', { eager: true, import: 'default' })
// The smallest copies are under Vite's inline limit; inlined, they would land in the main script as text.
const copies: Record<string, string> = import.meta.env.MODE === 'production'
  ? {}
  : import.meta.glob<string>('../../assets/work/sized/*.webp', { eager: true, import: 'default', query: '?no-inline' })

const byName = new Map<string, string[]>()
for (const [path, url] of Object.entries(copies)) {
  const [, name, width] = /\/([^/]+)-(\d+)\.webp$/.exec(path)!
  byName.set(name, [...(byName.get(name) ?? []), `${url} ${width}w`])
}
const sets = new Map<string, string>()
for (const [path, url] of Object.entries(masters)) {
  const list = byName.get(/\/([^/]+)\.webp$/.exec(path)![1])
  if (list) sets.set(url, list.join(', '))
}

// srcset and sizes for an image of the work screens. With a srcset the image's own size becomes its sizes width, so an
// image sized by its content (w-auto, fitted with max-w/max-h) needs sizes at least as large as its box, and only images
// with a set width (w-full, size-full) can lead with `auto` (lazy images only).
export function responsive(image: { src: string; width: number }, sizes: string) {
  const set = sets.get(image.src)
  return set ? { srcSet: `${set}, ${image.src} ${image.width}w`, sizes } : {}
}
