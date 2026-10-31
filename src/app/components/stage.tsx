import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { ArrowUpRight, Check, Minus, Pause, Play, Square, X } from 'lucide-react'
import type { Stage } from '@/lib/content'
import { prefersReducedMotion } from '@/lib/gsap'
import { Compare, screen } from '@/components/study'
import { cn } from '@/lib/utils'

const pill = 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors'
const fade = 'absolute inset-0 size-full object-cover transition-opacity duration-700 ease-expo motion-reduce:transition-none'

type StraddleProps = { media: ReactNode; children?: ReactNode; caption?: ReactNode } & Omit<HTMLAttributes<HTMLElement>, 'children'>

// The media straddles the project's colour and the page, like a product on a stage. Controls and the caption sit on the page,
// so they keep their contrast in both themes.
function Straddle({ media, children, caption, ...rest }: StraddleProps) {
  const Outer = caption ? 'figure' : 'div'
  return (
    <Outer {...rest}>
      <div className="px-5 md:px-10" style={{ backgroundImage: 'linear-gradient(var(--band) 50%, transparent 50%)' }}>
        <div className="build-shot mx-auto w-full max-w-[72rem]">{media}</div>
      </div>
      {children && (
        <div className="px-5 text-foreground md:px-10">
          <div className="mx-auto max-w-[72rem]">{children}</div>
        </div>
      )}
      {caption && <figcaption className="mx-auto mt-4 max-w-[62ch] px-5 text-center text-[16px] leading-relaxed text-muted-foreground">{caption}</figcaption>}
    </Outer>
  )
}

type Of<K extends Stage['kind']> = Extract<Stage, { kind: K }>

// App Trust: one installer, the four answers Windows could give about it, laid out like a hand of cards from trusted to malicious.
function Fan({ stage }: { stage: Of<'fan'> }) {
  const [active, setActive] = useState(0)
  const current = stage.items[active]
  const middle = (stage.items.length - 1) / 2
  return (
    <Straddle caption={stage.caption} media={
      <div className="relative aspect-[16/9] w-full overflow-x-clip [--fan:13%] sm:[--fan:24%]">
        {stage.items.map((item, index) => {
          const spot = index - middle
          const on = index === active
          return (
            <img
              key={item.shot.src}
              src={item.shot.src}
              alt={on ? item.shot.alt : ''}
              aria-hidden={on ? undefined : true}
              width={item.shot.width}
              height={item.shot.height}
              decoding="async"
              onClick={() => setActive(index)}
              className={cn(
                'absolute left-1/2 top-1/2 h-auto w-[70%] rounded-xl ring-1 ring-black/10 transition-[transform,filter,box-shadow] duration-700 ease-expo motion-reduce:transition-none sm:w-[52%]',
                on ? 'shadow-[0_50px_90px_-30px_rgb(0_0_0/0.65)]' : 'cursor-pointer shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)] brightness-[0.9] saturate-[0.7]',
              )}
              style={{
                transform: `translate(-50%, -50%) translateX(calc(var(--fan) * ${spot})) translateY(${on ? -4 : 2}%) rotate(${on ? 0 : spot * 3}deg) scale(${on ? 1 : 0.8})`,
                zIndex: on ? 20 : 10 - Math.abs(index - active),
              }}
            />
          )
        })}
      </div>
    }>
      <div role="group" aria-label="What Windows can tell you" className="mt-6 flex flex-wrap justify-center gap-2">
        {stage.items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === active}
            onClick={() => setActive(index)}
            className={cn(pill, index === active ? 'bg-foreground text-background' : 'border border-border hover:border-foreground/40')}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mx-auto mt-5 max-w-[56ch] text-center text-[17px] leading-relaxed">
        <span className="font-semibold">{current.label}:</span> {current.note}
      </p>
    </Straddle>
  )
}

// Craft Check: the tool's own flow, playing step by step once it's on screen.
function Tour({ stage }: { stage: Of<'tour'> }) {
  const frame = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [held, setHeld] = useState(false)
  const [first] = stage.items

  useEffect(() => {
    const element = frame.current
    if (!element || prefersReducedMotion()) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setPlaying(true)
      observer.disconnect()
    }, { threshold: 0.4 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Straddle
      caption={stage.caption}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      media={
        <div ref={frame} className={cn('relative overflow-hidden bg-black', screen)} style={{ aspectRatio: `${first.shot.width} / ${first.shot.height}` }}>
          {stage.items.map((item, index) => (
            <img
              key={item.shot.src}
              src={item.shot.src}
              alt={index === active ? item.shot.alt : ''}
              aria-hidden={index === active ? undefined : true}
              width={item.shot.width}
              height={item.shot.height}
              decoding="async"
              className={cn(fade, index === active ? 'opacity-100' : 'opacity-0')}
            />
          ))}
        </div>
      }
    >
      <div className="mt-5 flex items-start gap-3">
        <ol className="grid flex-1 gap-3 sm:grid-cols-4">
          {stage.items.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                aria-pressed={index === active}
                onClick={() => {
                  setPlaying(false)
                  setActive(index)
                }}
                className="group/step block w-full text-left"
              >
                <span aria-hidden="true" className="block h-1 overflow-hidden rounded-full bg-border">
                  <span
                    key={`${active}-${playing}`}
                    className="block h-full rounded-full bg-foreground"
                    // The active step's bar is the clock: when it fills, the tour moves on.
                    onAnimationEnd={() => setActive((step) => (step + 1) % stage.items.length)}
                    style={index === active && playing
                      ? { animation: 'tour-fill 3.6s linear forwards', animationPlayState: held ? 'paused' : 'running' }
                      : { width: index < active || index === active ? '100%' : '0%' }}
                  />
                </span>
                <span className={cn('mt-2 block text-[14px] font-semibold leading-snug transition-colors', index === active ? 'text-foreground' : 'text-muted-foreground group-hover/step:text-foreground')}>
                  <span className="tabular">{index + 1}</span>
                  <span aria-hidden="true">. </span>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? 'Pause the tour' : 'Play the tour'}
          className="-mt-1.5 grid size-9 shrink-0 place-items-center rounded-full border border-border transition-colors hover:border-foreground/40"
        >
          {playing ? <Pause aria-hidden="true" className="size-4" strokeWidth={2} /> : <Play aria-hidden="true" className="size-4 translate-x-px" strokeWidth={2} />}
        </button>
      </div>
    </Straddle>
  )
}

// Figma to Storybook: the skill's command, run on demand, ending on what it produced.
function Run({ stage }: { stage: Of<'run'> }) {
  const last = stage.items.length - 1
  const [step, setStep] = useState(last)
  const [running, setRunning] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  function stop() {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setRunning(false)
  }

  function run() {
    stop()
    setRunning(true)
    setStep(0)
    timers.current = stage.items.slice(1).map((_, index) => window.setTimeout(() => {
      setStep(index + 1)
      if (index + 1 === last) setRunning(false)
    }, (index + 1) * 1500))
  }

  return (
    <Straddle caption={stage.caption} media={
      <>
        <div className="mx-auto flex max-w-[46rem] items-center gap-3 rounded-full bg-[#18181b] py-1.5 pl-5 pr-1.5 text-[#f4f4f5] shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
          <code className="min-w-0 flex-1 truncate font-mono text-[14px] sm:text-[15px]">{stage.command}</code>
          <button type="button" onClick={run} disabled={running} className={cn(pill, 'bg-primary text-primary-foreground disabled:opacity-80')}>
            <Play aria-hidden="true" className="size-4 fill-current" strokeWidth={0} /> {running ? 'Running' : 'Run it'}
          </button>
        </div>
        <div className={cn('relative mt-5 overflow-hidden bg-white', screen)} style={{ aspectRatio: `${stage.items[0].shot.width} / ${stage.items[0].shot.height}` }}>
          {stage.items.map((item, index) => (
            <img
              key={item.shot.src}
              src={item.shot.src}
              alt={index === step ? item.shot.alt : ''}
              aria-hidden={index === step ? undefined : true}
              width={item.shot.width}
              height={item.shot.height}
              decoding="async"
              className={cn(fade, index === step ? 'opacity-100' : 'opacity-0')}
            />
          ))}
        </div>
      </>
    }>
      <ol aria-label="What the skill does" className="mt-5 flex flex-wrap justify-center gap-2">
        {stage.items.map((item, index) => (
          <li key={item.label}>
            <button
              type="button"
              aria-pressed={index === step}
              onClick={() => {
                stop()
                setStep(index)
              }}
              className={cn(pill, 'py-1.5 pl-1.5', index === step ? 'bg-foreground text-background' : 'border border-border hover:border-foreground/40')}
            >
              <span className={cn('grid size-6 place-items-center rounded-full text-[12px] tabular', index === step ? 'bg-background text-foreground' : 'bg-muted')}>
                {index < step ? <Check aria-hidden="true" className="size-3.5" strokeWidth={3} /> : index + 1}
              </span>
              {item.label}
            </button>
          </li>
        ))}
      </ol>
    </Straddle>
  )
}

// The vibe-coded Developer Center: the live prototype itself, loaded on request and drawn at a desktop size.
function Live({ stage }: { stage: Of<'live'> }) {
  const box = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const [scale, setScale] = useState(0)
  const [wide, setWide] = useState(false)
  const address = new URL(stage.href)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const update = () => setWide(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const element = box.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setScale((entry?.contentRect.width ?? 1440) / 1440))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Straddle
      caption={
        <>
          {stage.caption}{' '}
          <a href={stage.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-1 underline-offset-4 hover:decoration-2">
            Open it in a new tab <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      }
      media={
        <div className={cn('overflow-hidden bg-white', screen)}>
          <div aria-hidden="true" className="flex h-10 items-center gap-4 border-b border-black/10 bg-[#f3f3f3] px-4 text-[13px] text-[#3b3b3b]">
            <span className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 ring-1 ring-black/5">{address.host}{address.pathname}</span>
            <span className="flex items-center gap-4 text-[#5c5c5c]">
              <Minus className="size-3.5" strokeWidth={1.75} />
              <Square className="size-3" strokeWidth={1.75} />
              <X className="size-3.5" strokeWidth={1.75} />
            </span>
          </div>
          <div ref={box} data-lenis-prevent className="relative overflow-hidden" style={{ aspectRatio: '1440 / 900' }}>
            {on ? (
              <iframe
                src={stage.href}
                title={stage.title}
                className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                style={{ width: 1440, height: 900, transform: `scale(${scale})` }}
              />
            ) : (
              <>
                <img src={stage.poster.src} alt={stage.poster.alt} width={stage.poster.width} height={stage.poster.height} decoding="async" className="absolute inset-0 size-full object-cover object-top" />
                {wide && (
                  <button type="button" onClick={() => setOn(true)} className="group/live absolute inset-0 grid place-items-center bg-black/20 transition-colors hover:bg-black/30">
                    <span className={cn(pill, 'bg-white px-6 py-3 text-[16px] text-black shadow-[0_16px_40px_-12px_rgb(0_0_0/0.5)] transition-transform duration-500 ease-expo group-hover/live:scale-[1.04]')}>
                      <Play aria-hidden="true" className="size-4 fill-current" strokeWidth={0} /> Click through the live prototype
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      }
    />
  )
}

export function ProjectStage({ stage }: { stage: Stage }) {
  switch (stage.kind) {
    case 'fan': return <Fan stage={stage} />
    case 'tour': return <Tour stage={stage} />
    case 'run': return <Run stage={stage} />
    case 'live': return <Live stage={stage} />
    case 'compare': return <Straddle media={<Compare before={stage.before} after={stage.after} className="mt-0" />} />
  }
}
