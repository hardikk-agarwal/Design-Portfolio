import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP, motionOk } from '@/lib/gsap'
import { Link, useNavigation } from '@/lib/navigation'
import { aiProjects, type CaseStudy, type Project, type Shot } from '@/lib/content'
import { projectHash } from '@/lib/routes.js'
import { PageTitle } from '@/components/page-title'
import { WatchFilm } from '@/components/film-player'
import { Byline, ImageViewer, NextProject, Stats, StackList, StudySections, screen } from '@/components/study'
import { ProjectStage } from '@/components/stage'
import { cn } from '@/lib/utils'

// An AI project is written up in full on its page; there is no longer version elsewhere.
const labels = { problem: 'The problem', decisions: 'What I decided', steering: 'Steering the AI', result: 'What happened', partners: 'From the team', takeaway: 'What I learned' }

function LiveLink({ live, className }: { live: NonNullable<CaseStudy['live']>; className?: string }) {
  return (
    <a href={live.href} target="_blank" rel="noreferrer" className={cn('inline-flex h-12 items-center gap-2 rounded-full border border-current px-6 text-[15px] font-semibold transition-transform focus-visible:outline-current active:scale-[0.97]', className)}>
      {live.label} <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

export function BuildPage({ project, study, filmLink }: { project: Project; study: CaseStudy; filmLink: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [zoom, setZoom] = useState<Shot | null>(null)
  const [active, setActive] = useState(0)
  const { scrollTo } = useNavigation()
  const next = aiProjects[(aiProjects.indexOf(project) + 1) % aiProjects.length]
  const cover = study.cover ?? project.cover
  const contents: [string, string][] = [
    ['problem', labels.problem],
    ['decisions', labels.decisions],
    ...(study.steering ? [['steering', labels.steering] as [string, string]] : []),
    ['result', study.result.title ?? labels.result],
    ...(study.partners ? [['partners', labels.partners] as [string, string]] : []),
    ['takeaway', labels.takeaway],
  ]
  const facts: [string, ReactNode, boolean?][] = [
    ['Status', project.status],
    ['My role', project.role],
    ['Timeline', project.timeline],
    ['Team', project.team],
    ['Scope', project.scope, true],
    ['Built with', project.stack && <StackList stack={project.stack} label="Built with" className="mt-1.5" />, true],
  ]

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q('.project-progress'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: q('.project-body')[0], start: 'top top', end: 'bottom bottom', scrub: true } })
    q('[data-study-section]').forEach((section, index) => {
      ScrollTrigger.create({ trigger: section, start: 'top 45%', end: 'bottom 45%', onToggle: (self) => { if (self.isActive) setActive(index) } })
    })
    gsap.matchMedia().add(motionOk, () => {
      gsap.from(q('.build-shot'), { y: 90, scale: 0.94, opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.35 })
      q('.project-block').forEach((block) => {
        gsap.from(block, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 86%', toggleActions: 'play none none reverse' } })
      })
      q('.flows').forEach((flows) => {
        gsap.from(flows.querySelectorAll('.flow-step'), { opacity: 0, x: -12, duration: 0.45, ease: 'power2.out', stagger: 0.05, scrollTrigger: { trigger: flows, start: 'top 80%', toggleActions: 'play none none reverse' } })
      })
    })
  }, { scope: root, dependencies: [project.id] })

  function jump(id: string) {
    const section = root.current?.querySelector<HTMLElement>(`[data-study-section="${id}"]`)
    if (!section) return
    // A section still waiting for its reveal sits lower by its tween offset.
    const offset = Number(gsap.getProperty(section, 'y')) || 0
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 72
    scrollTo(section.getBoundingClientRect().top + window.scrollY - offset - header - 32)
    section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }

  return (
    <article ref={root} aria-labelledby="page-title">
      <div aria-hidden="true" className="project-progress pointer-events-none fixed inset-x-0 top-[var(--header-height)] z-40 h-[3px] origin-left scale-x-0" style={{ backgroundColor: project.color }} />

      <header style={{ color: project.ink, '--band': project.color } as CSSProperties}>
        <div className="px-5 pt-[calc(var(--header-height)+1.75rem)] md:px-10" style={{ backgroundColor: project.color }}>
          <Link to="#ai" className="inline-flex w-fit items-center gap-2 rounded-full py-2 text-[15px] font-semibold hover:underline">
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} /> Built with AI
          </Link>
          <div className="mx-auto flex max-w-[64rem] flex-col items-center pb-[clamp(2.5rem,6vh,4rem)] pt-6 text-center md:pt-2">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <p className="text-[15px] font-medium">{project.category}</p>
              {project.status && <p className="rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">{project.status}</p>}
            </div>
            <PageTitle className="mt-5 text-[clamp(2.75rem,6vw,6rem)] leading-[0.88]">{project.name}</PageTitle>
            <p className="mt-6 max-w-[26ch] text-[clamp(1.35rem,2.1vw,2.1rem)] font-semibold leading-tight tracking-[-0.02em]">{project.headline}</p>
            <p className="mt-4 max-w-[54ch] text-[17px] leading-relaxed">{project.summary}</p>
            <Byline project={project} className="mt-5" />
            {(study.film || study.live) && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                {study.film && (
                  <WatchFilm
                    film={study.film}
                    name={project.name}
                    glyph={project.ink}
                    autoOpen={filmLink}
                    // A shared film link opens once; afterwards the address is the project's.
                    onClose={() => { if (filmLink) window.history.replaceState(window.history.state, '', projectHash(project.id)) }}
                    style={{ backgroundColor: project.ink, color: project.color }}
                  />
                )}
                {study.live && <LiveLink live={study.live} />}
              </div>
            )}
          </div>
        </div>
        {/* The shot straddles the project's colour and the page, like a product on a stage. */}
        {study.stage ? (
          <ProjectStage stage={study.stage} />
        ) : (
          <div className="px-5 md:px-10" style={{ backgroundImage: 'linear-gradient(var(--band) 50%, transparent 50%)' }}>
            <figure className="build-shot mx-auto" style={{ width: `min(100%, 72rem, calc((100svh - var(--header-height) - 4rem) * ${cover.width / cover.height}))` }}>
              <img
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                decoding="async"
                style={{ aspectRatio: `${cover.width} / ${cover.height}` } as CSSProperties}
                className={cn('block h-auto w-full', screen)}
              />
            </figure>
          </div>
        )}
      </header>

      <div className="project-body px-5 md:px-10">
        <div className="mx-auto max-w-[72rem]">
          <dl className="project-block mt-[clamp(3rem,8vh,5rem)] grid gap-x-8 gap-y-6 border-t border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
            {facts.filter(([, value]) => value).map(([term, value, wide]) => (
              <div key={term} className={cn(wide && 'sm:col-span-2')}>
                <dt className="text-[14px] font-medium text-muted-foreground">{term}</dt>
                <dd className="mt-1 text-[17px] font-semibold leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
          <Stats metrics={project.metrics} className="project-block" />

          <div className="grid gap-12 py-[clamp(4rem,10vh,7rem)] md:grid-cols-12 md:gap-8">
            <nav aria-label="On this page" className="hidden md:sticky md:top-[calc(var(--header-height)+2rem)] md:col-span-3 md:block md:self-start">
              <p className="text-[14px] font-medium text-muted-foreground">On this page</p>
              <ol className="mt-3 grid">
                {contents.map(([id, label], index) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => jump(id)}
                      aria-current={active === index ? 'location' : undefined}
                      className={cn('inline-flex items-center gap-2.5 py-1.5 text-left text-[16px] font-semibold transition-colors duration-300', active === index ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                    >
                      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full bg-primary transition-transform duration-300 ease-expo', active === index ? 'scale-100' : 'scale-0')} />
                      {label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="md:col-span-8 md:col-start-5">
              <StudySections project={project} study={study} labels={labels} onZoom={setZoom} />
              {study.live && (
                <section className="project-block mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[20px] p-6 md:p-8" style={{ backgroundColor: project.color, color: project.ink }} aria-labelledby="live-title">
                  <h2 id="live-title" className="text-[clamp(1.35rem,1.9vw,1.9rem)] font-bold leading-tight tracking-[-0.02em] [font-stretch:106%]">Try it yourself</h2>
                  <LiveLink live={study.live} />
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <NextProject project={next} />
      <ImageViewer shot={zoom} onClose={() => setZoom(null)} />
    </article>
  )
}
