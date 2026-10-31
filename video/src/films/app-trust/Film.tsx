import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { projects } from '../../../../src/app/lib/projects'
import { beats } from '../beats.js'
import defs from './beats.js'
import { C, Count, Rise, body, camera, display, glide, heading, tw, type Cam } from '../../lib/ui'
import { DecisionLayout, EndCard, FilmShell, Statement, TakeawayCard, TitleCard, floating, line, type SceneProps, type Timeline } from '../../lib/film'
import data from './timeline.json'

const timeline = data as Timeline
const found = projects.find((p) => p.id === 'app-trust')
if (!found || found.locked) throw new Error('App Trust case study missing')
const trust = found
const B = beats(timeline, defs)
const b = (name: string) => B[name].frame

// Hardik's own screen recording of the working app (video/public, kept out of git).
const DEMO: [number, number] = [2496, 1664]
const card: CSSProperties = { border: `1.5px solid ${C.faint}`, borderRadius: 22, background: 'rgba(240, 231, 230, 0.035)' }

// A stretch of the recording in a window; `cam` pans and zooms in source pixels, as Screen does for stills.
function Clip({ from, to, rate = 1, at = 0, box: [w, h], cam = { x: DEMO[0] / 2, y: DEMO[1] / 2, z: 1 }, fade }: { from: number; to: number; rate?: number; at?: number; box: [number, number]; cam?: Cam; fade?: number }) {
  const f = useCurrentFrame()
  const p = tw(f, at, 26) * (fade === undefined ? 1 : 1 - tw(f, fade, 14))
  const [sw, sh] = DEMO
  const k = (w / sw) * cam.z
  const tx = Math.min(0, Math.max(w - sw * k, w / 2 - cam.x * k))
  const ty = Math.min(0, Math.max(h - sh * k, h / 2 - cam.y * k))
  if (p <= 0) return null
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#000', opacity: p, transform: `translateY(${(1 - Math.min(1, tw(f, at, 26))) * 40}px)`, boxShadow: '0 50px 140px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 231, 230, 0.09)' }}>
      <Sequence from={at} layout="none">
        <OffthreadVideo src={staticFile('app-trust-demo.mp4')} trimBefore={Math.round(from * 30)} trimAfter={Math.round(to * 30)} playbackRate={rate} muted style={{ position: 'absolute', left: 0, top: 0, width: sw, height: sh, maxWidth: 'none', transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${k})` }} />
      </Sequence>
    </div>
  )
}

function Shot({ src, w, at, style }: { src: string; w: number; at: number; style?: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', ...style }}>
      <Rise at={at} y={50} dur={28}><Img src={src} style={{ display: 'block', width: w, ...floating }} /></Rise>
    </div>
  )
}

function Hook({ scene }: SceneProps) {
  const l0 = line(scene, 0), who = b('hook.who'), stat = b('hook.stat')
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0} style={{ ...body, fontSize: 30, fontWeight: 620, color: C.rose, letterSpacing: '0.04em' }}>Installing an app from the web</Rise>
      <Rise at={who - 8} style={{ ...display, fontSize: 150, marginTop: 24 }}>Who made this?</Rise>
      <div style={{ marginTop: 90, display: 'flex', alignItems: 'flex-end', gap: 48 }}>
        <Rise at={stat - 10} style={{ ...display, fontSize: 220 }}>
          <Count at={stat - 8} from={0} to={87} dur={34} format={(v) => `${v}%`} />
        </Rise>
        <Rise at={stat + 8} style={{ ...body, fontSize: 40, color: C.mute, maxWidth: 840, paddingBottom: 20 }}>of 60 Windows users stop or research an app when they don’t recognize the publisher.</Rise>
      </div>
    </AbsoluteFill>
  )
}

function Title() {
  return <TitleCard name={trust.name} headline={trust.headline} size={140} chips={[trust.role, trust.organization, trust.timeline!]} cover={{ src: trust.cover.src, size: [1600, 1000], box: [1100, 688], left: 860, top: 470 }} />
}

function Problem({ scene }: SceneProps) {
  const pill: CSSProperties = { ...body, display: 'inline-block', fontSize: 32, padding: '14px 26px', borderRadius: 999, border: `1.5px solid ${C.faint}`, background: 'rgba(13, 12, 14, 0.5)' }
  const habits = [['Check the signature', b('problem.sig')], ['Compare the hash', b('problem.hash')], ['Upload it to VirusTotal', b('problem.vt')]] as const
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={line(scene, 0) - 6} style={{ ...body, fontSize: 26, fontWeight: 620, color: C.rose, letterSpacing: '0.04em' }}>Outside the Store today</Rise>
      <Rise at={b('problem.warn') - 4} style={{ ...heading, fontSize: 64, marginTop: 22 }}>Warnings rarely explain why.</Rise>
      <Rise at={b('problem.none') - 4} style={{ ...heading, fontSize: 64, marginTop: 14, color: C.mute }}>And no warning isn’t proof of safety.</Rise>
      <Rise at={b('problem.sig') - 10} style={{ ...body, fontSize: 30, color: C.mute, marginTop: 84 }}>So people do the checking themselves</Rise>
      <div style={{ marginTop: 26, display: 'flex', gap: 18 }}>
        {habits.map(([text, at]) => <Rise key={text} at={at} y={14} dur={16}><span style={pill}>{text}</span></Rise>)}
        <Rise at={b('problem.guess')} y={14} dur={16}><span style={{ ...pill, borderColor: C.rose, color: C.rose }}>Or guess</span></Rise>
      </div>
    </AbsoluteFill>
  )
}

function Insight({ scene }: SceneProps) {
  const [first, second] = trust.insight.split(/(?<=\.) /)
  return <Statement parts={[{ text: first, at: line(scene, 0) - 6 }, { text: second, at: line(scene, 1) - 6, mark: { phrase: 'who made it', at: b('insight.mark') + 6 } }]} />
}

function Question({ title, items, at, style }: { title: string; items: string[]; at: number; style: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', width: 460, ...style }}>
      <Rise at={at} style={{ ...card, padding: '30px 34px 34px' }}>
        <div style={{ ...heading, fontSize: 40 }}>{title}</div>
        <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
          {items.map((item) => (
            <div key={item} style={{ ...body, fontSize: 27, display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: C.rose, flex: 'none', transform: 'translateY(-4px)' }} />{item}
            </div>
          ))}
        </div>
      </Rise>
    </div>
  )
}

// Two questions, security signals on top, one answer underneath.
function Decision1() {
  const f = useCurrentFrame()
  const d = trust.decisions[0], dev = b('decision1.dev'), file = b('decision1.file'), signals = b('decision1.signals'), safe = b('decision1.safe')
  return (
    <DecisionLayout n={1} title={d.title} chips={[{ text: 'Is the developer verified?', at: dev }, { text: 'Is this exact file genuine?', at: file }, { text: 'Security signals fill in the rest', at: signals }, { text: 'Signed never has to mean safe', at: safe }]}>
      <div style={{ position: 'relative', width: 980, height: 760 }}>
        <Question title="Who made it" items={['Verified by Microsoft', 'One identity across apps and releases']} at={dev} style={{ left: 0, top: 0 }} />
        <Question title="What you’re installing" items={['Signed and unchanged', 'This exact app and version']} at={file} style={{ left: 520, top: 0 }} />
        <Rise at={signals} style={{ position: 'absolute', left: 120, top: 330, width: 740, ...card, padding: '22px 30px', ...body, fontSize: 28, textAlign: 'center', color: C.mute }}>
          + Defender and reputation signals
        </Rise>
        <div style={{ position: 'absolute', left: 489, top: 420, width: 2, height: 110, background: C.rose, transformOrigin: 'top', transform: `scaleY(${tw(f, safe - 10, 18, 0, 1, glide)})` }} />
        <Rise at={safe} style={{ position: 'absolute', left: 70, top: 550, width: 840, borderRadius: 22, padding: '30px 34px', background: trust.color, color: trust.ink, ...heading, fontSize: 42, textAlign: 'center' }}>
          One answer people can act on
        </Rise>
      </div>
    </DecisionLayout>
  )
}

// The states appear as they're named: trusted, unverified, unsigned.
function Decision2() {
  const d = trust.decisions[1], four = b('decision2.four'), trusted = b('decision2.trusted'), unverified = b('decision2.unverified'), unsigned = b('decision2.unsigned'), between = b('decision2.between')
  const [unverifiedShot, unsignedShot, cleanShot] = d.shots
  return (
    <DecisionLayout n={2} title={d.title} chips={[{ text: 'Trusted: installs after a countdown', at: trusted }, { text: 'Unverified developer: explain, then choose', at: unverified }, { text: 'Unsigned: the strongest warning', at: unsigned }, { text: 'New version, known developer: in between', at: between }]} column={640}>
      <div style={{ position: 'relative', width: 960, height: 800 }}>
        <Rise at={four} style={{ position: 'absolute', right: 0, top: -10, ...body, fontSize: 24, color: C.mute }}>The working app’s screens</Rise>
        <Shot src={cleanShot.src} w={560} at={trusted - 6} style={{ left: 380, top: 30, transform: 'rotate(2deg)' }} />
        <Shot src={unverifiedShot.src} w={600} at={unverified - 6} style={{ left: 0, top: 250, transform: 'rotate(-3deg)' }} />
        <Shot src={unsignedShot.src} w={600} at={unsigned - 6} style={{ left: 350, top: 330, transform: 'rotate(2deg)' }} />
      </div>
    </DecisionLayout>
  )
}

// The recording: a VLC installer scanned, a Store link in the notification, then VLC in the Microsoft Store.
function Decision3({ scene }: SceneProps) {
  const f = useCurrentFrame()
  const same = b('decision3.same'), ai = b('decision3.ai'), alt = b('decision3.alt')
  // The clip is stretched to end with the scene, on the Store page.
  const from = 93, to = 109, rate = ((to - from) * 30) / (scene.duration - 2), t = (s: number) => 2 + Math.round(((s - from) * 30) / rate)
  const cam = camera(f, { x: DEMO[0] / 2, y: DEMO[1] / 2, z: 1 }, [
    { at: t(95.5), dur: 30, to: { x: 2250, y: 1500, z: 2.2 } },
    { at: t(104.5), dur: 30, to: { x: DEMO[0] / 2, y: DEMO[1] / 2, z: 1 } },
  ])
  return (
    <DecisionLayout n={3} title={trust.decisions[2].title} chips={[{ text: 'Points to the Microsoft Store', at: b('decision3.store') }, { text: 'Same app, same publisher first', at: same }, { text: 'Or a verified alternative, found with AI', at: ai }]}>
      <div style={{ position: 'relative', width: 1000, height: 667 }}>
        <Clip from={from} to={to} rate={rate} at={2} box={[1000, 667]} cam={cam} />
        <Rise at={alt} style={{ position: 'absolute', left: 0, top: 690, ...body, fontSize: 24, color: C.mute }}>From the working app: a scan, then one click to the Store version.</Rise>
      </div>
    </DecisionLayout>
  )
}

// A download that's scanned when it starts, then a right-click scan of a malicious test file and its report.
function Decision4() {
  const f = useCurrentFrame()
  const built = b('decision4.built'), starts = b('decision4.starts'), right = b('decision4.right'), six = b('decision4.six'), two = b('decision4.two'), admin = b('decision4.admin')
  const second = right - 6, rate = 1.5, t = (s: number) => second + Math.round(((s - 112) * 30) / rate)
  const cam = camera(f, { x: DEMO[0] / 2, y: DEMO[1] / 2, z: 1 }, [
    { at: t(118.5), dur: 30, to: { x: 2300, y: 1440, z: 2.4 } },
    { at: t(125.6), dur: 30, to: { x: DEMO[0] / 2, y: DEMO[1] / 2, z: 1 } },
  ])
  return (
    <DecisionLayout n={4} title={trust.decisions[3].title} chips={[{ text: 'Built with AI, in Python and PyQt6', at: built }, { text: 'Runs when a setup file starts', at: starts }, { text: 'Or from the right-click menu', at: right }, { text: 'Six checks in about two seconds', at: six }, { text: 'No admin rights', at: admin }]}>
      <div style={{ position: 'relative', width: 1000, height: 667 }}>
        <Clip from={13} to={29} rate={1.4} at={2} box={[1000, 667]} fade={second + 6} />
        <Clip from={112} to={133} rate={rate} at={second} box={[1000, 667]} cam={cam} />
        <Rise at={two} style={{ position: 'absolute', left: 0, top: 690, ...body, fontSize: 24, color: C.mute }}>A malicious test file: flagged, with a report behind the verdict.</Rise>
      </div>
    </DecisionLayout>
  )
}

function Result() {
  const pilot = b('result.pilot'), views = b('result.views'), apps = b('result.apps'), app = b('result.app')
  const cards: { at: number; value: ReactNode; label: string }[] = [
    { at: views, value: <Count at={views} from={0} to={313} format={(v) => `${v}K+`} />, label: 'Trust dialog views in the PC Manager pilot' },
    { at: apps, value: '20', label: 'Apps in the pilot' },
    { at: app, value: '6', label: 'Checks in every scan' },
    { at: app + 10, value: '~2 s', label: 'Per scan, no admin rights' },
  ]
  const shot = trust.decisions[3].shots[0]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 160, top: 0, bottom: 0, width: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Rise at={pilot - 8} style={{ ...heading, fontSize: 56 }}>Piloted in China with PC Manager.</Rise>
        <Rise at={app - 4} style={{ ...heading, fontSize: 56, color: C.mute, marginTop: 10 }}>Proven on real installers.</Rise>
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {cards.map((c) => (
            <Rise key={c.label} at={c.at} style={{ ...card, padding: '24px 30px 28px' }}>
              <div style={{ ...display, fontSize: 84 }}>{c.value}</div>
              <div style={{ ...body, fontSize: 24, color: C.mute, marginTop: 12 }}>{c.label}</div>
            </Rise>
          ))}
        </div>
      </div>
      <Shot src={shot.src} w={760} at={app - 8} style={{ left: 1080, top: 250, transform: 'rotate(3deg)' }} />
    </AbsoluteFill>
  )
}

function Takeaway({ scene }: SceneProps) {
  return <TakeawayCard scene={scene} lines={[{ text: scene.lines[0].text, mark: 'who made something' }]} size={84} width={1400} />
}

const glow: Record<string, [number, number]> = { hook: [22, 40], title: [78, 68], problem: [14, 60], insight: [50, 55], decision1: [78, 50], decision2: [80, 56], decision3: [80, 45], decision4: [80, 55], result: [72, 45], takeaway: [40, 55], end: [30, 62] }

export function Film() {
  return <FilmShell id="app-trust" timeline={timeline} scenes={{ hook: Hook, title: Title, problem: Problem, insight: Insight, decision1: Decision1, decision2: Decision2, decision3: Decision3, decision4: Decision4, result: Result, takeaway: Takeaway, end: () => <EndCard /> }} glow={glow} accent={trust.color} name={trust.name} />
}
