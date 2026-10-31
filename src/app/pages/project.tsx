import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { ArrowLeft, ArrowUpRight, Lock } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP, motionOk } from '@/lib/gsap'
import { Link } from '@/lib/navigation'
import { email, projectById, workProjects, type CaseStudy, type Project, type Shot } from '@/lib/content'
import { responsive } from '@/lib/images'
import { isSealed, isSecure, openedStudy, preloadSealed, unlockStudy } from '@/lib/protected'
import { projectHash, type ProjectId } from '@/lib/routes.js'
import { PageTitle } from '@/components/page-title'
import { WatchFilm } from '@/components/film-player'
import { Byline, HeroMetrics, ImageViewer, NdaPill, NextProject, StackList, StudySections, screen } from '@/components/study'
import { BuildPage } from '@/pages/build'
import { cn } from '@/lib/utils'

const caseStudyLabels = { problem: 'The problem', decisions: 'Key decisions', steering: 'Steering the AI', result: 'The result', partners: 'From the team', takeaway: 'What I took from it' }

function CaseStudyPage({ project, study, filmLink }: { project: Project; study: CaseStudy; filmLink: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [zoom, setZoom] = useState<Shot | null>(null)
  const next = workProjects[(workProjects.indexOf(project) + 1) % workProjects.length]
  const cover = study.cover ?? project.cover

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q('.project-progress'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: q('.project-body')[0], start: 'top top', end: 'bottom bottom', scrub: true } })
    const mm = gsap.matchMedia()
    mm.add(motionOk, () => {
      gsap.from(q('.project-art-wrap'), { yPercent: 12, scale: 0.92, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.35 })
      gsap.to(q('.project-art'), { yPercent: -10, ease: 'none', scrollTrigger: { trigger: q('.project-hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
      q('.project-block').forEach((block) => {
        gsap.from(block, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 86%', toggleActions: 'play none none reverse' } })
      })
      // Journeys read step by step, the before path first.
      q('.flows').forEach((flows) => {
        gsap.from(flows.querySelectorAll('.flow-step'), { opacity: 0, x: -12, duration: 0.45, ease: 'power2.out', stagger: 0.05, scrollTrigger: { trigger: flows, start: 'top 80%', toggleActions: 'play none none reverse' } })
      })
    })
  }, { scope: root, dependencies: [project.id] })

  return (
    <article ref={root} aria-labelledby="page-title">
      <div aria-hidden="true" className="project-progress pointer-events-none fixed inset-x-0 top-[var(--header-height)] z-40 h-[3px] origin-left scale-x-0" style={{ backgroundColor: project.color }} />
      <header className="project-hero relative overflow-hidden" style={{ backgroundColor: project.color, color: project.ink }}>
        <div className="relative flex min-h-[92svh] flex-col px-5 pb-10 pt-[calc(var(--header-height)+1.75rem)] md:px-10 md:pb-12">
          <Link to="#work" className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full py-2 text-[15px] font-semibold hover:underline">
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} /> All work
          </Link>
          <figure className="project-art-wrap relative mt-6 md:absolute md:inset-y-0 md:right-0 md:mt-0 md:flex md:w-[54%] md:items-center md:justify-center md:pr-10 md:pt-[var(--header-height)]">
            <img
              src={cover.src}
              {...responsive(cover, '(min-width: 768px) 54vw, 100vw')}
              alt={cover.alt}
              width={cover.width}
              height={cover.height}
              decoding="async"
              // A definite width from the aspect ratio holds the cover's space before it loads.
              style={{ aspectRatio: `${cover.width} / ${cover.height}`, '--ratio': cover.width / cover.height } as CSSProperties}
              className={cn('project-art mx-auto block h-auto w-[min(100%,calc(60svh*var(--ratio)))] md:w-[min(100%,calc((92svh-var(--header-height)-6rem)*var(--ratio)))]', screen)}
            />
          </figure>
          <div className="relative z-10 mt-auto pt-8 md:w-[42%]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-[15px] font-medium">{project.category}</p>
              {project.status && <p className="rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">{project.status}</p>}
              <p className="rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">Short version</p>
            </div>
            <PageTitle className="mt-4 text-[clamp(2.75rem,5.4vw,6rem)] leading-[0.88]">{project.name}</PageTitle>
            <p className="mt-5 max-w-[22ch] text-[clamp(1.35rem,2.1vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em]">{project.headline}</p>
            <Byline project={project} />
            {(study.film || study.live) && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {study.film && (
                  <WatchFilm
                    film={study.film}
                    name={project.name}
                    glyph={project.ink}
                    autoOpen={filmLink}
                    // A shared film link opens once; afterwards the address is the case study's.
                    onClose={() => { if (filmLink) window.history.replaceState(window.history.state, '', projectHash(project.id)) }}
                    style={{ backgroundColor: project.ink, color: project.color }}
                  />
                )}
                {study.live && (
                  <a href={study.live.href} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-current px-6 text-[15px] font-semibold transition-transform focus-visible:outline-current active:scale-[0.97]">
                    {study.live.label} <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            )}
            <HeroMetrics metrics={project.metrics} className="mt-8" />
          </div>
        </div>
      </header>

      <div className="project-body grid gap-12 px-5 py-[clamp(4rem,12vh,8rem)] md:grid-cols-12 md:gap-8 md:px-10">
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
          <StudySections project={project} study={study} labels={caseStudyLabels} onZoom={setZoom} />

          <section className="project-block mt-16 rounded-[20px] border border-border p-6 md:p-8" aria-labelledby="full-title">
            <h2 id="full-title" className="text-[15px] font-semibold text-muted-foreground">This is the short version</h2>
            <p className="mt-3 max-w-[40ch] text-[clamp(1.15rem,1.5vw,1.35rem)] font-semibold leading-snug">The full case study goes deeper into the process and the trade-offs behind each decision. I’m happy to walk you through it.</p>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(`Full case study: ${project.name}`)}`}
              className="mt-5 inline-flex items-center gap-1.5 text-[17px] font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2"
            >
              Ask for the full case study <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </a>
          </section>
        </div>
      </div>

      <NextProject project={next} />
      <ImageViewer shot={zoom} onClose={() => setZoom(null)} />
    </article>
  )
}

function ProjectGate({ project, onUnlock }: { project: Project; onUnlock: () => void }) {
  const root = useRef<HTMLElement>(null)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'wrong' | 'failed'>('idle')
  // AI projects are complete write-ups, not case studies, and go back to their own index.
  const noun = project.tool ? 'project' : 'case study'
  const request = `mailto:${email}?subject=${encodeURIComponent(project.tool ? `Password for ${project.name}` : `Password for the ${project.name} case study`)}`
  const message = !isSecure
    ? 'Unlocking needs a secure connection. Open this page with https.'
    : status === 'wrong' ? "That password didn't work. Check it and try again."
      : status === 'failed' ? `The ${noun} didn't load. Check your connection and try again.`
        : status === 'checking' ? 'Unlocking…' : ''

  useGSAP(() => {
    gsap.matchMedia().add(motionOk, () => {
      gsap.from('.gate-panel', { y: 48, opacity: 0, duration: 1.3, ease: 'expo.out', delay: 0.35 })
    })
  }, { scope: root })

  // Visitors without the password never download the sealed study; reaching for the form starts it.
  const warm = () => preloadSealed(project.id)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = password.trim()
    if (!value || status === 'checking' || !isSecure) return
    setStatus('checking')
    try {
      await unlockStudy(project.id, value)
      onUnlock()
    } catch (error) {
      setStatus(error instanceof DOMException && error.name === 'OperationError' ? 'wrong' : 'failed')
    }
  }

  return (
    <article ref={root} aria-labelledby="page-title" style={{ backgroundColor: project.color, color: project.ink }}>
      <div className="flex min-h-[100svh] flex-col px-5 pb-10 pt-[calc(var(--header-height)+1.75rem)] md:px-10 md:pb-12">
        <Link to={project.tool ? '#ai' : '#work'} className="inline-flex w-fit items-center gap-2 rounded-full py-2 text-[15px] font-semibold hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} /> {project.tool ? 'Built with AI' : 'All work'}
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
            {project.tool && project.stack && <StackList stack={project.stack} label="Built with" className="mt-6" />}
            <HeroMetrics metrics={project.metrics} className="mt-8" />
          </div>

          <section aria-labelledby="gate-title" onPointerEnter={warm} className="gate-panel rounded-[24px] p-6 md:col-span-5 md:col-start-8 md:p-8" style={{ backgroundColor: project.ink, color: project.color }}>
            <Lock aria-hidden="true" className="size-7" strokeWidth={1.75} />
            <h2 id="gate-title" className="mt-5 text-[clamp(1.5rem,2vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] [font-stretch:106%]">This {noun} is under NDA</h2>
            <p className="mt-3 text-[16px] leading-relaxed">
              This work is covered by a non-disclosure agreement, so {project.tool ? 'this page is' : 'the full case study is'} password protected.
            </p>
            <form onSubmit={submit} onFocus={warm} className="mt-7">
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
                    if (status === 'wrong' || status === 'failed') setStatus('idle')
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

export function ProjectPage({ id, film = false }: { id: ProjectId; film?: boolean }) {
  const project = projectById(id)
  const [unlocks, setUnlocks] = useState(0)
  const study = project.locked ? openedStudy(id) : project

  useEffect(() => {
    if (!unlocks) return
    ScrollTrigger.refresh()
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [unlocks])

  if (study) return project.tool
    ? <BuildPage project={project} study={study} filmLink={film} />
    : <CaseStudyPage project={project} study={study} filmLink={film} />
  return <ProjectGate project={project} onUnlock={() => setUnlocks((count) => count + 1)} />
}
