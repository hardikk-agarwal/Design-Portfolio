import { useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { gsap, SplitText, useGSAP, cinematic, motionOk } from '@/lib/gsap'
import { Link, useNavigation } from '@/lib/navigation'
import { photos } from '@/lib/content'
import { NoteCards, NoteMarks, bindNotes, hideNotes, layoutNotes, noteAt, revealNotes, type Note } from '@/sections/hero-notes'
import { StarTrails, exposure, type CoverContext } from '@/sections/hero-exposure'

function setHeaderTone(clear: boolean) {
  if (clear) document.documentElement.dataset.headerTone = 'clear'
  else delete document.documentElement.dataset.headerTone
}

// The intro plays once per page load.
let introPlayed = false

// Pins and boxes are fractions of the 1122 × 1402 portrait, so each note stays on its body part at any crop.
// Order is priority: when a column runs out of room, the last notes are dropped first.
const notes: Note[] = [
  { id: 'head', part: 'Head', title: 'I solve it once, for good', text: 'One schema I built lets Copilot add 4 new sports a cycle.', side: 'right', pin: [0.572, 0.158], box: [0.445, 0.125, 0.6, 0.256] },
  { id: 'eyes', part: 'Eyes', title: 'I watch before I draw', text: 'Research I led lifted satisfaction scores by 45%.', side: 'left', pin: [0.492, 0.197], box: [0.478, 0.184, 0.562, 0.211] },
  { id: 'heart', part: 'Heart', title: 'I chase light, near and far', text: 'Photography trains my framing; astronomy, my sense of scale.', side: 'right', pin: [0.63, 0.34], box: [0.585, 0.3, 0.7, 0.4] },
  { id: 'buttons', part: 'Buttons', title: 'I fix the papercuts', text: 'Triaging Windows Hello issues helped cut craft bugs by 20%.', side: 'right', pin: [0.561, 0.36], box: [0.548, 0.268, 0.578, 0.44] },
  { id: 'arm', part: 'Arm', title: 'I reach past the mockup', text: 'Coded prototypes built with AI, demoed to 30+ stakeholders.', side: 'left', pin: [0.33, 0.3], box: [0.18, 0.27, 0.43, 0.345] },
]

// Rides on a copy of the photo's crop, so pins share the photo's parallax and scroll scale.
function NotePins() {
  return (
    <div aria-hidden="true" className="note-pins hero-image pointer-events-none absolute inset-0 hidden lg:block">
      <div className="cover-photo absolute inset-0">
        <div className="absolute inset-[-2%] size-[104%] [container-type:size]">
          <div className="note-fit absolute">
            <NoteMarks notes={notes} />
          </div>
        </div>
      </div>
    </div>
  )
}

// The name sits between the photograph and a registered cutout of Hardik, so his head passes in front of it.
// The photograph is the bench portrait with the ivy replaced by a plain wall, so the notes have a calm ground.
function HeroStage() {
  const layer = 'cover-layer absolute inset-[-2%] size-[104%] max-w-none object-cover'
  return (
    <>
      <div className="hero-media absolute inset-0">
        <div className="hero-frame absolute inset-0 overflow-hidden bg-[#0b110d]">
          <div className="hero-image absolute inset-0">
            <div className="cover-photo absolute inset-0">
              <img className={layer} data-cover="scene" src={photos.benchScene} alt="Hardik seated on a green bench" width={2244} height={2804} fetchPriority="high" decoding="async" />
            </div>
          </div>
          <StarTrails />
          <div className="cover-type absolute inset-x-0 px-5 text-[#f4f4f1] md:px-10">
            <h1 id="home-title" className="whitespace-nowrap text-[16vw] font-[820] uppercase leading-[0.8] tracking-[-0.02em] [font-stretch:125%] md:text-center md:text-[calc((100vw-6rem)/10.45)]">
              <span className="sr-only normal-case">Hardik Agarwal</span>
              <span aria-hidden="true" className="hero-first block md:inline-block"><span className="hero-name-part block md:inline-block">Hardik</span></span>{' '}
              <span aria-hidden="true" className="hero-last block md:inline-block"><span className="hero-name-part block md:inline-block">Agarwal</span></span>
            </h1>
          </div>
          <div className="hero-image pointer-events-none absolute inset-0">
            <div className="cover-photo absolute inset-0">
              <img className={layer} data-cover="subject" src={photos.subject} alt="" aria-hidden="true" width={2244} height={2804} decoding="async" />
            </div>
          </div>
          <div className="hero-scrim pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(10_16_11/0.4)_0%,rgb(10_16_11/0)_16%,rgb(10_16_11/0)_52%,rgb(10_16_11/0.85)_100%)]" />
          <NotePins />
        </div>
      </div>
      <div className="cover-copy relative z-10 flex h-full flex-col justify-end px-5 pt-[calc(var(--header-height)+1.25rem)] text-[#f4f4f1] md:px-10 md:pb-10">
        <div className="hero-lead md:w-[26rem]">
          <div className="hero-fade">
            <p className="mb-4 text-[15px] font-semibold md:text-base">
              Product designer at{' '}
              <span className="whitespace-nowrap">
                Microsoft
                <svg aria-hidden="true" focusable="false" viewBox="0 0 21 21" className="ml-[0.4em] inline-block size-[0.75em] align-baseline">
                  <path fill="#f25022" d="M0 0h10v10H0z" />
                  <path fill="#7fba00" d="M11 0h10v10H11z" />
                  <path fill="#00a4ef" d="M0 11h10v10H0z" />
                  <path fill="#ffb900" d="M11 11h10v10H11z" />
                </svg>
              </span>
            </p>
            <p className="text-lg leading-snug md:text-[1.35rem]">I design for AI, developer platforms and identity, and prototype in code.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="#selected-work" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#f4f4f1] px-6 text-[15px] font-semibold text-[#111315] transition-transform active:scale-[0.97]">
                View work <ArrowDown aria-hidden="true" className="size-4" strokeWidth={2} />
              </Link>
              <Link to="#resume" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#f4f4f1]/60 px-6 text-[15px] font-semibold backdrop-blur-sm transition-colors hover:bg-[#f4f4f1]/12 active:scale-[0.97]">
                Resume <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <NoteCards notes={notes} />
    </>
  )
}

function HeroStatement() {
  return (
    <div id="my-story" className="hero-statement px-5 py-[clamp(5rem,14vh,9rem)] md:px-10">
      <div className="statement-then">
        <h2 className="statement-line display max-w-[11ch] text-[clamp(2.6rem,8vw,4.75rem)] tracking-[-0.03em] lg:text-[clamp(2.25rem,3.55vw,4.5rem)]">
          I grew up customizing Windows.
        </h2>
      </div>
      <span aria-hidden="true" className="statement-spacer hidden" />
      <div className="statement-now mt-6 lg:mt-0">
        <p className="statement-line display max-w-[11ch] text-[clamp(2.6rem,8vw,4.75rem)] tracking-[-0.03em] text-primary lg:text-[clamp(2.25rem,3.55vw,4.5rem)]">
          Now I help design it.
        </p>
        <div className="statement-detail mt-8 max-w-[23rem]">
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            My path ran through communication design, then AR and VR. Today I design how developers bring their apps to Windows, which feels like coming full circle.
          </p>
          <Link to="#work/portal" className="mt-5 inline-flex items-center gap-1.5 text-[17px] font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2">
            See the Windows Developer Center <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const { registerAnchor } = useNavigation()

  useGSAP(() => {
    const sequence = root.current
    if (!sequence) return
    const q = gsap.utils.selector(sequence)
    const mm = gsap.matchMedia()

    mm.add({ cinematic, motion: motionOk, pointer: '(hover: hover) and (pointer: fine)', any: 'all' }, (context) => {
      const { cinematic: isCinematic, motion, pointer } = context.conditions as Record<string, boolean>
      const cleanups: (() => void)[] = []

      // The name rises when the intro calls for it, so it waits (paused) until then.
      let nameCalled = false
      let nameRise: gsap.core.Tween | undefined
      if (motion) {
        SplitText.create(q('.hero-name-part'), {
          type: 'words,chars',
          aria: 'none',
          mask: 'chars',
          charsClass: 'split-char',
          autoSplit: true,
          onSplit: (self) => (nameRise = gsap.from(self.chars, { yPercent: 140, duration: 1.25, ease: 'expo.out', stagger: 0.035, paused: !nameCalled })),
        })
      }
      if (motion) gsap.set(q('.hero-fade'), { y: 26, opacity: 0 })

      if (motion && pointer) {
        const stage = q('.hero-stage')[0] as HTMLElement
        const photoLayers = q('.cover-photo, .note-overlay')
        const typeLayers = q('.cover-type')
        const typeX = gsap.quickTo(typeLayers, 'x', { duration: 1.2, ease: 'power3.out' })
        const typeY = gsap.quickTo(typeLayers, 'y', { duration: 1.2, ease: 'power3.out' })
        const photoX = gsap.quickTo(photoLayers, 'x', { duration: 1.4, ease: 'power3.out' })
        const photoY = gsap.quickTo(photoLayers, 'y', { duration: 1.4, ease: 'power3.out' })
        const move = (event: PointerEvent) => {
          const box = stage.getBoundingClientRect()
          const nx = ((event.clientX - box.left) / box.width) * 2 - 1
          const ny = ((event.clientY - box.top) / box.height) * 2 - 1
          typeX(nx * -20)
          typeY(ny * -10)
          // Lite (no GPU rendering): moving the photo repaints the whole cover, so it holds still and the name alone drifts.
          const still = Boolean(stage.dataset.lite)
          photoX(still ? 0 : nx * 9)
          photoY(still ? 0 : ny * 5)
        }
        const leave = () => { typeX(0); typeY(0); photoX(0); photoY(0) }
        stage.addEventListener('pointermove', move)
        stage.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          stage.removeEventListener('pointermove', move)
          stage.removeEventListener('pointerleave', leave)
        })
      }

      // Notes are laid out at the photo's resting scale (1.1 at the top of the cinematic sequence).
      const layout = () => layoutNotes(sequence, notes, q('.hero-stage')[0] as HTMLElement, [q('#home-title')[0], q('.hero-lead')[0]], isCinematic ? 1.1 : 1)
      const observer = new ResizeObserver(layout)
      observer.observe(q('.note-overlay')[0])
      void document.fonts.ready.then(layout)
      const noteState = bindNotes(sequence, notes)
      cleanups.push(() => observer.disconnect(), noteState.dispose)

      // Pointing at a body part opens its note and shows its bounds, like hovering a layer on a canvas.
      if (pointer) {
        const stage = q('.hero-stage')[0] as HTMLElement
        const overlay = q('.note-overlay')[0] as HTMLElement
        const partUnder = (event: MouseEvent) => {
          if (!overlay.offsetWidth || overlay.style.visibility === 'hidden') return null
          if ((event.target as Element).closest('a, button, [data-note-card]')) return undefined
          return noteAt(sequence, notes, event.clientX, event.clientY)
        }
        const track = (event: PointerEvent) => {
          const part = partUnder(event)
          if (part === undefined) return
          stage.style.cursor = part ? 'pointer' : ''
          noteState.hover(part)
        }
        const leave = () => {
          stage.style.cursor = ''
          noteState.hover(null)
        }
        const choose = (event: MouseEvent) => {
          const part = partUnder(event)
          if (part) noteState.toggle(part)
          else if (part === null) noteState.clear()
        }
        stage.addEventListener('pointermove', track)
        stage.addEventListener('pointerleave', leave)
        stage.addEventListener('click', choose)
        cleanups.push(() => {
          stage.removeEventListener('pointermove', track)
          stage.removeEventListener('pointerleave', leave)
          stage.removeEventListener('click', choose)
          stage.style.cursor = ''
        })
      }

      const reveal = context.add('revealNotes', () => {
        layout()
        revealNotes(sequence, notes)
      })
      const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
      const cover: CoverContext = {
        q: (selector) => q(selector) as HTMLElement[],
        stage: q('.hero-stage')[0] as HTMLElement,
        subject: q('[data-cover="subject"]')[0] as HTMLImageElement,
        rest: isCinematic ? 1.1 : 1,
        motion,
        // Once the photograph is in place: the name, the copy, then the notes.
        story: () =>
          gsap
            .timeline()
            .call(() => {
              nameCalled = true
              nameRise?.play()
            })
            .to(q('.hero-fade'), { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', clearProps: 'transform,opacity' }, 0.9)
            .call(() => reveal(), undefined, 1.4),
        played: () => {
          introPlayed = true
        },
        skippable: (timeline) => {
          const hurry = () => timeline.timeScale(4)
          const stop = () => inputs.forEach((type) => window.removeEventListener(type, hurry))
          inputs.forEach((type) => window.addEventListener(type, hurry, { passive: true }))
          void timeline.then(stop)
          cleanups.push(stop)
        },
        onCleanup: (cleanup) => cleanups.push(cleanup),
      }
      exposure.setup(cover)
      if (motion) {
        hideNotes(sequence, notes)
        if (!introPlayed) exposure.intro(cover)
        else {
          exposure.still()
          cover.story()
        }
      } else exposure.still()

      if (!isCinematic) {
        const tone = gsap.timeline({
          scrollTrigger: {
            trigger: q('.hero-stage')[0],
            start: 'top bottom',
            end: 'bottom top+=72',
            onToggle: (self) => setHeaderTone(self.isActive),
          },
        })
        if (motion) {
          SplitText.create(q('.statement-line'), {
            type: 'words',
            aria: 'none',
            mask: 'words',
            wordsClass: 'split-word',
            autoSplit: true,
            onSplit: (self) => gsap.from(self.words, {
              yPercent: 140,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.04,
              scrollTrigger: { trigger: q('.hero-statement')[0], start: 'top 78%', toggleActions: 'play none none reverse' },
            }),
          })
        }
        return () => {
          cleanups.forEach((cleanup) => cleanup())
          tone.kill()
          setHeaderTone(false)
        }
      }

      sequence.dataset.cinematic = 'true'
      const words = SplitText.create(q('.statement-line'), { type: 'words', aria: 'none', mask: 'words', wordsClass: 'split-word' })
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: q('.hero-pin')[0],
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
        },
      })
      timeline
        .to(q('.hero-frame'), { clipPath: 'inset(9% 32% 9% 32% round 28px)', duration: 1 }, 0)
        .fromTo(q('.hero-image'), { scale: 1.1 }, { scale: 1, duration: 1 }, 0)
        .to(q('.hero-first'), { xPercent: -55, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(q('.hero-last'), { xPercent: 55, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .to(q('.hero-lead'), { y: -30, opacity: 0, duration: 0.3, ease: 'power1.in' }, 0)
        .to(q('.note-overlay'), { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, 0)
        .to(q('.hero-scrim, .note-pins'), { autoAlpha: 0, duration: 0.6 }, 0.15)
        .from(words.words, { yPercent: 140, duration: 0.3, stagger: 0.03, ease: 'power3.out' }, 0.62)
        .from(q('.statement-detail'), { y: 28, opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.92)
        .to({}, { duration: 0.3 })

      const lead = q('.hero-lead')[0] as HTMLElement
      const detail = q('.statement-detail')[0] as HTMLElement
      const syncInteractivity = () => {
        const time = timeline.time()
        lead.style.pointerEvents = time > 0.2 ? 'none' : ''
        detail.style.pointerEvents = time > 1.1 ? 'auto' : 'none'
      }
      timeline.eventCallback('onUpdate', syncInteractivity)
      syncInteractivity()

      const tone = gsap.timeline({
        scrollTrigger: {
          trigger: q('.hero-pin')[0],
          start: 'top bottom',
          end: () => `top top-=${Math.round(window.innerHeight * 0.42)}`,
          onToggle: (self) => setHeaderTone(self.isActive),
        },
      })

      const storyPosition = () => {
        const trigger = timeline.scrollTrigger
        return trigger ? trigger.start + (trigger.end - trigger.start) * 0.94 : null
      }
      const release = registerAnchor('my-story', storyPosition)
      const statement = q('.hero-statement')[0]
      const revealOnFocus = () => {
        const y = storyPosition()
        if (y != null && window.scrollY < y - 2) window.scrollTo({ top: y, behavior: 'instant' })
      }
      statement.addEventListener('focusin', revealOnFocus)
      const returnOnFocus = () => {
        const trigger = timeline.scrollTrigger
        if (trigger && window.scrollY > trigger.start + 2) window.scrollTo({ top: trigger.start, behavior: 'instant' })
      }
      lead.addEventListener('focusin', returnOnFocus)

      return () => {
        cleanups.forEach((cleanup) => cleanup())
        statement.removeEventListener('focusin', revealOnFocus)
        lead.removeEventListener('focusin', returnOnFocus)
        lead.style.pointerEvents = ''
        detail.style.pointerEvents = ''
        release()
        tone.kill()
        setHeaderTone(false)
        words.revert()
        delete sequence.dataset.cinematic
      }
    })
  }, { scope: root })

  return (
    <section ref={root} className="hero-sequence relative" aria-labelledby="home-title">
      <div className="hero-pin relative bg-background">
        <div className="hero-stage relative h-[100svh] min-h-[560px] overflow-hidden">
          <HeroStage />
        </div>
        <HeroStatement />
      </div>
    </section>
  )
}
