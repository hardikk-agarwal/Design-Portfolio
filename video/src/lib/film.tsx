// Shared film shell and scene layouts. Each film supplies its timeline, scene components and project colour.
import { useLayoutEffect, type ComponentType, type CSSProperties, type ReactNode } from 'react'
import { AbsoluteFill, Html5Audio, Img, Sequence, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, Exit, Grain, Mark, Rise, Screen, body, chip, display, glide, heading, tw } from './ui'

export type Line = { text: string; file: string; start: number; seconds: number; from: number; duration: number }
export type SceneData = { id: string; from: number; duration: number; lines: Line[] }
export type Timeline = { fps: number; durationInFrames: number; scenes: SceneData[] }
export type SceneProps = { scene: SceneData }

export const line = (scene: SceneData, i: number) => scene.lines[i].from - scene.from
export const typo = (s: string) => s.replace(/'/g, '’')
const rgba = (hex: string, a: number) => `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')}, ${a})`

const chapters: Record<string, string> = { problem: 'The problem', insight: 'The insight', result: 'The result', quote: 'In their words', takeaway: 'What I took away' }
const chapter = (id: string, decisions: number) => chapters[id] ?? (id.startsWith('decision') ? `Decision ${id.slice(8)} of ${decisions}` : '')

function current(timeline: Timeline, f: number) {
  const i = timeline.scenes.findIndex((s) => f < s.from + s.duration)
  return i < 0 ? timeline.scenes.length - 1 : i
}

function Backdrop({ timeline, glow, accent }: { timeline: Timeline; glow: Record<string, [number, number]>; accent: string }) {
  const f = useCurrentFrame()
  const i = current(timeline, f), s = timeline.scenes[i], next = timeline.scenes[Math.min(i + 1, timeline.scenes.length - 1)]
  const t = tw(f, s.from + s.duration - 30, 30, 0, 1, glide)
  const [x0, y0] = glow[s.id] ?? [50, 50], [x1, y1] = glow[next.id] ?? [50, 50]
  const dots = 'radial-gradient(ellipse at center, #000 25%, transparent 78%)'
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(1150px 780px at ${x0 + (x1 - x0) * t}% ${y0 + (y1 - y0) * t}%, ${rgba(accent, 0.3)}, transparent 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(240, 231, 230, 0.08) 1.3px, transparent 1.8px)', backgroundSize: '34px 34px', backgroundPosition: `${f * 0.12}px ${f * 0.06}px`, maskImage: dots, WebkitMaskImage: dots }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%)' }} />
    </AbsoluteFill>
  )
}

function Chrome({ timeline, accent, name }: { timeline: Timeline; accent: string; name: string }) {
  const f = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const s = timeline.scenes[current(timeline, f)], local = f - s.from
  const problem = timeline.scenes.find((x) => x.id === 'problem')!, end = timeline.scenes.find((x) => x.id === 'end')!
  const visible = tw(f, problem.from, 20) * (1 - tw(f, end.from - 8, 16))
  const label = chapter(s.id, timeline.scenes.filter((x) => x.id.startsWith('decision')).length)
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: `${(f / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${accent}, ${C.rose})` }} />
      <div style={{ ...body, position: 'absolute', left: 160, right: 160, top: 50, display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: visible }}>
        <span><span style={{ fontWeight: 640 }}>Hardik Agarwal</span><span style={{ color: C.mute }}>{`  ·  ${name}`}</span></span>
        <span style={{ color: C.mute, opacity: label ? Math.min(tw(local, 0, 14), 1 - tw(local, s.duration - 12, 12)) : 0 }}>{label}</span>
      </div>
    </>
  )
}

// Layout check for review renders (scripts/qa.mjs passes { qa: true }): logs visible text that is clipped,
// leaves the frame or collides with other text, so frames can be checked without looking at them.
function QaProbe() {
  const f = useCurrentFrame()
  useLayoutEffect(() => {
    const handle = delayRender('qa probe')
    const started = performance.now()
    // The render page sizes its canvas after the first layout; measuring before that wraps every line.
    const sized = (): Promise<void> => new Promise((resolve) => {
      const check = () => (document.querySelector<HTMLElement>('[data-film-root]')!.offsetWidth > 0 || performance.now() - started > 4000 ? resolve() : setTimeout(check, 25))
      check()
    })
    void Promise.all([document.fonts.ready, sized()]).then(() => {
      const root = document.querySelector<HTMLElement>('[data-film-root]')!
      const frame = root.getBoundingClientRect()
      if (!frame.width) {
        console.log(`QA ${JSON.stringify({ f, issues: ['canvas never sized; measurements skipped'] })}`)
        continueRender(handle)
        return
      }
      const seen = (el: Element | null) => { let o = 1; for (let e = el; e && e !== root.parentElement; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o }
      const texts: { el: HTMLElement; text: string; r: DOMRect; lines: DOMRect[] }[] = []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent?.trim()
        const el = n.parentElement
        if (!text || !el || seen(el) < 0.35 || getComputedStyle(el).visibility === 'hidden') continue
        const range = document.createRange()
        range.selectNodeContents(n)
        const r = range.getBoundingClientRect()
        // Line fragments trimmed to the line height: range boxes include the font's full ascent and descent.
        const lh = parseFloat(getComputedStyle(el).lineHeight)
        const lines = [...range.getClientRects()].map((l) => (lh > 0 && lh < l.height ? new DOMRect(l.left, l.top + (l.height - lh) / 2, l.width, lh) : l))
        if (r.width && r.height) texts.push({ el, text: text.slice(0, 40), r, lines })
      }
      const issues: string[] = []
      const rel = (r: DOMRect) => `${Math.round(r.left - frame.left)},${Math.round(r.top - frame.top)} ${Math.round(r.width)}x${Math.round(r.height)}`
      for (const t of texts) {
        if (t.r.left < frame.left - 1 || t.r.top < frame.top - 1 || t.r.right > frame.right + 1 || t.r.bottom > frame.bottom + 1) issues.push(`off-frame "${t.text}" ${rel(t.r)}`)
        for (let e = t.el.parentElement; e && e !== root; e = e.parentElement) {
          if (getComputedStyle(e).overflow === 'visible') continue
          const c = e.getBoundingClientRect()
          const area = t.lines.reduce((sum, l) => sum + l.width * l.height, 0)
          const kept = t.lines.reduce((sum, l) => sum + Math.max(0, Math.min(l.right, c.right) - Math.max(l.left, c.left)) * Math.max(0, Math.min(l.bottom, c.bottom) - Math.max(l.top, c.top)), 0)
          const shown = area ? kept / area : 1
          if (shown > 0.02 && shown < 0.97) issues.push(`clipped ${Math.round(shown * 100)}% "${t.text}" ${rel(t.r)}`)
          break
        }
      }
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j]
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue
        const hit = a.lines.some((p) => b.lines.some((q) => {
          const w = Math.min(p.right, q.right) - Math.max(p.left, q.left), h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)
          return w > 2 && h > 2 && (w * h) / Math.min(p.width * p.height, q.width * q.height) > 0.15
        }))
        if (hit) issues.push(`overlap "${a.text}" / "${b.text}" at ${rel(a.r)}`)
      }
      console.log(`QA ${JSON.stringify({ f, issues })}`)
      continueRender(handle)
    })
  }, [f])
  return null
}

export function FilmShell({ id, timeline, scenes, glow, accent, name }: { id: string; timeline: Timeline; scenes: Record<string, ComponentType<SceneProps>>; glow: Record<string, [number, number]>; accent: string; name: string }) {
  const f = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const black = Math.max(1 - tw(f, 0, 14), tw(f, durationInFrames - 26, 26))
  return (
    <AbsoluteFill data-film-root style={{ background: C.bg, color: C.ink }}>
      <Backdrop timeline={timeline} glow={glow} accent={accent} />
      {timeline.scenes.map((scene) => {
        const Scene = scenes[scene.id]
        if (!Scene) throw new Error(`No component for scene ${scene.id}`)
        return (
          <Sequence key={scene.id} name={scene.id} from={scene.from} durationInFrames={scene.duration}>
            <Exit duration={scene.duration} out={scene.id === 'end' ? 0 : 12}><Scene scene={scene} /></Exit>
          </Sequence>
        )
      })}
      <Chrome timeline={timeline} accent={accent} name={name} />
      <Grain />
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
      <Html5Audio src={staticFile(`${id}-mix.wav`)} />
      {getInputProps().qa ? <QaProbe /> : null}
    </AbsoluteFill>
  )
}

export function Bar({ label, value, at, fill }: { label: string; value: number; at: number; fill: string }) {
  return (
    <Rise at={at} y={12} dur={20} style={{ display: 'grid', gridTemplateColumns: '370px 1fr 130px', alignItems: 'center', gap: 30 }}>
      <span style={{ ...body, fontSize: 32, color: C.mute }}>{label}</span>
      <div style={{ height: 16, borderRadius: 8, background: C.faint, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: fill, borderRadius: 8 }} />
      </div>
      <span style={{ ...heading, fontSize: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Math.round(value)}%</span>
    </Rise>
  )
}

// Project name rises letter by letter (wrapping by word), then the headline, role chips and a tilted cover screen.
// `phone` covers are frameless screenshots whose rounded corners come from their own alpha.
export function TitleCard({ name, headline, chips, cover, size = 168, width = 1600, phone = false }: { name: string; headline: string; chips: string[]; cover: { src: string; size: [number, number]; box: [number, number]; left: number; top: number }; size?: number; width?: number; phone?: boolean }) {
  const f = useCurrentFrame()
  let index = 0
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: cover.left, top: cover.top, transform: `translateY(${(1 - tw(f, 4, 70)) * 220}px) rotate(-5deg)` }}>
        {phone
          ? <Img src={cover.src} style={{ display: 'block', width: cover.box[0], height: cover.box[1], opacity: tw(f, 2, 30), filter: 'drop-shadow(0 50px 70px rgba(0, 0, 0, 0.6))' }} />
          : <Screen src={cover.src} size={cover.size} box={cover.box} cam={{ x: cover.size[0] / 2, y: cover.size[1] / 2, z: 1 }} enter={2} />}
      </div>
      <div style={{ position: 'absolute', left: 160, top: 230, maxWidth: width }}>
        <div style={{ ...display, fontSize: size, display: 'flex', flexWrap: 'wrap', columnGap: '0.24em' }}>
          {name.split(' ').map((word) => (
            <span key={word} style={{ display: 'inline-flex' }}>
              {[...word].map((ch) => {
                const i = index++
                return (
                  <span key={i} style={{ display: 'inline-block', overflow: 'hidden', padding: '0.1em 0', margin: '-0.1em 0' }}>
                    <span style={{ display: 'inline-block', transform: `translateY(${(1 - tw(f, 2 + i * 1.4, 30)) * 110}%)` }}>{ch}</span>
                  </span>
                )
              })}
            </span>
          ))}
        </div>
        <Rise at={24} style={{ ...heading, fontSize: 56, color: C.mute, marginTop: 34 }}>{typo(headline)}</Rise>
        <Rise at={36} style={{ display: 'flex', gap: 14, marginTop: 46 }}>
          {chips.map((t) => (
            <span key={t} style={{ ...body, fontSize: 26, padding: '11px 20px', borderRadius: 999, border: `1.5px solid ${C.faint}`, background: 'rgba(13, 12, 14, 0.6)' }}>{t}</span>
          ))}
        </Rise>
      </div>
    </AbsoluteFill>
  )
}

// Big statement: each part rises at its frame; an optional phrase is swept with the highlighter.
export function Statement({ parts, size = 96 }: { parts: { text: string; at: number; mark?: { phrase: string; at: number } }[]; size?: number }) {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
      <div style={{ ...heading, fontSize: size, maxWidth: 1600 }}>
        {parts.map((p, i) => {
          const text = typo(p.text), phrase = p.mark && typo(p.mark.phrase), at = phrase ? text.indexOf(phrase) : -1
          return (
            <Rise key={i} at={p.at} style={{ marginTop: i ? 22 : 0 }}>
              {at < 0 ? text : <>{text.slice(0, at)}<Mark at={p.mark!.at} dur={22}>{phrase}</Mark>{text.slice(at + phrase!.length)}</>}
            </Rise>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

export function DecisionLayout({ n, kicker, title, chips, children, column = 590 }: { n?: number; kicker?: string; title: string; chips: { text: string; at: number }[]; children: ReactNode; column?: number }) {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 140, top: 0, bottom: 0, width: column, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Rise at={2} style={{ ...body, fontSize: 26, fontWeight: 620, color: C.rose, letterSpacing: '0.08em' }}>{kicker ?? `0${n}`}</Rise>
        <Rise at={6} style={{ ...heading, fontSize: 54, marginTop: 18 }}>{typo(title)}</Rise>
        <div style={{ marginTop: 48, display: 'grid', gap: 18 }}>
          {chips.map((c) => (
            <Rise key={c.text} at={c.at} y={14} dur={18} style={{ ...body, fontSize: 30, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: C.rose, flex: 'none' }} />{typo(c.text)}
            </Rise>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: column + 200, top: '50%', transform: 'translateY(-50%)' }}>{children}</div>
    </AbsoluteFill>
  )
}

export function QuoteCard({ text, highlight, by, detail, role }: { text: string; highlight: string; by?: string; detail?: string; role?: string }) {
  const [before, after] = typo(text).split(typo(highlight))
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 200px' }}>
      <Rise at={2} style={{ ...display, fontSize: 200, color: C.rose, height: 110 }}>“</Rise>
      <Rise at={6} style={{ ...heading, fontSize: text.length > 150 ? 58 : 70, fontWeight: 560, maxWidth: 1480 }}>{before}<Mark at={40} dur={24}>{typo(highlight)}</Mark>{after}”</Rise>
      <Rise at={22} style={{ marginTop: 48, display: 'flex', gap: 18, alignItems: 'baseline' }}>
        {role ? <span style={{ ...chip, fontSize: 26 }}>{role}</span> : null}
        {by ? <span style={{ ...body, fontSize: 30, fontWeight: 640 }}>{by}</span> : null}
        {detail ? <span style={{ ...body, fontSize: 30, color: C.mute }}>{detail}</span> : null}
      </Rise>
    </AbsoluteFill>
  )
}

// Words appear as they are spoken; `mark` highlights a phrase once it lands.
export function Spoken({ text, at, dur, mark }: { text: string; at: number; dur: number; mark?: string }) {
  const f = useCurrentFrame()
  const start = mark ? text.indexOf(mark) : -1
  let index = 0
  return (
    <>
      {text.split(' ').map((word, i, all) => {
        const from = index
        index += word.length + 1
        const p = tw(f, at + dur * (from / text.length) - 4, 12)
        const marked = start >= 0 && from >= start && from < start + mark!.length
        const content = `${word}${i < all.length - 1 ? ' ' : ''}`
        return <span key={i} style={{ opacity: 0.12 + 0.88 * p }}>{marked ? <Mark at={at + dur * ((start + mark!.length) / text.length)} dur={16}>{content}</Mark> : content}</span>
      })}
    </>
  )
}

// One spoken block per narration line of the scene.
export function TakeawayCard({ scene, lines, size = 80, width = 1600 }: { scene: SceneData; lines: { text: string; mark?: string }[]; size?: number; width?: number }) {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
      <Rise at={0} style={{ ...heading, fontSize: size, maxWidth: width }}>
        {lines.map((l, i) => (
          <div key={i} style={{ marginTop: i ? 26 : 0 }}><Spoken text={typo(l.text)} at={line(scene, i)} dur={scene.lines[i].duration} mark={l.mark && typo(l.mark)} /></div>
        ))}
      </Rise>
    </AbsoluteFill>
  )
}

export function EndCard({ note = 'Narrated with an AI voice' }: { note?: string }) {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', padding: '0 160px' }}>
      <Rise at={6} style={{ ...display, fontSize: 150 }}>Hardik Agarwal</Rise>
      <Rise at={14} style={{ ...heading, fontSize: 50, color: C.mute, marginTop: 28 }}>Product designer</Rise>
      <Rise at={26} style={{ marginTop: 76, display: 'flex', gap: 20, alignItems: 'baseline' }}>
        <span style={{ ...body, fontSize: 32 }}>Read the full case study at</span>
        <span style={{ ...body, fontSize: 32, color: C.rose, fontWeight: 600 }}>hardikk-agarwal.github.io/Design-Portfolio</span>
      </Rise>
      <Rise at={34} style={{ ...body, position: 'absolute', right: 160, bottom: 84, fontSize: 22, color: C.mute }}>{note}</Rise>
    </AbsoluteFill>
  )
}

// A rounded, shadowed card for UI crops shown without window chrome.
export const floating: CSSProperties = { borderRadius: 22, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(240, 231, 230, 0.09)' }
