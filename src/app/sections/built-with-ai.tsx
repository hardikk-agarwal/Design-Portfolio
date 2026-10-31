import { useRef, useState } from 'react'
import { ArrowUpRight, Lock } from 'lucide-react'
import { gsap, useGSAP, motionOk } from '@/lib/gsap'
import { Link } from '@/lib/navigation'
import { projectHash } from '@/lib/routes.js'
import { aiProjects, type Project } from '@/lib/content'
import { ProjectTile, openLabel } from '@/components/study'
import { MetricValue } from '@/sections/work'
import { cn } from '@/lib/utils'

function Row({ project, dimmed, onActivate }: { project: Project; dimmed: boolean; onActivate: () => void }) {
  const [metric] = project.metrics
  return (
    <li className="ai-row border-b border-border">
      <Link
        to={projectHash(project.id)}
        onPointerEnter={onActivate}
        onFocus={onActivate}
        className={cn(
          'group grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-5 gap-y-4 py-6 transition-opacity duration-500 sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,12rem)] md:py-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,13rem)] lg:gap-x-8',
          dimmed && 'lg:opacity-40',
        )}
        data-cursor={openLabel(project)}
        data-cursor-icon={project.locked ? 'lock' : 'arrow'}
        data-cursor-bg={project.color}
        data-cursor-fg={project.ink}
      >
        <ProjectTile project={project} className="lg:hidden" />
        <div className="flex min-w-0 flex-col">
          <h3 className="display mt-2 text-[clamp(1.75rem,3.2vw,3.25rem)] transition-transform duration-500 ease-expo motion-safe:lg:group-hover:translate-x-2">{project.name}</h3>
          <p className="mt-2 text-[16px] leading-snug text-muted-foreground md:text-[17px]">{project.headline}</p>
          {/* Read after the name, shown above it. */}
          <p className="order-first flex flex-wrap items-center gap-x-2 text-[14px] font-medium text-muted-foreground">
            <span aria-hidden="true" className="hidden size-2.5 rounded-full ring-1 ring-black/15 lg:inline-block" style={{ backgroundColor: project.color }} />
            {project.timeline}
            {project.status && <><span aria-hidden="true">·</span><span className="sr-only">,</span>{project.status}</>}
            {project.locked && <Lock role="img" aria-label="Under NDA" className="size-3.5" strokeWidth={2.25} />}
          </p>
        </div>
        <p className="col-start-2 flex flex-col gap-1 sm:col-start-auto sm:text-right">
          <span className="text-[clamp(1.35rem,2vw,2rem)] font-bold leading-none tracking-[-0.03em] [font-stretch:106%] tabular"><MetricValue value={metric.value} /></span>
          <span className="text-[13px] font-medium leading-snug text-muted-foreground">{metric.label}</span>
        </p>
      </Link>
    </li>
  )
}

export function BuiltWithAI() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [engaged, setEngaged] = useState(false)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.matchMedia().add(motionOk, () => {
      gsap.from(q('.ai-row'), { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: q('.ai-list')[0], start: 'top 82%', toggleActions: 'play none none reverse' } })
      gsap.from(q('.ai-preview'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: q('.ai-list')[0], start: 'top 82%', toggleActions: 'play none none reverse' } })
    })
  }, { scope: root })

  if (!aiProjects.length) return null
  return (
    <section ref={root} id="built-with-ai" aria-labelledby="built-with-ai-title" className="px-5 py-[clamp(6rem,16vh,11rem)] md:px-10">
      <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-8">
        <h2 id="built-with-ai-title" className="display text-[clamp(2.75rem,5.4vw,5.75rem)] md:col-span-7">Built with AI.</h2>
        <div className="md:col-span-4 md:col-start-9">
          <p className="max-w-[38ch] text-[17px] leading-relaxed text-muted-foreground">Apps, tools and prototypes for people who use Windows and the teams who design it, built in 2026 with GitHub Copilot and Claude Opus in VS Code.</p>
          <Link to="#ai" className="mt-5 inline-flex items-center gap-1.5 text-[17px] font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2">
            See them in detail <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="mt-[clamp(3rem,8vh,5rem)] grid gap-10 lg:grid-cols-12 lg:gap-8">
        <ol
          aria-label="Projects built with AI"
          className="ai-list border-t border-border lg:col-span-7"
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
          onFocus={() => setEngaged(true)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEngaged(false) }}
        >
          {aiProjects.map((project, index) => (
            <Row key={project.id} project={project} dimmed={engaged && active !== index} onActivate={() => setActive(index)} />
          ))}
        </ol>

        {/* On large screens one preview follows the pointer and keyboard focus down the list. */}
        <div aria-hidden="true" className="ai-preview hidden lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--header-height)+2rem)] aspect-[5/4] overflow-hidden rounded-[24px]">
            {aiProjects.map((project, index) => (
              <div
                key={project.id}
                className={cn('absolute inset-0 flex items-center justify-center p-[8%] transition-[opacity,scale] duration-700 ease-expo motion-reduce:transition-none', index === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0')}
                style={{ backgroundColor: project.color }}
              >
                <img
                  src={project.cover.src}
                  alt=""
                  width={project.cover.width}
                  height={project.cover.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto max-h-full w-auto max-w-full rounded-lg shadow-[0_24px_48px_-20px_rgb(0_0_0/0.5)]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
