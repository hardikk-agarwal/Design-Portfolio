import type { CSSProperties } from 'react'
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import { projects } from '../../../../src/app/lib/projects'
import { beats } from '../beats.js'
import defs from './beats.js'
import { C, Count, Mark, Rise, Screen, body, camera, cues, display, heading } from '../../lib/ui'
import { DecisionLayout, EndCard, FilmShell, Statement, TakeawayCard, TitleCard, line, type SceneProps, type Timeline } from '../../lib/film'
import data from './timeline.json'

const timeline = data as Timeline
const found = projects.find((p) => p.id === 'sms-organizer')
if (!found || found.locked) throw new Error('SMS Organizer case study missing')
const sms = found
const B = beats(timeline, defs)
const b = (name: string) => B[name].frame

// The app screens are frameless phone screenshots; their rounded corners come from the image's alpha.
function Phone({ src, size: [w, h], at, style }: { src: string; size: [number, number]; at: number; style: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', ...style }}>
      <Rise at={at} y={60} dur={30}>
        <Img src={src} style={{ display: 'block', width: w, height: h, filter: 'drop-shadow(0 40px 60px rgba(0, 0, 0, 0.55))' }} />
      </Rise>
    </div>
  )
}

function Hook({ scene }: SceneProps) {
  const l0 = line(scene, 0), review = b('hook.review')
  const q = sms.problem.quote!, highlight = 'Just an attractive GUI lacks'
  const [before, after] = q.text.split(highlight)
  if (after === undefined) throw new Error('Review highlight no longer matches the case study')
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0 - 10} style={{ ...display, fontSize: 300 }}>
        <Count at={l0 - 8} from={0} to={1000} dur={40} format={(v) => (v >= 1000 ? '1M+' : `${v}K`)} />
      </Rise>
      <Rise at={l0 + 6} style={{ ...body, fontSize: 48, color: C.mute, marginTop: 34 }}>downloads, with every message sorted on the phone itself.</Rise>
      <Rise at={review - 6} style={{ marginTop: 70, maxWidth: 1300, borderLeft: `3px solid ${C.rose}`, paddingLeft: 30 }}>
        <div style={{ ...heading, fontSize: 40, fontWeight: 560 }}>“{before}<Mark at={review + 34} dur={18}>{highlight}</Mark>{after}”</div>
        <div style={{ ...body, fontSize: 24, color: C.mute, marginTop: 16 }}>{q.source}</div>
      </Rise>
    </AbsoluteFill>
  )
}

function Title() {
  return <TitleCard name={sms.name} headline={sms.headline} width={1100} chips={[sms.role, sms.organization, sms.timeline!]} phone cover={{ src: sms.cover.src, size: [900, 1895], box: [380, 800], left: 1360, top: 230 }} />
}

function Problem({ scene }: SceneProps) {
  const pains = [
    ['Two navigation bars competed for attention', b('problem.nav')],
    ['Text was small and low in contrast', b('problem.text')],
    ['Reminders stopped at the alert', b('problem.reminders')],
    ['Some messages arrived in languages readers couldn’t read', b('problem.languages')],
  ] as const
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={line(scene, 0) - 6} style={{ ...body, fontSize: 26, fontWeight: 620, color: C.rose, letterSpacing: '0.04em' }}>What my audit found</Rise>
      <Rise at={line(scene, 0)} style={{ ...heading, fontSize: 64, marginTop: 18, maxWidth: 1500 }}>People loved what the app did. They didn’t love using it.</Rise>
      <div style={{ marginTop: 60, display: 'grid', gap: 22 }}>
        {pains.map(([text, at]) => (
          <Rise key={text} at={at} y={14} dur={16} style={{ ...body, fontSize: 36, display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ width: 26, height: 3, background: C.rose, flex: 'none' }} />{text}
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Insight({ scene }: SceneProps) {
  const [first, second] = sms.insight.split(/(?<=\.) /)
  return <Statement parts={[{ text: first, at: line(scene, 0) - 6 }, { text: second, at: line(scene, 1) - 6, mark: { phrase: second, at: b('insight.mark') + 6 } }]} />
}

// Before and after board: the camera visits the new bottom navigation, then the filters that replaced the top bar.
function Decision1() {
  const f = useCurrentFrame()
  const d = sms.decisions[0], bottom = b('decision1.bottom'), filters = b('decision1.filters'), contrast = b('decision1.contrast'), asks = b('decision1.asks')
  const cam = camera(f, { x: 800, y: 392, z: 1 }, cues([[bottom, { x: 1150, y: 560, z: 1.7 }], [filters, { x: 1000, y: 200, z: 1.7 }], [contrast, { x: 800, y: 392, z: 1 }]]))
  return (
    <DecisionLayout n={1} title={d.title} chips={[{ text: 'Main navigation at the bottom', at: bottom }, { text: 'Filters, clearly secondary', at: filters }, { text: 'Larger text, stronger contrast', at: contrast }, { text: 'Asks before it moves', at: asks }]}>
      <Screen src={d.shots[0].src} size={[1600, 784]} box={[1000, 490]} cam={cam} enter={2} />
    </DecisionLayout>
  )
}

function Decision2() {
  const f = useCurrentFrame()
  const d = sms.decisions[1], booking = b('decision2.booking'), groups = b('decision2.groups'), tap = b('decision2.tap')
  const cam = camera(f, { x: 800, y: 552, z: 1 }, cues([[booking, { x: 790, y: 700, z: 1.6 }], [tap, { x: 1150, y: 680, z: 1.9 }]]))
  return (
    <DecisionLayout n={2} title={d.title} chips={[{ text: 'Created from booking messages', at: booking }, { text: 'Grouped by type', at: groups }, { text: 'The next step, one tap away', at: tap }]}>
      <Screen src={d.shots[0].src} size={[1600, 1105]} box={[1000, 691]} cam={cam} enter={2} />
    </DecisionLayout>
  )
}

function Decision3() {
  const f = useCurrentFrame()
  const d = sms.decisions[2], pick = b('decision3.pick'), translate = b('decision3.translate'), aloud = b('decision3.aloud'), layout = b('decision3.layout')
  const cam = camera(f, { x: 800, y: 387, z: 1 }, cues([[pick, { x: 420, y: 300, z: 1.7 }], [translate, { x: 1150, y: 380, z: 1.7 }], [layout, { x: 800, y: 387, z: 1 }]]))
  return (
    <DecisionLayout n={3} title={d.title} chips={[{ text: 'Pick your language once', at: pick }, { text: 'Translate any message', at: translate }, { text: 'Or hear it read aloud', at: aloud }, { text: 'Layouts that hold longer text', at: layout }]}>
      <Screen src={d.shots[0].src} size={[1600, 774]} box={[1000, 484]} cam={cam} enter={2} />
    </DecisionLayout>
  )
}

function Result() {
  const preferred = b('result.preferred'), material = b('result.material'), engagement = b('result.engagement')
  const [finance, offers, firstRun] = sms.result.shots!
  const cards = [
    { at: engagement - 6, value: <Count at={engagement} from={0} to={30} format={(v) => `${v}%`} />, label: 'Lift in user engagement' },
    { at: engagement + 10, value: '5+', label: 'Languages, translated or read aloud' },
    { at: engagement + 20, value: '8+', label: 'Themes to make it yours' },
    { at: engagement + 30, value: '4.5:1', label: 'Minimum text contrast' },
  ]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 160, top: 0, bottom: 0, width: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Rise at={preferred - 8} style={{ ...heading, fontSize: 56 }}>Preferred in UX Labs testing.</Rise>
        <Rise at={material - 4} style={{ ...heading, fontSize: 56, color: C.mute, marginTop: 10 }}>Shipped on a Material 3 system.</Rise>
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {cards.map((c) => (
            <Rise key={c.label} at={c.at} style={{ border: `1.5px solid ${C.line}`, borderRadius: 22, padding: '24px 30px 28px', background: 'rgba(240, 231, 230, 0.035)' }}>
              <div style={{ ...display, fontSize: 84 }}>{c.value}</div>
              <div style={{ ...body, fontSize: 24, color: C.mute, marginTop: 12 }}>{c.label}</div>
            </Rise>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1120, top: 150, width: 700, height: 780 }}>
        <Phone src={offers.src} size={[270, 569]} at={preferred + 8} style={{ left: 0, top: 130, transform: 'rotate(-6deg)' }} />
        <Phone src={firstRun.src} size={[270, 562]} at={preferred + 16} style={{ left: 420, top: 130, transform: 'rotate(6deg)' }} />
        <Phone src={finance.src} size={[300, 632]} at={preferred} style={{ left: 200, top: 40 }} />
      </div>
    </AbsoluteFill>
  )
}

function Takeaway({ scene }: SceneProps) {
  return <TakeawayCard scene={scene} lines={[{ text: sms.takeaway.line, mark: 'a migration' }]} size={88} width={1300} />
}

const glow: Record<string, [number, number]> = { hook: [18, 30], title: [80, 70], problem: [12, 62], insight: [50, 55], decision1: [80, 48], decision2: [80, 58], decision3: [80, 42], result: [74, 45], takeaway: [40, 55], end: [30, 62] }

export function Film() {
  return <FilmShell id="sms-organizer" timeline={timeline} scenes={{ hook: Hook, title: Title, problem: Problem, insight: Insight, decision1: Decision1, decision2: Decision2, decision3: Decision3, result: Result, takeaway: Takeaway, end: () => <EndCard /> }} glow={glow} accent={sms.color} name={sms.name} />
}
