import { useRef } from 'react'
import { Download } from 'lucide-react'
import { gsap, useGSAP, motionOk } from '@/lib/gsap'
import { education, experience, skills } from '@/lib/content'
import { PageTitle } from '@/components/page-title'

export function ResumePage() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()
    mm.add(motionOk, () => {
      q('.resume-block').forEach((block) => {
        gsap.from(block, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 88%', toggleActions: 'play none none reverse' } })
      })
    })
  }, { scope: root })

  return (
    <div ref={root}>
      <section className="px-5 pt-[calc(var(--header-height)+clamp(3rem,12vh,8rem))] md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <PageTitle className="text-[clamp(4rem,15vw,16rem)] leading-[0.8]">Resume</PageTitle>
          <a
            href="./Hardik_Agarwal_Resume.pdf"
            download
            className="inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-7 text-[16px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
          >
            <Download aria-hidden="true" className="size-5" strokeWidth={2} />
            Download PDF
          </a>
        </div>
        <p className="mt-10 max-w-[48ch] text-[clamp(1.2rem,1.7vw,1.6rem)] leading-snug">
          Product designer with 5+ years across AI, platform and consumer products. Rated Outstanding at Microsoft, where I lifted Store developer onboarding from 35% to 73% and cut it from ~15 days to ~1 day. I design end to end and prototype in code with AI.
        </p>
      </section>

      <section aria-labelledby="resume-experience" className="px-5 pt-[clamp(5rem,14vh,9rem)] md:px-10">
        <h2 id="resume-experience" className="resume-block display text-[clamp(2.75rem,5.4vw,5.75rem)]">Experience</h2>
        <div className="mt-10">
          {experience.map((job) => (
            <article key={job.company} className="resume-block grid gap-6 border-t border-border py-10 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-4">
                <h3 className="text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold leading-tight tracking-[-0.03em] [font-stretch:108%]">{job.company}</h3>
                <p className="mt-2 text-[17px] font-semibold">{job.role}</p>
                <p className="mt-1 text-[15px] text-muted-foreground tabular">{job.dates}</p>
              </div>
              <ul className="grid gap-4 md:col-span-7 md:col-start-6">
                {job.highlights.map((highlight) => (
                  <li key={highlight} className="relative max-w-[64ch] pl-6 text-[17px] leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-3 before:bg-primary">
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Skills and education" className="grid gap-14 px-5 py-[clamp(5rem,14vh,9rem)] md:grid-cols-12 md:gap-8 md:px-10">
        <div className="resume-block md:col-span-6">
          <h2 className="text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold tracking-[-0.025em] [font-stretch:108%]">Skills</h2>
          <div className="mt-6 grid gap-7">
            {skills.map(({ group, items }) => (
              <div key={group}>
                <h3 className="text-[15px] font-semibold text-muted-foreground">{group}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {items.map((skill) => <li key={skill} className="rounded-full border border-border px-3.5 py-2 text-[14px] font-medium">{skill}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="resume-block md:col-span-5 md:col-start-8">
          <h2 className="text-[clamp(1.6rem,2.4vw,2.4rem)] font-bold tracking-[-0.025em] [font-stretch:108%]">Education</h2>
          <ul className="mt-6 grid gap-5">
            {education.map((item) => (
              <li key={item.degree}>
                <p className="text-lg font-semibold">{item.degree}</p>
                <p className="text-[16px] text-muted-foreground">{item.school}, {item.dates}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
