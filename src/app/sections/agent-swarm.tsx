import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

type Box = readonly [left: number, top: number, width: number, height: number]

// The App Trust cover (1600 x 1000) sits in the 5:4 preview with p-[8%] padding, a share of the WIDTH,
// so the image spans 8%..92% across and 17.1875%..82.8125% down the preview.
const image: Box = [8, 17.1875, 84, 65.625]
// The dialog inside the cover, measured from app-trust-cover.webp (398,199 to 1202,801). It is centred in the preview.
const dialogInImage: Box = [24.875, 19.9, 50.25, 60.2]
const dialog: Box = [
  image[0] + (image[2] * dialogInImage[0]) / 100,
  image[1] + (image[3] * dialogInImage[1]) / 100,
  (image[2] * dialogInImage[2]) / 100,
  (image[3] * dialogInImage[3]) / 100,
]
// The agents build at this zoom; at the end the dialog settles exactly onto the real screenshot.
const buildScale = 1.25
const headingDraft = 0.66

// Parts of the dialog in percent of the dialog box, from the same cover.
const parts = {
  shield: [5.2, 4.3, 3.1, 4.2],
  title: [10.3, 5.2, 24.5, 3.2],
  close: [93.6, 4.6, 2.8, 3.8],
  heading: [5.2, 17.8, 69.7, 5.2],
  card: [5.2, 27.7, 89.8, 17.6],
  fileIcon: [8.1, 31.2, 8.1, 10.4],
  name: [19.3, 32.3, 26.7, 3],
  publisher: [19.3, 38.4, 15.7, 3],
  safe: [70.5, 32.4, 23.5, 7.6],
  unverified: [70.5, 32.4, 23.5, 7.6],
  flag: [68.8, 30.6, 26.9, 11.2],
  body1: [5.2, 51, 71.7, 2.8],
  body2: [5.2, 56.1, 80.2, 2.8],
  body3: [5.2, 61.3, 18.7, 2.8],
  link: [5.2, 70.3, 39.1, 3],
  divider: [0, 79.9, 100, 0.3],
  primary: [5.2, 84.1, 43.9, 10.1],
  secondary: [51, 84.1, 43.9, 10.1],
} satisfies Record<string, Box>

type AgentId = 'layout' | 'type' | 'components' | 'signals' | 'qa' | 'hardik'

const agents: { id: AgentId; name: string; color: string; ink: string; from: readonly [number, number] }[] = [
  { id: 'layout', name: 'Layout', color: '#2563eb', ink: '#ffffff', from: [7, 9] },
  { id: 'type', name: 'Type', color: '#f5b301', ink: '#1d1600', from: [84, 8] },
  { id: 'components', name: 'Components', color: '#7c3aed', ink: '#ffffff', from: [5, 62] },
  { id: 'signals', name: 'Signals', color: '#0e7490', ink: '#ffffff', from: [88, 55] },
  { id: 'qa', name: 'QA', color: 'var(--foreground)', ink: 'var(--background)', from: [62, 90] },
  { id: 'hardik', name: 'Hardik', color: 'var(--primary)', ink: 'var(--primary-foreground)', from: [-8, 108] },
]
const agentById = Object.fromEntries(agents.map((agent) => [agent.id, agent])) as Record<AgentId, (typeof agents)[number]>

// The App Trust build, told through its real steering moment: one verdict read as proof of safety.
const lines: { agent: AgentId; text: string }[] = [
  { agent: 'layout', text: 'dialog frame' },
  { agent: 'type', text: 'title and copy' },
  { agent: 'components', text: 'file card, buttons' },
  { agent: 'signals', text: 'one verdict: safe' },
  { agent: 'qa', text: 'contrast and spacing pass' },
  { agent: 'hardik', text: 'split who made it from the file' },
  { agent: 'signals', text: 'publisher: not verified' },
  { agent: 'hardik', text: 'approved' },
]
const buildSteps = lines.filter((line) => line.agent !== 'hardik').length

// Preview-box percent of a point given in dialog percent, at build zoom.
function point(u: number, v: number) {
  return {
    x: 50 + buildScale * (dialog[0] + (dialog[2] * u) / 100 - 50),
    y: 50 + buildScale * (dialog[1] + (dialog[3] * v) / 100 - 50),
  }
}
function at(u: number, v: number) {
  const { x, y } = point(u, v)
  return { left: `${x}%`, top: `${y}%` }
}
const place = ([left, top, width, height]: Box) => ({ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` })

// Only the first completed run per page load plays it; a remount before then starts it again.
let played = false

export function AgentSwarm({ rush }: { rush: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  useGSAP(() => {
    const el = root.current
    const section = el?.closest('section')
    const list = section?.querySelector('.ai-list')
    if (!el || !section || !list || played) return
    const q = gsap.utils.selector(el)
    const agent = (id: AgentId) => q(`[data-agent="${id}"]`)
    const part = (id: string) => q(`[data-part="${id}"]`)

    gsap.matchMedia().add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      if (played) return
      const counter = q('[data-built]')[0]
      const count = (value: number) => { if (counter) counter.textContent = `${value}/${buildSteps}` }
      gsap.set(el, { autoAlpha: 1 })
      gsap.set(q('[data-stage]'), { scale: buildScale, transformOrigin: '50% 50%' })
      gsap.set(part('dialog'), { clipPath: 'inset(0% 100% 100% 0%)' })
      gsap.set(q('[data-bar]'), { scaleX: 0, transformOrigin: '0% 50%' })
      gsap.set(q('[data-pop]'), { autoAlpha: 0 })
      gsap.set(q('[data-log]'), { autoAlpha: 0, y: 12 })
      gsap.set(q('[data-line]'), { autoAlpha: 0, y: 4 })
      agents.forEach(({ id, from }) => gsap.set(agent(id), { left: `${from[0]}%`, top: `${from[1]}%`, autoAlpha: 0 }))

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          played = true
          count(buildSteps)
          gsap.set(el, { autoAlpha: 0 })
          timeline.current = null
        },
      })
      const move = (id: AgentId, u: number, v: number, time: number, duration = 0.6, ease = 'power2.inOut') =>
        tl.to(agent(id), { ...at(u, v), duration, ease }, time)
      const tap = (id: AgentId, time: number) => {
        tl.to(q(`[data-agent="${id}"] [data-arrow]`), { scale: 0.8, transformOrigin: '0% 0%', duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.inOut' }, time)
        tl.fromTo(q(`[data-agent="${id}"] [data-ring]`), { scale: 0.2, autoAlpha: 0.9 }, { scale: 1.7, autoAlpha: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, time)
      }
      const grow = (id: string, time: number, duration = 0.3, to = 1) =>
        tl.to(part(id), { scaleX: to, duration, ease: 'power2.out' }, time)
      const pop = (id: string, time: number) =>
        tl.fromTo(part(id), { scale: 0.55, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2.2)' }, time)
      let built = 0
      const log = (index: number, time: number) => {
        tl.to(q('[data-line]')[index] ?? [], { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, time)
        if (index >= 3) tl.to(q('[data-lines]'), { yPercent: (-(index - 2) * 100) / lines.length, duration: 0.3, ease: 'power2.out' }, time)
        if (lines[index]?.agent !== 'hardik') {
          const value = ++built
          tl.call(() => count(value), undefined, time)
        }
      }

      // The agents arrive.
      tl.to(q('[data-log]'), { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0)
      agents.filter(({ id }) => id !== 'hardik').forEach(({ id }, index) => tl.to(agent(id), { autoAlpha: 1, duration: 0.3 }, 0.1 + index * 0.08))

      // Layout draws the frame and the footer rule.
      move('layout', 0, 0, 0.15, 0.55)
      tap('layout', 0.72)
      tl.to(q('[data-part="dialog"]'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55 }, 0.75)
      move('layout', 100, 100, 0.75, 0.55)
      move('layout', 0, 79.9, 1.32, 0.3)
      grow('divider', 1.62, 0.35)
      move('layout', 100, 79.9, 1.62, 0.35, 'power2.out')
      move('layout', 12, -16, 2.0, 0.7)
      log(0, 1.7)

      // Type writes the title, a first heading and the copy.
      move('type', 10.3, 7, 0.3, 0.7)
      grow('shield', 1.0, 0.2)
      grow('title', 1.05, 0.3)
      tl.to(part('close'), { autoAlpha: 1, duration: 0.2 }, 1.3)
      move('type', 35, 7, 1.05, 0.3, 'power2.out')
      move('type', 5.2, 20, 1.38, 0.22)
      grow('heading', 1.6, 0.35, headingDraft)
      move('type', 5.2 + 69.7 * headingDraft, 20, 1.6, 0.35, 'power2.out')
      grow('body1', 1.98, 0.22)
      grow('body2', 2.1, 0.22)
      grow('body3', 2.22, 0.14)
      move('type', 24, 63, 1.98, 0.38)
      grow('link', 2.4, 0.2)
      move('type', 44, 72, 2.38, 0.22, 'power2.out')
      move('type', -12, 46, 2.75, 0.7)
      log(1, 2.3)

      // Components drops in the file card and the buttons.
      move('components', 5.2, 27.7, 0.4, 0.8)
      tl.fromTo(part('card'), { scaleY: 0, autoAlpha: 1, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.35, ease: 'power3.out' }, 1.3)
      move('components', 95, 45.3, 1.3, 0.35, 'power2.out')
      tl.to(q('[data-part="fileIcon"], [data-part="name"], [data-part="publisher"]'), { autoAlpha: 1, duration: 0.25, stagger: 0.06 }, 1.7)
      move('components', 5.2, 84.1, 1.75, 0.45)
      tl.fromTo(q('[data-part="primary"], [data-part="secondary"]'), { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.1, ease: 'back.out(2)' }, 2.25)
      tap('components', 2.25)
      move('components', 95, 94.2, 2.25, 0.4, 'power2.out')
      move('components', -14, 92, 2.7, 0.7)
      log(2, 2.55)

      // Signals' first pass rolls every check into one verdict.
      move('signals', 82, 37, 0.5, 1.6, 'power1.inOut')
      tap('signals', 2.72)
      pop('safe', 2.75)
      log(3, 2.85)
      move('signals', 84, -16, 3.05, 0.5)

      // QA's checks pass.
      move('qa', 102, 0, 1.0, 1.6, 'power1.inOut')
      tl.fromTo(part('scan'), { top: '0%', autoAlpha: 1 }, { top: '100%', duration: 0.7, ease: 'none', immediateRender: false }, 3.05)
      move('qa', 102, 100, 3.05, 0.7, 'none')
      tl.to(q('[data-part="scan"]'), { autoAlpha: 0, duration: 0.2 }, 3.75)
      log(4, 3.7)
      tl.to(agent('qa'), { left: '118%', top: '70%', autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 3.85)

      // Hardik catches what the checks can't: one verdict reads as proof of safety.
      tl.to(agent('hardik'), { autoAlpha: 1, duration: 0.2 }, 3.75)
      move('hardik', 78, 40.5, 3.75, 0.8, 'power3.out')
      tap('hardik', 4.6)
      tl.fromTo(part('flag'), { scale: 1.12, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 4.62)
      tl.fromTo(q('[data-bubble="split"]'), { y: 4, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 4.7)
      log(5, 4.75)

      // Signals splits it: who made the app comes first.
      move('signals', 97, 30, 5.3, 0.4)
      tap('signals', 5.75)
      tl.to(part('safe'), { scale: 0.6, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 5.75)
      pop('unverified', 5.9)
      tl.to(part('heading'), { scaleX: 1, duration: 0.4 }, 5.9)
      tl.to(q('[data-part="flag"], [data-bubble="split"]'), { autoAlpha: 0, duration: 0.25 }, 6.15)
      log(6, 6.0)

      // Approved; the build settles onto the real screen.
      move('hardik', 60, 62, 6.2, 0.4)
      tap('hardik', 6.62)
      tl.fromTo(q('[data-bubble="ship"]'), { y: 4, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 6.65)
      log(7, 6.68)
      tl.to(q('[data-bubble="ship"]'), { autoAlpha: 0, duration: 0.2 }, 6.95)
      // Exits in preview percent, each to its nearest edge.
      const exits: Record<AgentId, readonly [number, number]> = { layout: [-18, 12], type: [-18, 48], components: [-18, 80], signals: [118, 28], qa: [45, -18], hardik: [28, 120] }
      agents.forEach(({ id }, index) => tl.to(agent(id), { left: `${exits[id][0]}%`, top: `${exits[id][1]}%`, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, 7.0 + index * 0.04))
      tl.to(q('[data-stage]'), { scale: 1, duration: 0.9, ease: 'expo.inOut' }, 7.1)
      tl.to(q('[data-canvas], [data-log]'), { autoAlpha: 0, duration: 0.55, ease: 'power1.out' }, 7.65)
      tl.to(q('[data-part="dialog"]'), { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, 7.9)
      tl.timeScale(1.15)
      timeline.current = tl

      ScrollTrigger.create({ trigger: list, start: 'top 55%', once: true, onEnter: () => { tl.play() } })
      // Offscreen, the build waits.
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => { if (tl.progress() > 0 && tl.progress() < 1) tl.paused(!self.isActive) },
      })
      return () => { timeline.current = null }
    })
  }, { scope: root })

  // Pointing at the list means the visitor wants the real previews now.
  useEffect(() => {
    const tl = timeline.current
    if (!rush || !tl) return
    played = true
    if (tl.progress() === 0) {
      tl.progress(1)
      gsap.set(root.current, { autoAlpha: 0 })
    } else tl.timeScale(6).paused(false)
  }, [rush])

  return (
    <div ref={root} className="pointer-events-none invisible absolute inset-0 z-10 overflow-hidden opacity-0 [container-type:inline-size]">
      <div
        data-canvas
        className="absolute inset-0 bg-muted"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--foreground) 16%, transparent) 1px, transparent 0)', backgroundSize: '18px 18px' }}
      />

      <div data-stage className="absolute inset-0">
        <div data-part="dialog" className="absolute rounded-[0.6cqw] border border-foreground/15 bg-card shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)]" style={place(dialog)}>
          <span data-part="shield" data-bar className="absolute rounded-[0.3cqw] bg-[#3b82f6]/70" style={place(parts.shield)} />
          <span data-part="title" data-bar className="absolute rounded-full bg-foreground/25" style={place(parts.title)} />
          <svg data-part="close" data-pop viewBox="0 0 10 10" className="absolute text-foreground/40" style={place(parts.close)} aria-hidden="true">
            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span data-part="heading" data-bar className="absolute rounded-[0.4cqw] bg-foreground/35" style={place(parts.heading)} />
          <span data-part="card" data-pop className="absolute rounded-[0.5cqw] border border-foreground/10 bg-foreground/[0.05]" style={place(parts.card)} />
          <span data-part="fileIcon" data-pop className="absolute rounded-[0.5cqw] bg-foreground/15" style={place(parts.fileIcon)} />
          <span data-part="name" data-pop className="absolute rounded-full bg-foreground/25" style={place(parts.name)} />
          <span data-part="publisher" data-pop className="absolute rounded-full bg-sky-500/45" style={place(parts.publisher)} />
          <span data-part="safe" data-pop className="absolute flex items-center justify-center gap-[0.35em] rounded-full bg-[#15803d] font-semibold text-white" style={{ ...place(parts.safe), fontSize: 'clamp(6px, 1.25cqw, 11px)' }}>
            <svg viewBox="0 0 10 10" className="size-[0.95em]" aria-hidden="true"><path d="M2 5.2l2 2L8 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Safe
          </span>
          <span data-part="unverified" data-pop className="absolute flex items-center justify-center gap-[0.35em] rounded-full bg-[#f5c518] font-semibold text-[#1d1600]" style={{ ...place(parts.unverified), fontSize: 'clamp(6px, 1.25cqw, 11px)' }}>
            <svg viewBox="0 0 10 10" className="size-[0.95em]" aria-hidden="true"><path d="M5 1.2L9.2 8.6H.8z" fill="currentColor" /><path d="M5 4v2.2M5 7.3v.1" stroke="#f5c518" strokeWidth="1.1" strokeLinecap="round" /></svg>
            Unverified
          </span>
          <span data-part="flag" data-pop className="absolute rounded-full border-[1.5px] border-dashed border-primary" style={place(parts.flag)} />
          <span data-part="body1" data-bar className="absolute rounded-full bg-foreground/15" style={place(parts.body1)} />
          <span data-part="body2" data-bar className="absolute rounded-full bg-foreground/15" style={place(parts.body2)} />
          <span data-part="body3" data-bar className="absolute rounded-full bg-foreground/15" style={place(parts.body3)} />
          <span data-part="link" data-bar className="absolute rounded-full bg-sky-500/45" style={place(parts.link)} />
          <span data-part="divider" data-bar className="absolute bg-foreground/15" style={place(parts.divider)} />
          <span data-part="primary" data-pop className="absolute rounded-[0.35cqw] bg-sky-400/60" style={place(parts.primary)} />
          <span data-part="secondary" data-pop className="absolute rounded-[0.35cqw] border border-foreground/20 bg-foreground/[0.04]" style={place(parts.secondary)} />
          <span data-part="scan" data-pop className="absolute -left-[3%] h-[2px] w-[106%] bg-foreground/40 shadow-[0_0_8px_1px_color-mix(in_srgb,var(--foreground)_16%,transparent)]" />
        </div>
      </div>

      <div data-log className="absolute bottom-[3.5%] right-[3%] w-[46%] rounded-[1.4cqw] border border-foreground/10 bg-background/90 p-[1.6cqw] shadow-[0_12px_30px_-18px_rgb(0_0_0/0.5)]">
        <p className="flex justify-between font-semibold uppercase tracking-[0.12em] text-muted-foreground" style={{ fontSize: 'clamp(6.5px, 1.3cqw, 10.5px)' }}>
          <span>Agent log</span>
          <span className="tabular">Built <span data-built>0/{buildSteps}</span></span>
        </p>
        <div className="mt-[0.9cqw] h-[4.8em] overflow-hidden" style={{ fontSize: 'clamp(7.5px, 1.55cqw, 12px)' }}>
          <ol data-lines>
            {lines.map(({ agent, text }, index) => (
              <li key={index} data-line className="flex h-[1.6em] items-center gap-[0.5em] whitespace-nowrap">
                <span className="size-[0.6em] shrink-0 rounded-[2px]" style={{ backgroundColor: agentById[agent].color }} />
                <span className="font-semibold text-foreground">{agentById[agent].name}</span>
                <span className="truncate text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {agents.map(({ id, name, color, ink }) => (
        <div key={id} data-agent={id} className="absolute" style={{ fontSize: 'clamp(8px, 1.7cqw, 12.5px)' }}>
          <span data-ring className="absolute -left-[0.9em] -top-[0.9em] size-[1.8em] rounded-full border-2 opacity-0" style={{ borderColor: color }} />
          <svg data-arrow viewBox="0 0 13 18" className="relative block w-[1.25em] drop-shadow-[0_1px_1.5px_rgb(0_0_0/0.3)]" aria-hidden="true">
            <path d="M1 1v14.2l3.9-3.6 2.6 5.6 2.6-1.2-2.5-5.4h5.3z" style={{ fill: color }} stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <div className="absolute left-[0.95em] top-[1.55em] flex flex-col items-start gap-[0.3em]">
            <span className="whitespace-nowrap rounded-full px-[0.6em] py-[0.12em] font-semibold leading-snug" style={{ backgroundColor: color, color: ink }}>{name}</span>
            {id === 'hardik' && (
              <span className="grid justify-items-start">
                <span data-bubble="split" className="col-start-1 row-start-1 whitespace-nowrap rounded-[0.7em] rounded-tl-[0.15em] bg-primary px-[0.7em] py-[0.35em] font-medium text-primary-foreground opacity-0 shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)]">Split who made it from the file</span>
                <span data-bubble="ship" className="col-start-1 row-start-1 whitespace-nowrap rounded-[0.7em] rounded-tl-[0.15em] bg-primary px-[0.7em] py-[0.35em] font-medium text-primary-foreground opacity-0 shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)]">Ship it</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
