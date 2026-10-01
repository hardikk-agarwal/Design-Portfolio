import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from 'remotion'
import { loadFont } from '@remotion/fonts'

loadFont({ family: 'Mona Sans', url: staticFile('fonts/mona-sans-wdth.woff2'), weight: '200 900', stretch: '75% 125%' })

// Site palette: project ink on near-black, rose accent, deep rose chips (6:1 with their text).
export const C = {
  bg: '#0d0c0e',
  ink: '#f0e7e6',
  mute: 'rgba(240, 231, 230, 0.62)',
  faint: 'rgba(240, 231, 230, 0.14)',
  line: 'rgba(240, 231, 230, 0.1)',
  project: '#b52845',
  rose: '#f0587a',
  chip: '#b3244a',
  chipInk: '#fff5f7',
}

export const ease = Easing.bezier(0.16, 1, 0.3, 1)
export const glide = Easing.bezier(0.65, 0, 0.35, 1)
export const tw = (f: number, start: number, dur: number, from = 0, to = 1, easing = ease) =>
  interpolate(f, [start, start + dur], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })

const font = { fontFamily: 'Mona Sans' }
export const display: CSSProperties = { ...font, fontStretch: '125%', fontWeight: 760, letterSpacing: '-0.045em', lineHeight: 0.92 }
export const heading: CSSProperties = { ...font, fontStretch: '110%', fontWeight: 680, letterSpacing: '-0.03em', lineHeight: 1.06 }
export const body: CSSProperties = { ...font, fontWeight: 460, letterSpacing: '-0.01em', lineHeight: 1.3 }
export const chip: CSSProperties = { ...font, display: 'inline-block', background: C.chip, color: C.chipInk, fontSize: 22, fontWeight: 620, lineHeight: 1, padding: '8px 11px', borderRadius: 6, whiteSpace: 'nowrap' }

export function Rise({ at, children, y = 26, dur = 26, style }: { at: number; children: ReactNode; y?: number; dur?: number; style?: CSSProperties }) {
  const p = tw(useCurrentFrame(), at, dur)
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>
}

export function Exit({ duration, out = 12, children }: { duration: number; out?: number; children: ReactNode }) {
  const f = useCurrentFrame()
  const p = out ? tw(f, duration - out, out, 0, 1, Easing.in(Easing.cubic)) : 0
  return <AbsoluteFill style={{ opacity: 1 - p, transform: `translateY(${-p * 14}px)` }}>{children}</AbsoluteFill>
}

// The site's highlighter: a rose band swept under the words.
export function Mark({ at, children, dur = 20 }: { at: number; children: ReactNode; dur?: number }) {
  const p = tw(useCurrentFrame(), at, dur, 0, 100, glide)
  return <span style={{ backgroundImage: 'linear-gradient(rgba(240, 88, 122, 0.45), rgba(240, 88, 122, 0.45))', backgroundRepeat: 'no-repeat', backgroundPosition: '0 90%', backgroundSize: `${p}% 0.4em`, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>{children}</span>
}

export function Count({ at, from, to, dur = 36, format = (v: number) => `${v}` }: { at: number; from: number; to: number; dur?: number; format?: (v: number) => string }) {
  const v = Math.round(tw(useCurrentFrame(), at, dur, from, to))
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{format(v)}</span>
}

export type Rect = { x: number; y: number; w: number; h: number }

const handles = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy]) => (
  <span key={`${cx}${cy}`} style={{ position: 'absolute', left: `${cx * 100}%`, top: `${cy * 100}%`, width: 10, height: 10, marginLeft: -5, marginTop: -5, background: '#fff', border: `2px solid ${C.rose}` }} />
))

// Selection box from the cover notes: rose outline, white corner handles, optional chip label.
export function Box({ rect, at, until, label, place = 'above' }: { rect: Rect; at: number; until?: number; label?: string; place?: 'above' | 'below' | 'right' }) {
  const f = useCurrentFrame()
  const p = tw(f, at, 16) * (until === undefined ? 1 : 1 - tw(f, until, 12))
  if (p <= 0) return null
  const pad = 7
  const spot = place === 'above' ? { left: -2, bottom: '100%', marginBottom: 12 } : place === 'below' ? { left: -2, top: '100%', marginTop: 12 } : { left: '100%', top: '50%', marginLeft: 16, transform: 'translateY(-50%)' }
  return (
    <div style={{ position: 'absolute', left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2, border: `2px solid ${C.rose}`, opacity: p, transform: `scale(${1.06 - 0.06 * Math.min(1, tw(f, at, 16))})` }}>
      {handles}
      {label ? <span style={{ ...chip, position: 'absolute', ...spot }}>{label}</span> : null}
    </div>
  )
}

// The same selection box, wrapped around inline content.
export function Outline({ at, children }: { at: number; children: ReactNode }) {
  const p = tw(useCurrentFrame(), at, 16)
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {p > 0 ? <span style={{ position: 'absolute', inset: -8, border: `2px solid ${C.rose}`, opacity: p, transform: `scale(${1.06 - 0.06 * p})` }}>{handles}</span> : null}
    </span>
  )
}

export type Cam = { x: number; y: number; z: number }
export type Move = { at: number; dur?: number; to: Cam }

export function camera(f: number, start: Cam, moves: Move[]): Cam {
  let c = start
  for (const m of moves) {
    const dur = m.dur ?? 34
    if (f >= m.at + dur) { c = m.to; continue }
    if (f > m.at) { const t = glide((f - m.at) / dur); c = { x: c.x + (m.to.x - c.x) * t, y: c.y + (m.to.y - c.y) * t, z: c.z + (m.to.z - c.z) * t } }
    break
  }
  return c
}

// A product screen in a window that swings in from 3D, with a camera that pans and zooms in source pixels.
export function Screen({ src, size: [sw, sh], box: [w, h], cam, enter = 0, children, opacity = 1 }: { src: string; size: [number, number]; box: [number, number]; cam: Cam; enter?: number; children?: (map: (r: Rect) => Rect) => ReactNode; opacity?: number }) {
  const p = tw(useCurrentFrame(), enter, 46)
  const k = (w / sw) * cam.z
  const tx = Math.min(0, Math.max(w - sw * k, w / 2 - cam.x * k))
  const ty = Math.min(0, Math.max(h - sh * k, h / 2 - cam.y * k))
  const map = (r: Rect): Rect => ({ x: tx + r.x * k, y: ty + r.y * k, w: r.w * k, h: r.h * k })
  return (
    <div style={{ width: w, height: h, perspective: 2400 }}>
      <div style={{ position: 'relative', width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#161616', opacity: Math.min(1, p * 1.5) * opacity, transform: `translateX(${(1 - p) * 160}px) rotateY(${(1 - p) * -24}deg) rotateX(${(1 - p) * 9}deg) scale(${0.9 + 0.1 * p})`, boxShadow: '0 50px 140px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 231, 230, 0.09)' }}>
        <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: sw, height: sh, maxWidth: 'none', transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${k})` }} />
        {children?.(map)}
      </div>
    </div>
  )
}

export function Cursor({ from, to, at, click }: { from: [number, number]; to: [number, number]; at: number; click: number }) {
  const f = useCurrentFrame()
  const p = tw(f, at, 26, 0, 1, glide), x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p
  const press = f >= click && f < click + 5 ? 0.86 : 1, ring = tw(f, click, 20)
  if (f < at) return null
  return (
    <>
      {f >= click ? <div style={{ position: 'absolute', left: to[0] - 50 * ring, top: to[1] - 50 * ring, width: 100 * ring, height: 100 * ring, borderRadius: '50%', border: `3px solid ${C.rose}`, opacity: 1 - ring }} /> : null}
      <svg width="34" height="40" viewBox="0 0 17 20" style={{ position: 'absolute', left: x - 3, top: y - 2, transform: `scale(${press})`, transformOrigin: '3px 2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.45))' }}>
        <path d="M1.5 1.5v15.2l4.1-3.9 2.6 6 2.9-1.3-2.6-5.9h5.6z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </>
  )
}

// Static noise tile: dithers the dark gradients against banding (animated grain tripled the file size).
export function Grain() {
  const url = useMemo(() => {
    const size = 200, c = document.createElement('canvas')
    c.width = c.height = size
    const g = c.getContext('2d')!, img = g.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(random(`grain-${i}`) * 255); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255 }
    g.putImageData(img, 0, 0)
    return c.toDataURL()
  }, [])
  return <AbsoluteFill style={{ backgroundImage: `url(${url})`, opacity: 0.04, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
}
