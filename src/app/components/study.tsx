import { Fragment, useEffect, useRef, type CSSProperties, type PointerEvent } from 'react'
import { ArrowRight, ArrowUpRight, Check, ChevronsLeftRight, Lock, X } from 'lucide-react'
import { gsap, useGSAP, motionOk } from '@/lib/gsap'
import { Link } from '@/lib/navigation'
import { projectHash } from '@/lib/routes.js'
import type { CaseStudy, Flow, Metric, Project, Quote, Shot } from '@/lib/content'
import { MetricValue } from '@/sections/work'
import { Marked, RoleChip } from '@/sections/words'
import { cn } from '@/lib/utils'

// Shared by the case studies (#work) and the AI projects (#ai).
export const screen = 'rounded-xl ring-1 ring-black/10 shadow-[0_32px_64px_-32px_rgb(0_0_0/0.5)]'
export const heading = 'text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold tracking-[-0.025em] [font-stretch:108%]'
export const body = 'mt-4 max-w-[62ch] text-[18px] leading-relaxed'
const statColumns: Record<number, string> = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2' }

export function openLabel(project: Project) {
  if (project.tool) return project.locked ? 'Unlock project' : 'View project'
  return project.locked ? 'Unlock case study' : 'Read case study'
}

function Shots({ shots, onZoom }: { shots: Shot[]; onZoom: (shot: Shot) => void }) {
  const columns = shots.length === 3 ? 'sm:grid-cols-3' : shots.length > 1 ? 'sm:grid-cols-2' : ''
  return (
    <div className={cn('mt-8 grid items-start gap-5', columns)}>
      {shots.map((shot) => (
        <figure key={shot.src}>
          {shot.caption && <figcaption className="mb-3 text-[14px] font-medium text-muted-foreground">{shot.caption}</figcaption>}
          <button type="button" onClick={() => onZoom(shot)} aria-label={`Enlarge image: ${shot.alt}`} className="block w-full cursor-zoom-in rounded-xl">
            <img src={shot.src} alt="" width={shot.width} height={shot.height} loading="lazy" decoding="async" className={cn('h-auto w-full', screen)} />
          </button>
        </figure>
      ))}
    </div>
  )
}

export function Compare({ before, after, className = 'mt-8' }: { before: Shot; after: Shot; className?: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const range = useRef<HTMLInputElement>(null)
  const hint = useRef<gsap.core.Timeline | null>(null)

  const show = (value: number) => {
    const split = Math.min(100, Math.max(0, value))
    frame.current?.style.setProperty('--split', `${split}%`)
    if (range.current) range.current.value = String(Math.round(split))
  }
  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    show(((event.clientX - box.left) / box.width) * 100)
  }

  // A single sweep shows the frame can be dragged; any input from the reader stops it.
  useGSAP(() => {
    gsap.matchMedia().add(motionOk, () => {
      const state = { split: 50 }
      hint.current = gsap.timeline({ scrollTrigger: { trigger: frame.current, start: 'top 70%', once: true }, onUpdate: () => show(state.split) })
        .to(state, { split: 32, duration: 0.6, ease: 'power2.inOut' })
        .to(state, { split: 68, duration: 0.9, ease: 'power2.inOut' })
        .to(state, { split: 50, duration: 0.6, ease: 'power2.inOut' })
    })
  }, { scope: frame })

  // Phone screens stay phone-sized: full width would make a portrait pair taller than the screen.
  const portrait = after.height > after.width

  return (
    <figure className={className} style={portrait ? { maxWidth: `calc(80svh * ${after.width / after.height})` } : undefined}>
      <div
        ref={frame}
        onPointerDown={(event) => {
          hint.current?.kill()
          event.currentTarget.setPointerCapture(event.pointerId)
          follow(event)
        }}
        onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && follow(event)}
        className={cn('group/compare relative cursor-ew-resize touch-pan-y select-none overflow-hidden', screen, portrait && 'rounded-[13.5%/6.2%]')}
        style={{ '--split': '50%', aspectRatio: `${after.width} / ${after.height}` } as CSSProperties}
      >
        <img src={after.src} alt={after.alt} width={after.width} height={after.height} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover" />
        <img src={before.src} alt={before.alt} width={before.width} height={before.height} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 size-full object-cover [clip-path:inset(0_calc(100%_-_var(--split))_0_0)]" />
        {/* On phone screens the labels sit mid-height, clear of the rounded corners, status bar and tab bar. */}
        <span aria-hidden="true" className={cn('absolute rounded-full bg-black/70 px-2.5 py-1 text-[13px] font-semibold text-white', portrait ? 'left-[5%] top-[40%]' : 'left-3 top-3')}>Before</span>
        <span aria-hidden="true" className={cn('absolute rounded-full bg-black/70 px-2.5 py-1 text-[13px] font-semibold text-white', portrait ? 'right-[5%] top-[40%]' : 'right-3 top-3')}>After</span>
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[var(--split)] w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.18)]">
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-[0_8px_24px_rgb(0_0_0/0.35)] group-focus-within/compare:outline-2 group-focus-within/compare:outline-offset-2 group-focus-within/compare:outline-ring">
            <ChevronsLeftRight className="size-5" strokeWidth={2} />
          </span>
        </span>
        <input
          ref={range}
          type="range"
          min={0}
          max={100}
          defaultValue={50}
          aria-label="Share of the screen showing the before version"
          onInput={(event) => {
            hint.current?.kill()
            show(Number(event.currentTarget.value))
          }}
          className="sr-only"
        />
      </div>
      <figcaption className="mt-3 text-[14px] font-medium text-muted-foreground">{before.caption}. {after.caption}. Drag to compare.</figcaption>
    </figure>
  )
}

function Flows({ flows }: { flows: Flow[] }) {
  return (
    <div className="flows mt-8 grid gap-7 rounded-xl border border-border p-5 md:p-7">
      {flows.map((flow, index) => {
        const lead = index === flows.length - 1
        return (
          <div key={flow.label}>
            <p className="text-[14px] font-medium text-muted-foreground">{flow.label}</p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2.5">
              {flow.steps.map((step, stepIndex) => (
                <li key={step} className="flow-step flex items-center gap-2">
                  <span className={cn('rounded-full px-3.5 py-1.5 text-[15px] font-semibold', lead ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground')}>{step}</span>
                  {stepIndex < flow.steps.length - 1 && <ArrowRight aria-hidden="true" className="size-3.5 text-muted-foreground" strokeWidth={2} />}
                </li>
              ))}
            </ol>
          </div>
        )
      })}
    </div>
  )
}

function Contrast({ groups }: { groups: NonNullable<CaseStudy['contrast']> }) {
  return (
    <div className="project-block mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8">
      {groups.map((group) => (
        <div key={group.title} className="border-t border-border pt-6">
          <p className="text-[15px] font-semibold">{group.title}</p>
          <ul className="mt-4 grid gap-3">
            {group.items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[17px]">
                {group.keep
                  ? <Check aria-hidden="true" className="size-4 shrink-0 text-primary" strokeWidth={2.5} />
                  : <X aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.5} />}
                <span className={group.keep ? 'font-semibold' : 'text-muted-foreground line-through decoration-1'}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function Stats({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <dl className={cn('grid gap-x-8 gap-y-7 border-y border-border py-8', statColumns[metrics.length], className)}>
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col-reverse justify-end gap-2">
          <dt className="max-w-[28ch] text-[15px] font-medium leading-snug text-muted-foreground">{metric.label}</dt>
          <dd className="whitespace-nowrap text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold leading-none tracking-[-0.035em] [font-stretch:106%] tabular">
            <MetricValue value={metric.value} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Blockquote({ quote }: { quote: Quote }) {
  return (
    <figure className="mt-10 max-w-[52ch]">
      <blockquote className="text-[clamp(1.2rem,1.7vw,1.5rem)] font-medium leading-snug">“{quote.text}”</blockquote>
      <figcaption className="mt-3 text-[15px] text-muted-foreground">{quote.source}</figcaption>
    </figure>
  )
}

export function NdaPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">
      <Lock aria-hidden="true" className="size-3.5" strokeWidth={2.25} /> Under NDA
    </span>
  )
}

// Headline figures on a project's own colour, in its ink.
export function HeroMetrics({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <dl className={cn('flex flex-wrap gap-x-10 gap-y-5', className)}>
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col-reverse justify-end gap-1.5">
          <dt className="max-w-[22ch] text-[14px] font-medium leading-snug">{metric.label}</dt>
          <dd className="whitespace-nowrap text-[clamp(1.5rem,2.2vw,2.4rem)] font-bold leading-none tracking-[-0.035em] [font-stretch:106%] tabular">
            <MetricValue value={metric.value} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function StackList({ stack, label, className }: { stack: string[]; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {stack.map((item) => (
        <li key={item} className="rounded-full border border-current/25 px-2.5 py-0.5 text-[13px] font-semibold">{item}</li>
      ))}
    </ul>
  )
}

export function Byline({ project, className }: { project: Project; className?: string }) {
  const parts = [project.role, project.organization, project.timeline].filter(Boolean)
  return (
    <p className={cn('mt-4 text-[15px] font-medium', className)}>
      {parts.map((part, index) => (
        <Fragment key={part}>
          {index > 0 && <><span aria-hidden="true" className="px-2">·</span><span className="sr-only">, </span></>}
          {part}
        </Fragment>
      ))}
    </p>
  )
}

// A small square of the project's colour with its screen inset, like an app tile.
export function ProjectTile({ project, className, style }: { project: Project; className?: string; style?: CSSProperties }) {
  return (
    <span aria-hidden="true" className={cn('flex aspect-square items-center justify-center overflow-hidden rounded-2xl p-[14%]', className)} style={{ backgroundColor: project.color, ...style }}>
      <img src={project.cover.src} alt="" width={project.cover.width} height={project.cover.height} loading="lazy" decoding="async" className="h-auto max-h-full w-auto max-w-full rounded-[3px] shadow-[0_6px_14px_-6px_rgb(0_0_0/0.55)]" />
    </span>
  )
}

export function NextProject({ project }: { project: Project }) {
  return (
    <Link
      to={projectHash(project.id)}
      className="group relative block overflow-hidden"
      style={{ backgroundColor: project.color, color: project.ink }}
      data-cursor={openLabel(project)}
      data-cursor-icon={project.locked ? 'lock' : 'arrow'}
      data-cursor-bg={project.ink}
      data-cursor-fg={project.color}
    >
      <div className="relative z-10 flex min-h-[64svh] flex-col justify-between px-5 py-10 md:px-10 md:py-12">
        <p className="inline-flex items-center gap-2 text-[15px] font-semibold">
          Next project <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
          {project.locked && <NdaPill />}
        </p>
        <p className="display-wide text-[clamp(2.75rem,6vw,6rem)] md:max-w-[48%]">{project.name}</p>
      </div>
      <img
        aria-hidden="true"
        src={project.cover.src}
        alt=""
        width={project.cover.width}
        height={project.cover.height}
        loading="lazy"
        decoding="async"
        className={cn('pointer-events-none absolute right-10 top-1/2 hidden h-auto max-h-[80%] w-auto max-w-[42%] -translate-y-1/2 transition-transform duration-1000 ease-expo group-hover:-translate-y-[53%] group-hover:scale-[1.03] md:block', screen)}
      />
    </Link>
  )
}

export function ImageViewer({ shot, onClose }: { shot: Shot | null; onClose: () => void }) {
  const viewer = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = viewer.current
    if (!dialog || !shot) return
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      html.style.overflow = overflow
      if (dialog.open) dialog.close()
    }
  }, [shot])

  return (
    <dialog
      ref={viewer}
      aria-label={shot?.alt}
      data-lenis-prevent
      onClose={onClose}
      onClick={() => viewer.current?.close()}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        viewer.current?.close()
      }}
      className="m-auto max-h-none max-w-none cursor-zoom-out bg-transparent p-0 backdrop:bg-black/85"
    >
      {shot && (
        <>
          <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} className="block h-auto max-h-[calc(100svh-5rem)] w-auto max-w-[calc(100vw-2.5rem)] rounded-lg" />
          <button type="button" autoFocus className="fixed right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-black">
            <X aria-hidden="true" className="size-4" strokeWidth={2.5} /> Close
          </button>
        </>
      )}
    </dialog>
  )
}

export type StudyLabels = { problem: string; decisions: string; steering: string; result: string; partners: string; takeaway: string }

// The reading order both templates share: lead, problem, insight, decisions, result, partners and takeaway.
// Each top-level section carries data-study-section so a page can build its own navigation from them.
export function StudySections({ project, study, labels, onZoom }: { project: Project; study: CaseStudy; labels: StudyLabels; onZoom: (shot: Shot) => void }) {
  return (
    <>
      <p className="project-block max-w-[30ch] text-[clamp(1.5rem,2.4vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]">{project.description}</p>

      <section data-study-section="problem" className="project-block mt-20" aria-labelledby="problem-title">
        <h2 id="problem-title" tabIndex={-1} className={cn(heading, 'outline-none')}>{labels.problem}</h2>
        <p className={body}>{study.problem.body}</p>
        {study.problem.stats && <Stats metrics={study.problem.stats} className="mt-8" />}
        {study.problem.quote && <Blockquote quote={study.problem.quote} />}
      </section>

      <p className="project-block mt-20 max-w-[22ch] text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-primary [font-stretch:110%]">{study.insight}</p>
      {study.contrast && <Contrast groups={study.contrast} />}

      <section data-study-section="decisions" className="mt-20" aria-labelledby="decisions-title">
        <h2 id="decisions-title" tabIndex={-1} className={cn('project-block outline-none', heading)}>{labels.decisions}</h2>
        <ol>
          {study.decisions.map((decision, index) => (
            <li key={decision.title} className="project-block mt-10 border-t border-border pt-8">
              <p className="text-[15px] font-semibold text-muted-foreground tabular">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 max-w-[30ch] text-[clamp(1.35rem,1.9vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] [font-stretch:106%]">{decision.title}</h3>
              <p className={body}>{decision.body}</p>
              {decision.flows && <Flows flows={decision.flows} />}
              {decision.compare && decision.shots.length === 2
                ? <Compare before={decision.shots[0]} after={decision.shots[1]} />
                : decision.shots.length > 0 && <Shots shots={decision.shots} onZoom={onZoom} />}
            </li>
          ))}
        </ol>
      </section>

      {study.steering && (
        <section data-study-section="steering" className="mt-20" aria-labelledby="steering-title">
          <h2 id="steering-title" tabIndex={-1} className={cn('project-block outline-none', heading)}>{labels.steering}</h2>
          <ul>
            {study.steering.map((moment) => (
              <li key={moment.title} className="project-block mt-8 border-t border-border pt-7">
                <h3 className="max-w-[34ch] text-[clamp(1.2rem,1.6vw,1.5rem)] font-bold leading-tight tracking-[-0.02em] [font-stretch:106%]">{moment.title}</h3>
                <dl className="mt-5 grid gap-6 sm:grid-cols-2 sm:gap-8">
                  <div>
                    <dt className="flex items-center gap-2 text-[14px] font-semibold text-muted-foreground">
                      <X aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} /> What went wrong
                    </dt>
                    <dd className="mt-2 text-[17px] leading-relaxed">{moment.wrong}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-[14px] font-semibold text-primary">
                      <Check aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} /> The fix
                    </dt>
                    <dd className="mt-2 text-[17px] leading-relaxed">{moment.fix}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section data-study-section="result" className="project-block mt-20" aria-labelledby="result-title">
        <h2 id="result-title" tabIndex={-1} className={cn(heading, 'outline-none')}>{study.result.title ?? labels.result}</h2>
        <p className={body}>{study.result.body}</p>
        {study.result.changes && (
          <ul className="mt-8 grid gap-4 border-y border-border py-7">
            {study.result.changes.map(([from, to]) => (
              <li key={from} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-[17px]">
                <span className="text-muted-foreground">{from}</span>
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                <span className="sr-only"> became </span>
                <span className="font-semibold">{to}</span>
              </li>
            ))}
          </ul>
        )}
        {study.result.shots && <Shots shots={study.result.shots} onZoom={onZoom} />}
        {study.result.note && <p className="mt-8 text-[15px] font-semibold text-muted-foreground">{study.result.note}</p>}
        {study.result.metrics && <Stats metrics={study.result.metrics} className={study.result.note ? 'mt-3' : 'mt-8'} />}
        {study.result.quote && <Blockquote quote={study.result.quote} />}
      </section>

      {study.partners && (
        <section data-study-section="partners" className="project-block mt-20" aria-labelledby="partners-title">
          <h2 id="partners-title" tabIndex={-1} className={cn(heading, 'outline-none')}>{labels.partners}</h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 sm:gap-8">
            {study.partners.map((partner) => (
              <figure key={partner.text} className="border-t border-border pt-6">
                <figcaption><RoleChip role={partner.role} /></figcaption>
                <blockquote className="mt-4 text-[17px] leading-relaxed">“<Marked text={partner.text} highlight={partner.highlight} />”</blockquote>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section data-study-section="takeaway" className="project-block mt-20 border-t border-foreground/80 pt-8" aria-labelledby="takeaway-title">
        <h2 id="takeaway-title" tabIndex={-1} className="text-[15px] font-semibold text-muted-foreground outline-none">{labels.takeaway}</h2>
        <p className="mt-4 max-w-[34ch] text-[clamp(1.4rem,2.1vw,2rem)] font-semibold leading-snug tracking-[-0.015em]">{study.takeaway.line}</p>
        {study.takeaway.body && <p className={body}>{study.takeaway.body}</p>}
      </section>
    </>
  )
}
