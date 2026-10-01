import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { TypographyVortexCanvas } from '@designcodeio/threeui/components/TypographyVortexCanvas'
import { Magnetic } from '@/components/magnetic'
import { gsap, motionOk } from '@/lib/gsap'
import { Link, useNavigation } from '@/lib/navigation'
import { useTheme, type Theme } from '@/lib/theme'
import { email } from '@/lib/content'

// Building the vortex's text rings blocks the main thread for a moment, so it starts only once the footer is on
// screen and scrolling has paused, then fades in; pages read without reaching the footer never pay for it.
// It also redraws the whole footer every frame. Where that runs below 20 fps once warmed up
// (no GPU acceleration, for example), a still frame of it replaces the animation so the footer stays responsive.
function Vortex({ theme }: { theme: Theme }) {
  const host = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)
  const [still, setStill] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const element = host.current
    if (!element || live) return
    let visible = false
    let timer = 0
    const settle = () => {
      window.clearTimeout(timer)
      if (visible) timer = window.setTimeout(() => setLive(true), 250)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
      settle()
    })
    observer.observe(element)
    window.addEventListener('scroll', settle, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', settle)
      window.clearTimeout(timer)
    }
  }, [live])

  useEffect(() => {
    const element = host.current
    if (!element || !live) return
    if (window.matchMedia(motionOk).matches) gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
    let frame = 0
    let last = 0
    let deltas: number[] = []
    const tick = (now: number) => {
      if (last) deltas.push(now - last)
      last = now
      // Decide after 12 settled frames, or sooner on slow devices: 3+ frames spanning 600 ms.
      const settled = deltas.slice(2)
      const elapsed = settled.reduce((sum, delta) => sum + delta, 0)
      if (settled.length < 12 && (settled.length < 3 || elapsed < 600)) {
        frame = requestAnimationFrame(tick)
        return
      }
      observer.disconnect()
      settled.sort((a, b) => a - b)
      const source = element.querySelector('canvas')
      if (settled[settled.length >> 1] <= 50 || !source) return
      const copy = document.createElement('canvas')
      copy.width = source.width
      copy.height = source.height
      copy.getContext('2d')?.drawImage(source, 0, 0)
      setStill(copy)
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      last = 0
      deltas = []
      if (entry?.isIntersecting) frame = requestAnimationFrame(tick)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [live])

  if (still) return <div ref={(node) => { node?.replaceChildren(still) }} className={`typography-vortex-component typography-vortex-component--${theme}`} />
  return (
    <div ref={host} className="size-full">
      {live && <TypographyVortexCanvas mode={theme} phrase="HARDIK AGARWAL / PRODUCT DESIGNER / " speed={0.75} opacity={0.9} />}
    </div>
  )
}

export function SiteFooter() {
  const { theme } = useTheme()
  const { scrollTo } = useNavigation()

  return (
    <footer id="contact" aria-labelledby="contact-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#eef1f6] text-foreground dark:bg-[#151515]">
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <Vortex key={theme} theme={theme} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_52%_46%_at_50%_50%,#eef1f6_38%,rgb(238_241_246/0)_100%)] dark:bg-[radial-gradient(ellipse_52%_46%_at_50%_50%,#151515_38%,rgb(21_21_21/0)_100%)]" />

      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-[calc(var(--header-height)+3rem)] text-center">
        <h2 id="contact-title" className="display-wide max-w-[11ch] text-[clamp(2.6rem,8vw,9rem)]">
          Bring me a hard problem.
        </h2>
        <Magnetic className="mt-12">
          <a
            href={`mailto:${email}`}
            className="grid size-36 place-items-center rounded-full bg-primary text-[17px] font-semibold text-primary-foreground transition-transform duration-500 ease-expo hover:scale-[1.04] active:scale-[0.97] md:size-44 md:text-lg"
          >
            Get in touch
          </a>
        </Magnetic>
        <a href={`mailto:${email}`} className="mt-8 text-lg font-medium underline decoration-1 underline-offset-[6px] hover:decoration-2">
          {email}
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-border bg-[#eef1f6]/90 px-5 py-5 text-[15px] backdrop-blur-md md:px-10 dark:bg-[#151515]/90">
        <p>© 2026 Hardik Agarwal</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="#work" className="hover:underline">Work</Link>
          <Link to="#about" className="hover:underline">About</Link>
          <Link to="#resume" className="hover:underline">Resume</Link>
          <button type="button" onClick={() => scrollTo(0)} className="inline-flex items-center gap-1.5 hover:underline">
            Back to top <ArrowUp aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </footer>
  )
}
