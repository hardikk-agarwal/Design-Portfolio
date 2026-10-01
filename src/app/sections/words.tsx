import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP, motionOk } from '@/lib/gsap'
import { endorsements, type Endorsement } from '@/lib/content'
import { cn } from '@/lib/utils'

export function Marked({ text, highlight }: Pick<Endorsement, 'text' | 'highlight'>) {
  const at = highlight ? text.indexOf(highlight) : -1
  if (!highlight || at < 0) return <>{text}</>
  return <>{text.slice(0, at)}<mark className="word-mark">{highlight}</mark>{text.slice(at + highlight.length)}</>
}

// Deeper than the cover's #f0587a: light text on that rose is only 3.3:1.
export function RoleChip({ role }: Pick<Endorsement, 'role'>) {
  return <span className="inline-block rounded-[4px] bg-[#b3244a] px-1.5 py-1 text-[12px] font-semibold leading-none text-[#fff5f7]">{role}</span>
}

const tilts = [-1.1, 1.3, -0.7, 0.9, -1.4, 0.6]
const spans = ['md:col-span-6 lg:col-span-7 lg:row-span-2', 'md:col-span-3 lg:col-span-5', 'md:col-span-3 lg:col-span-5', 'md:col-span-3 lg:col-span-4', 'md:col-span-3 lg:col-span-4', 'md:col-span-6 lg:col-span-4']

export function InTheirWords() {
  const root = useRef<HTMLElement>(null)
  const { featured, quotes } = endorsements
  const cards: Endorsement[] = [featured, ...quotes]

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.matchMedia().add(motionOk, () => {
      gsap.timeline({ scrollTrigger: { trigger: q('.words-board')[0], start: 'top 75%', toggleActions: 'play none none reverse' } })
        .from(q('.word-card'), { y: 90, opacity: 0, rotate: (index: number) => tilts[index % tilts.length] * 4, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
        .fromTo(q('.word-mark'), { '--mark': '0%' }, { '--mark': '100%', duration: 0.7, ease: 'power2.inOut', stagger: 0.12 }, 0.55)
    })
  }, { scope: root })

  return (
    <section ref={root} id="in-their-words" aria-labelledby="words-title" className="px-5 py-[clamp(6rem,16vh,11rem)] md:px-10">
      <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-8">
        <h2 id="words-title" className="display text-[clamp(2.75rem,5.4vw,5.75rem)] md:col-span-7">In their words.</h2>
        <p className="max-w-[36ch] text-[17px] leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9">Notes from the product and engineering partners I work with at Microsoft.</p>
      </div>

      <div className="words-board mt-[clamp(3rem,8vh,5rem)] rounded-[28px] border border-border p-4 sm:p-6 md:p-10">
        <ul className="grid gap-5 md:grid-cols-6 md:gap-6 lg:grid-cols-12">
          {cards.map((card, index) => (
            <li key={card.text} className={cn('word-card', spans[index])} style={{ '--tilt': `${tilts[index]}deg` } as CSSProperties}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-[0_24px_48px_-30px_rgb(0_0_0/0.45)] transition-[rotate,translate] duration-500 ease-expo md:rotate-[var(--tilt)] md:p-7 md:hover:-translate-y-1 md:hover:rotate-0">
                <figcaption><RoleChip role={card.role} /></figcaption>
                <blockquote className={cn('mt-5', index === 0 ? 'text-[clamp(1.6rem,2.5vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] lg:text-[clamp(2.1rem,3.1vw,3.5rem)] lg:leading-[1.08]' : 'text-[17px] leading-relaxed')}>
                  “<Marked text={card.text} highlight={card.highlight} />”
                </blockquote>
                {index === 0 && <p className="mt-auto pt-8 text-[17px] leading-relaxed text-muted-foreground">“{featured.more}”</p>}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
