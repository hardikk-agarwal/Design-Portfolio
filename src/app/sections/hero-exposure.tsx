import type { ReactNode } from 'react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import wallMask from '../../assets/hardik-bench-wall.png'

export type CoverContext = {
  q: (selector: string) => HTMLElement[]
  stage: HTMLElement
  subject: HTMLImageElement
  // The photograph's resting scale (1.1 at the top of the cinematic sequence).
  rest: number
  motion: boolean
  // The name, the copy, then the notes.
  story: () => gsap.core.Timeline
  // Marks the intro as played for this page load. Called on its first tick, so React's development double-mount
  // doesn't use it up.
  played: () => void
  // Any input fast-forwards this timeline.
  skippable: (timeline: gsap.core.Timeline) => void
  onCleanup: (cleanup: () => void) => void
}

const styles = [
  { color: '255 255 255', alpha: 0.95, width: 1.6, share: 0.1 },
  { color: '255 255 255', alpha: 0.6, width: 1.15, share: 0.32 },
  { color: '255 255 255', alpha: 0.32, width: 0.85, share: 0.36 },
  { color: '204 222 255', alpha: 0.8, width: 1.3, share: 0.11 },
  { color: '255 220 182', alpha: 0.75, width: 1.25, share: 0.11 },
]
// Arc of a full trail, and how fast the field keeps turning at rest (radians, radians per second).
const sweep = 0.3
const turn = 0.0045

// Without GPU rendering every frame that redraws the trails or blurs the note glow costs several times its budget. When
// the intro's first frames run slow, the cover goes lite for the rest of the page load: the trails redraw less often
// (20 times a second while they grow, 8 at rest), the notes keep one tight glow, transforms stay flat (goLite) and only
// the name follows the pointer (hero.tsx).
let lite = false

// Seeded, so the sky is the same on every visit.
function seeded(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647
}

// Without GPU compositing, every layer is blended in full on every frame, and GSAP's transforms promote what they move
// (3D while a tween runs, and the scrubbed cover keeps its 3D transforms at rest: a handful of full-screen layers). Lite
// also makes transforms flat (2D) from then on, so the browser repaints what moved instead. It looks the same.
function goLite(context: CoverContext) {
  lite = true
  context.stage.dataset.lite = 'true'
  gsap.config({ force3D: false })
  for (const element of context.q('[style*="transform"]')) if (element.style.transform) gsap.set(element, { force3D: false })
}

// Covers only the painted wall behind Hardik (and the gaps between the slats), registered to the photograph: the mask
// shares the photo's cover crop. He, the bench and the ground stay the photograph's own pixels. With `masked` off it is
// just the registered box, for layers that apply the mask themselves.
function WallLayer({ children, className, masked = true }: { children?: ReactNode; className?: string; masked?: boolean }) {
  const mask = `url(${wallMask})`
  const masking = masked ? { maskImage: mask, WebkitMaskImage: mask, maskSize: 'cover', WebkitMaskSize: 'cover', maskPosition: '50% 3%', WebkitMaskPosition: '50% 3%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' } : undefined
  return (
    <div className="hero-image pointer-events-none absolute inset-0">
      <div className="cover-photo absolute inset-0">
        <div className={cn('absolute inset-[-2%] size-[104%] overflow-hidden', className)} style={masking}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Star trails on the painted wall, masked to it inside the canvas (a CSS mask over a canvas that keeps changing halves
// the frame rate without a GPU). They also show between the bench slats.
export function StarTrails() {
  return (
    <div aria-hidden="true" className="star-trails pointer-events-none absolute inset-0">
      <div className="exposure-dim absolute inset-0 bg-[#020403] opacity-0" />
      {/* A static veil on the wall only, so the bench separates from it. */}
      <WallLayer className="bg-[rgb(5_8_10/0.46)]" />
      <WallLayer masked={false}>
        <canvas className="exposure-trails absolute inset-0 size-full opacity-50" />
      </WallLayer>
    </div>
  )
}

// Concentric arcs around a celestial pole above and to the right of the photograph. `draw(length, drift)` paints each
// trail `length` (0 to 1) of a full arc long, turned `drift` radians around the pole. Trails that turn past the far edge
// re-enter at the near edge, both out of view, so the field can turn forever.
function trailField(canvas: HTMLCanvasElement, rest: number, mask: HTMLImageElement) {
  const wanted = Math.min(2, window.devicePixelRatio || 1) * rest
  const density = Math.min(wanted, Math.sqrt(2.6e6 / (canvas.offsetWidth * canvas.offsetHeight)))
  const width = (canvas.width = Math.round(canvas.offsetWidth * density))
  const height = (canvas.height = Math.round(canvas.offsetHeight * density))
  const context = canvas.getContext('2d')!
  context.lineCap = 'round'
  const pole = { x: width * 1.08, y: -height * 0.28 }
  const corners = [[0, 0], [width, 0], [0, height], [width, height]]
  const distances = corners.map(([x, y]) => Math.hypot(x - pole.x, y - pole.y))
  const angles = corners.map(([x, y]) => Math.atan2(y - pole.y, x - pole.x))
  const inner = Math.min(...distances) * 0.9
  const outer = Math.max(...distances) * 1.02
  const low = Math.min(...angles) - sweep - 0.08
  const range = Math.max(...angles) + 0.06 - low
  const random = seeded(23)
  const count = Math.round((canvas.offsetWidth * canvas.offsetHeight) / 4200)
  const trails = Array.from({ length: count }, () => {
    let pick = random()
    const style = styles.findIndex(({ share }) => (pick -= share) < 0)
    return { radius: Math.sqrt(inner * inner + random() * (outer * outer - inner * inner)), angle: low + random() * range, style: style < 0 ? 2 : style }
  })
  // The wall mask, scaled once with the photograph's cover crop (centred, 3% from the top).
  let stencil: HTMLCanvasElement | null = null
  const masking = () => {
    if (stencil || !mask.complete || !mask.naturalWidth) return stencil
    stencil = document.createElement('canvas')
    stencil.width = width
    stencil.height = height
    const scale = Math.max(width / mask.naturalWidth, height / mask.naturalHeight)
    const maskWidth = mask.naturalWidth * scale
    const maskHeight = mask.naturalHeight * scale
    stencil.getContext('2d')!.drawImage(mask, (width - maskWidth) * 0.5, (height - maskHeight) * 0.03, maskWidth, maskHeight)
    return stencil
  }
  return (length: number, drift: number) => {
    context.clearRect(0, 0, width, height)
    const wall = masking()
    if (length <= 0 || !wall) return
    styles.forEach((style, index) => {
      context.strokeStyle = `rgb(${style.color} / ${style.alpha})`
      context.lineWidth = style.width * density
      context.beginPath()
      for (const trail of trails) {
        if (trail.style !== index) continue
        const tail = low + ((((trail.angle + drift - low) % range) + range) % range)
        context.moveTo(pole.x + Math.cos(tail) * trail.radius, pole.y + Math.sin(tail) * trail.radius)
        context.arc(pole.x, pole.y, trail.radius, tail, tail + length * sweep)
      }
      context.stroke()
    })
    context.globalCompositeOperation = 'destination-in'
    context.drawImage(wall, 0, 0)
    context.globalCompositeOperation = 'source-over'
  }
}

// One cover at a time, so the field's state lives with the module.
let field: { state: { length: number; drift: number; speed: number }; draw: () => void } | null = null

function parts(context: CoverContext) {
  const layer = context.q('.star-trails')[0]
  return { dim: layer.querySelector<HTMLElement>('.exposure-dim')!, canvas: layer.querySelector<HTMLCanvasElement>('.exposure-trails')! }
}

// A long exposure on the painted wall: star trails grow around their pole as the cover gently dims and lifts again,
// then keep turning, slowly and faintly, behind him.
export const exposure = {
  // Every run: sizes the field and, with motion, keeps it turning while the cover is on screen.
  setup(context: CoverContext) {
    const { canvas } = parts(context)
    const state = { length: 1, drift: 0, speed: 0 }
    const mask = new Image()
    mask.src = wallMask
    let paint = trailField(canvas, context.rest, mask)
    const draw = () => paint(state.length, state.drift)
    // The first draw waits for the mask, so an intro that starts with no trails doesn't paint a full field first.
    void mask.decode().then(draw, () => undefined)
    let size = `${canvas.offsetWidth}x${canvas.offsetHeight}`
    const observer = new ResizeObserver(() => {
      const next = `${canvas.offsetWidth}x${canvas.offsetHeight}`
      if (next === size) return
      size = next
      paint = trailField(canvas, context.rest, mask)
      draw()
    })
    observer.observe(canvas)
    field = { state, draw }
    if (lite) context.stage.dataset.lite = 'true'
    context.onCleanup(() => {
      observer.disconnect()
      field = null
    })
    if (!context.motion) return
    // At rest the field keeps turning, redrawn about 15 times a second (8 when lite; enough at this speed) while it is
    // on screen.
    let visible = true
    const watch = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    watch.observe(context.stage)
    let waited = 0
    const tick = (_time: number, delta: number) => {
      if (!visible || state.speed <= 0) return
      state.drift += turn * state.speed * (delta / 1000)
      waited += delta
      if (waited < (lite ? 125 : 66)) return
      waited = 0
      draw()
    }
    gsap.ticker.add(tick)
    context.onCleanup(() => {
      watch.disconnect()
      gsap.ticker.remove(tick)
    })
  },
  // Without the intro (reduced motion or a repeat run): full trails, turning only when motion is allowed.
  still() {
    if (field) field.state.speed = 1
  },
  // With motion, once per page load.
  intro(context: CoverContext) {
    const { dim, canvas } = parts(context)
    if (!field) {
      context.story()
      return
    }
    const { state, draw } = field
    state.length = 0
    state.speed = 0
    draw()
    // Judge the machine on the intro's own frames, about half a second of them (the first two can include page
    // start-up). Most of them must make 24 ms; a fast machine misses only the odd frame while the page settles.
    const deltas: number[] = []
    let elapsed = 0
    const probe = (_time: number, delta: number) => {
      deltas.push(delta)
      elapsed += delta
      if (deltas.length < 30 && (deltas.length < 6 || elapsed < 600)) return
      gsap.ticker.remove(probe)
      const sorted = deltas.slice(2).sort((a, b) => a - b)
      if (lite || sorted[Math.floor(sorted.length * 0.75)] <= 24) return
      goLite(context)
    }
    gsap.ticker.add(probe)
    context.onCleanup(() => gsap.ticker.remove(probe))
    let drawn = 0
    const grow = () => {
      const now = performance.now()
      if (lite && now - drawn < 50) return
      drawn = now
      draw()
    }
    gsap.set(context.subject, { filter: 'brightness(0.62) saturate(0.85)' })
    gsap.set(dim, { opacity: 0.38 })
    const intro = gsap
      .timeline({ onStart: context.played })
      .fromTo(canvas, { opacity: 0 }, { opacity: 0.9, duration: 0.7, ease: 'power1.out' }, 0.1)
      .to(state, { length: 1, duration: 2.3, ease: 'power2.inOut', onUpdate: grow, onComplete: draw }, 0.1)
      .to(dim, { opacity: 0, duration: 1.3, ease: 'sine.inOut' }, 1.6)
      .to(context.subject, { filter: 'brightness(1) saturate(1)', duration: 1.3, ease: 'sine.inOut', clearProps: 'filter' }, 1.6)
      .to(canvas, { opacity: 0.5, duration: 1.4, ease: 'sine.inOut' }, 2.1)
      .to(state, { speed: 1, duration: 3, ease: 'sine.in' }, 2.4)
      .add(context.story(), 1.9)
    context.skippable(intro)
  },
}
