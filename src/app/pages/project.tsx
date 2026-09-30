import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Lock, X } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP, motionOk } from '@/lib/gsap'
import { Link } from '@/lib/navigation'
import { email, projectById, projects, type CaseStudy, type Flow, type Metric, type Project, type Quote, type Shot } from '@/lib/content'
import { isSealed, isSecure, openedStudy, unlockStudy } from '@/lib/protected'
import type { ProjectId } from '@/lib/routes.js'
import { PageTitle } from '@/components/page-title'
import { MetricValue } from '@/sections/work'
import { cn } from '@/lib/utils'

const screen = 'rounded-xl ring-1 ring-black/10 shadow-[0_32px_64px_-32px_rgb(0_0_0/0.5)]'
const heading = 'text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold tracking-[-0.025em] [font-stretch:108%]'
const body = 'mt-4 max-w-[62ch] text-[18px] leading-relaxed'
const statColumns: Record<number, string> = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2' }

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

function Flows({ flows }: { flows: Flow[] }) {
  return (
    <div className="mt-8 grid gap-7 rounded-xl border border-border p-5 md:p-7">
      {flows.map((flow, index) => {
        const lead = index === flows.length - 1
        return (
          <div key={flow.label}>
            <p className="text-[14px] font-medium text-muted-foreground">{flow.label}</p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2.5">
              {flow.steps.map((step, stepIndex) => (
                <li key={step} className="flex items-center gap-2">
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

function Stats({ metrics, className }: { metrics: Metric[]; className?: string }) {
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

function NextProject({ project }: { project: Project }) {
  return (
    <Link to={`#work/${project.id}`} className="group relative block overflow-hidden" style={{ backgroundColor: project.color, color: project.ink }}>
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

function NdaPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">
      <Lock aria-hidden="true" className="size-3.5" strokeWidth={2.25} /> Under NDA
    </span>
  )
}

function Byline({ project }: { project: Project }) {
  const parts = [project.role, project.organization, project.timeline].filter(Boolean)
  return (
    <p className="mt-4 text-[15px] font-medium">
      {parts.map((part, index) => (
        <Fragment key={part}>
          {index > 0 && <><span aria-hidden="true" className="px-2">·</span><span className="sr-only">, </span></>}
          {part}
        </Fragment>
      ))}
    </p>
  )
}

function CaseStudyPage({ project, study }: { project: Project; study: CaseStudy }) {
  const root = useRef<HTMLElement>(null)
  const viewer = useRef<HTMLDialogElement>(null)
  const [zoom, setZoom] = useState<Shot | null>(null)
  const next = projects[(projects.indexOf(project) + 1) % projects.length]
  const cover = study.cover ?? project.cover

  useEffect(() => {
    const dialog = viewer.current
    if (!dialog || !zoom) return
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      html.style.overflow = overflow
      if (dialog.open) dialog.close()
    }
  }, [zoom])

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()
    mm.add(motionOk, () => {
      gsap.from(q('.project-art-wrap'), { yPercent: 12, scale: 0.92, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.35 })
      gsap.to(q('.project-art'), { yPercent: -10, ease: 'none', scrollTrigger: { trigger: q('.project-hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
      q('.project-block').forEach((block) => {
        gsap.from(block, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 86%', toggleActions: 'play none none reverse' } })
      })
    })
  }, { scope: root, dependencies: [project.id] })

  return (
    <article ref={root} aria-labelledby="page-title">
      <header className="project-hero relative overflow-hidden" style={{ backgroundColor: project.color, color: project.ink }}>
        <div className="relative flex min-h-[92svh] flex-col px-5 pb-10 pt-[calc(var(--header-height)+1.75rem)] md:px-10 md:pb-12">
          <Link to="#work" className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full py-2 text-[15px] font-semibold hover:underline">
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} /> All work
          </Link>
          <figure className="project-art-wrap relative mt-6 md:absolute md:inset-y-0 md:right-0 md:mt-0 md:flex md:w-[54%] md:items-center md:justify-center md:pr-10 md:pt-[var(--header-height)]">
            <img
              src={cover.src}
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              decoding="async"
              className={cn('project-art h-auto w-full md:max-h-[calc(92svh-var(--header-height)-6rem)] md:w-auto md:max-w-full', screen)}
            />
          </figure>
          <div className="relative z-10 mt-auto pt-8 md:w-[42%]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-[15px] font-medium">{project.category}</p>
              {project.status && <p className="rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">{project.status}</p>}
            </div>
            <PageTitle className="mt-4 text-[clamp(2.75rem,5.4vw,6rem)] leading-[0.88]">{project.name}</PageTitle>
            <p className="mt-5 max-w-[22ch] text-[clamp(1.35rem,2.1vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em]">{project.headline}</p>
            <Byline project={project} />
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col-reverse justify-end gap-1.5">
                  <dt className="max-w-[22ch] text-[14px] font-medium leading-snug">{metric.label}</dt>
                  <dd className="whitespace-nowrap text-[clamp(1.5rem,2.2vw,2.4rem)] font-bold leading-none tracking-[-0.035em] [font-stretch:106%] tabular">
                    <MetricValue value={metric.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      <div className="grid gap-12 px-5 py-[clamp(4rem,12vh,8rem)] md:grid-cols-12 md:gap-8 md:px-10">
        <dl className="project-block grid content-start gap-7 md:sticky md:top-[calc(var(--header-height)+2rem)] md:col-span-3 md:self-start">
          {[
            ['My role', project.role],
            ['Team', project.team],
            ['Timeline', project.timeline],
            ['Status', project.status],
            ['Scope', project.scope],
          ].filter(([, value]) => value).map(([term, value]) => (
            <div key={term}>
              <dt className="text-[14px] font-medium text-muted-foreground">{term}</dt>
              <dd className="mt-1 text-[17px] font-semibold leading-snug">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="md:col-span-8 md:col-start-5">
          <p className="project-block max-w-[30ch] text-[clamp(1.5rem,2.4vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]">{project.description}</p>

          <section className="project-block mt-20" aria-labelledby="problem-title">
            <h2 id="problem-title" className={heading}>The problem</h2>
            <p className={body}>{study.problem.body}</p>
            <Stats metrics={study.problem.stats} className="mt-8" />
            {study.problem.quote && <Blockquote quote={study.problem.quote} />}
          </section>

          <p className="project-block mt-20 max-w-[22ch] text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-primary [font-stretch:110%]">{study.insight}</p>
          {study.contrast && <Contrast groups={study.contrast} />}

          <section className="mt-20" aria-labelledby="decisions-title">
            <h2 id="decisions-title" className={cn('project-block', heading)}>Key decisions</h2>
            <ol>
              {study.decisions.map((decision, index) => (
                <li key={decision.title} className="project-block mt-10 border-t border-border pt-8">
                  <p className="text-[15px] font-semibold text-muted-foreground tabular">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 max-w-[30ch] text-[clamp(1.35rem,1.9vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] [font-stretch:106%]">{decision.title}</h3>
                  <p className={body}>{decision.body}</p>
                  {decision.flows && <Flows flows={decision.flows} />}
                  {decision.shots.length > 0 && <Shots shots={decision.shots} onZoom={setZoom} />}
                </li>
              ))}
            </ol>
          </section>

          <section className="project-block mt-20" aria-labelledby="result-title">
            <h2 id="result-title" className={heading}>{study.result.title ?? 'The result'}</h2>
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
            {study.result.shots && <Shots shots={study.result.shots} onZoom={setZoom} />}
            {study.result.note && <p className="mt-8 text-[15px] font-semibold text-muted-foreground">{study.result.note}</p>}
            {study.result.metrics && <Stats metrics={study.result.metrics} className={study.result.note ? 'mt-3' : 'mt-8'} />}
            {study.result.quote && <Blockquote quote={study.result.quote} />}
          </section>

          <section className="project-block mt-20 border-t border-foreground/80 pt-8" aria-labelledby="takeaway-title">
            <h2 id="takeaway-title" className="text-[15px] font-semibold text-muted-foreground">What I took from it</h2>
            <p className="mt-4 max-w-[34ch] text-[clamp(1.4rem,2.1vw,2rem)] font-semibold leading-snug tracking-[-0.015em]">{study.takeaway.line}</p>
            {study.takeaway.body && <p className={body}>{study.takeaway.body}</p>}
          </section>
        </div>
      </div>

      <NextProject project={next} />

      <dialog
        ref={viewer}
        aria-label={zoom?.alt}
        data-lenis-prevent
        onClose={() => setZoom(null)}
        onClick={() => viewer.current?.close()}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          event.preventDefault()
          viewer.current?.close()
        }}
        className="m-auto max-h-none max-w-none cursor-zoom-out bg-transparent p-0 backdrop:bg-black/85"
      >
        {zoom && (
          <>
            <img src={zoom.src} alt={zoom.alt} width={zoom.width} height={zoom.height} className="block h-auto max-h-[calc(100svh-5rem)] w-auto max-w-[calc(100vw-2.5rem)] rounded-lg" />
            <button type="button" autoFocus className="fixed right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-black">
              <X aria-hidden="true" className="size-4" strokeWidth={2.5} /> Close
            </button>
          </>
        )}
      </dialog>
    </article>
  )
}

function ProjectGate({ project, onUnlock }: { project: Project; onUnlock: () => void }) {
  const root = useRef<HTMLElement>(null)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'wrong'>('idle')
  const request = `mailto:${email}?subject=${encodeURIComponent(`Password for the ${project.name} case study`)}`
  const message = !isSecure
    ? 'Unlocking needs a secure connection. Open this page with https.'
    : status === 'wrong' ? "That password didn't work. Check it and try again." : status === 'checking' ? 'Unlocking…' : ''

  useGSAP(() => {
    gsap.matchMedia().add(motionOk, () => {
      gsap.from('.gate-panel', { y: 48, opacity: 0, duration: 1.3, ease: 'expo.out', delay: 0.35 })
    })
  }, { scope: root })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = password.trim()
    if (!value || status === 'checking' || !isSecure) return
    setStatus('checking')
    try {
      await unlockStudy(project.id, value)
      onUnlock()
    } catch {
      setStatus('wrong')
    }
  }

  return (
    <article ref={root} aria-labelledby="page-title" style={{ backgroundColor: project.color, color: project.ink }}>
      <div className="flex min-h-[100svh] flex-col px-5 pb-10 pt-[calc(var(--header-height)+1.75rem)] md:px-10 md:pb-12">
        <Link to="#work" className="inline-flex w-fit items-center gap-2 rounded-full py-2 text-[15px] font-semibold hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} /> All work
        </Link>
        <div className="mt-auto grid gap-12 pt-12 md:grid-cols-12 md:items-end md:gap-8">
          <div className="md:col-span-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-[15px] font-medium">{project.category}</p>
              <NdaPill />
            </div>
            <PageTitle className="mt-4 text-[clamp(2.75rem,5.4vw,6rem)] leading-[0.88]">{project.name}</PageTitle>
            <p className="mt-5 max-w-[22ch] text-[clamp(1.35rem,2.1vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em]">{project.headline}</p>
            <Byline project={project} />
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed">{project.description}</p>
          </div>

          <section aria-labelledby="gate-title" className="gate-panel rounded-[24px] p-6 md:col-span-5 md:col-start-8 md:p-8" style={{ backgroundColor: project.ink, color: project.color }}>
            <Lock aria-hidden="true" className="size-7" strokeWidth={1.75} />
            <h2 id="gate-title" className="mt-5 text-[clamp(1.5rem,2vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] [font-stretch:106%]">This case study is under NDA</h2>
            <p className="mt-3 text-[16px] leading-relaxed">
              This work isn't public yet, and I honor the non-disclosure agreement that covers it. The full case study is password protected.
            </p>
            <form onSubmit={submit} className="mt-7">
              <label htmlFor="case-study-password" className="text-[14px] font-semibold">Password</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  id="case-study-password"
                  type="password"
                  autoComplete="current-password"
                  spellCheck={false}
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (status === 'wrong') setStatus('idle')
                  }}
                  aria-invalid={status === 'wrong'}
                  aria-describedby="case-study-password-status"
                  className="h-12 min-w-0 flex-1 basis-48 rounded-full border border-current/40 bg-transparent px-5 text-[17px] focus-visible:border-current focus-visible:outline-current"
                />
                <button
                  type="submit"
                  disabled={status === 'checking' || !isSecure}
                  className="h-12 rounded-full px-6 text-[15px] font-semibold transition-transform focus-visible:outline-current active:scale-[0.97] disabled:opacity-70"
                  style={{ backgroundColor: project.color, color: project.ink }}
                >
                  Unlock
                </button>
              </div>
              <p id="case-study-password-status" role="status" className="mt-3 min-h-6 text-[14px] font-medium">{message}</p>
            </form>
            <p className="mt-2 border-t border-current/20 pt-5 text-[15px] leading-relaxed">
              Need the password? Email <a href={request} className="font-semibold underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-current">{email}</a> and I'll share it.
            </p>
            {!isSealed && import.meta.env.DEV && <p className="mt-3 text-[13px]">Development: add CASE_STUDY_PASSWORD to .env.local, then run npm run seal.</p>}
          </section>
        </div>
      </div>
    </article>
  )
}

export function ProjectPage({ id }: { id: ProjectId }) {
  const project = projectById(id)
  const [unlocks, setUnlocks] = useState(0)
  const study = project.locked ? openedStudy(id) : project

  useEffect(() => {
    if (!unlocks) return
    ScrollTrigger.refresh()
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [unlocks])

  if (study) return <CaseStudyPage project={project} study={study} />
  return <ProjectGate project={project} onUnlock={() => setUnlocks((count) => count + 1)} />
}
