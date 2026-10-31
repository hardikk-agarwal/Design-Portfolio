import { useRef } from 'react'
import { ArrowUpRight, Lock } from 'lucide-react'
import { gsap, useGSAP, motionOk } from '@/lib/gsap'
import { Link } from '@/lib/navigation'
import { projectHash } from '@/lib/routes.js'
import { aiProjects, type Project } from '@/lib/content'
import { responsive } from '@/lib/images'
import { PageTitle } from '@/components/page-title'
import { WatchFilm } from '@/components/film-player'
import { NdaPill, StackList, openLabel } from '@/components/study'
import { MetricValue } from '@/sections/work'
import { cn } from '@/lib/utils'

function AiEntry({ project, flip }: { project: Project; flip: boolean }) {
  const film = project.locked ? undefined : project.film
  const label = openLabel(project)
  return (
    <li
      className="ai-entry group relative grid gap-8 border-t border-border py-10 md:grid-cols-12 md:gap-10 md:py-14"
      data-cursor={label}
      data-cursor-icon={project.locked ? 'lock' : 'arrow'}
      data-cursor-bg={project.color}
      data-cursor-fg={project.ink}
    >
      <div className={cn('flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[20px] p-[6%] md:col-span-7', flip && 'md:order-last')} style={{ backgroundColor: project.color }}>
        <img
          src={project.cover.src}
          {...responsive(project.cover, '(min-width: 768px) 58vw, 100vw')}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          decoding="async"
          className="h-auto max-h-full w-auto max-w-full rounded-lg shadow-[0_24px_48px_-20px_rgb(0_0_0/0.5)] transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col md:col-span-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] font-medium text-muted-foreground">
          {project.timeline}
          {project.status && <span className="rounded-full border border-current px-2.5 py-0.5 text-[13px] font-semibold">{project.status}</span>}
          {project.locked && <NdaPill />}
        </p>
        <h2 className="display mt-4 text-[clamp(2.25rem,4vw,4.25rem)]">
          <Link to={projectHash(project.id)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[20px] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring">
            {project.name}
          </Link>
        </h2>
        <p className="mt-3 text-[clamp(1.2rem,1.6vw,1.5rem)] font-semibold leading-snug tracking-[-0.01em]">{project.headline}</p>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed">{project.summary}</p>
        {project.stack && (
          <div className="mt-6">
            <p className="text-[14px] font-medium text-muted-foreground">Built with</p>
            <StackList stack={project.stack} label="Built with" className="mt-2" />
          </div>
        )}
        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
          {project.metrics.slice(0, 2).map((metric) => (
            <div key={metric.label} className="flex flex-col-reverse justify-end gap-1.5">
              <dt className="text-[14px] font-medium leading-snug text-muted-foreground">{metric.label}</dt>
              <dd className="text-[clamp(1.5rem,2.2vw,2.2rem)] font-bold leading-none tracking-[-0.03em] [font-stretch:106%] tabular"><MetricValue value={metric.value} /></dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-auto md:pt-8">
          <span className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold" style={{ backgroundColor: project.color, color: project.ink }}>
            {label} {project.locked ? <Lock aria-hidden="true" className="size-4" strokeWidth={2} /> : <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />}
          </span>
          {film && <WatchFilm film={film} name={project.name} glyph="var(--background)" className="relative z-10 h-12 border border-current py-0" />}
        </div>
      </div>
    </li>
  )
}

export function AiPage() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.matchMedia().add(motionOk, () => {
      gsap.utils.selector(root)('.ai-entry').forEach((entry) => {
        gsap.from(entry, { y: 70, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: entry, start: 'top 88%', toggleActions: 'play none none reverse' } })
      })
    })
  }, { scope: root })

  return (
    <div ref={root}>
      <section className="px-5 pb-[clamp(3rem,8vh,6rem)] pt-[calc(var(--header-height)+clamp(3rem,12vh,8rem))] md:px-10">
        <PageTitle className="text-[clamp(3.5rem,11.5vw,12.5rem)] leading-[0.82]">Built with AI</PageTitle>
        <div className="mt-10 grid gap-6 md:grid-cols-12 md:gap-8">
          <p className="max-w-[40ch] text-[clamp(1.2rem,1.7vw,1.6rem)] leading-snug md:col-span-6">
            Apps, tools and prototypes for people who use Windows and the teams who design it, built in 2026 with GitHub Copilot and Claude Opus in VS Code.
          </p>
          <p className="max-w-[44ch] text-[17px] leading-relaxed text-muted-foreground md:col-span-5 md:col-start-8">
            AI got me to a first working version fast. It was weaker at context, edge states, platform rules and knowing when a difference was intentional, so each page also shows where I had to steer it.
          </p>
        </div>
      </section>
      <ol aria-label="Projects built with AI" className="px-5 pb-[clamp(5rem,14vh,10rem)] md:px-10">
        {aiProjects.map((project, index) => <AiEntry key={project.id} project={project} flip={index % 2 === 1} />)}
      </ol>
    </div>
  )
}
