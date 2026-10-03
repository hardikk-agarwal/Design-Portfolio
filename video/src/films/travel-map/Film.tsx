import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { projects } from '../../../../src/app/lib/projects'
import { beats } from '../beats.js'
import defs from './beats.js'
import { C, Count, Mark, Rise, Screen, body, camera, cues, display, heading } from '../../lib/ui'
import { DecisionLayout, EndCard, FilmShell, Statement, TakeawayCard, TitleCard, line, typo, type SceneProps, type Timeline } from '../../lib/film'
import data from './timeline.json'

const timeline = data as Timeline
const found = projects.find((p) => p.id === 'travel-map')
if (!found || found.locked) throw new Error('Travel Map case study missing')
const travel = found
const B = beats(timeline, defs)
const b = (name: string) => B[name].frame

function Hook({ scene }: SceneProps) {
  const l0 = line(scene, 0), quote = b('hook.quote')
  const q = travel.problem.quote!, highlight = 'feasibility is important'
  const [before, after] = q.text.split(highlight)
  if (after === undefined) throw new Error('Quote highlight no longer matches the case study')
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0 - 10} style={{ ...display, fontSize: 300 }}>
        <Count at={l0 - 8} from={0} to={68} dur={34} format={(v) => `${v}%`} />
      </Rise>
      <Rise at={l0 + 6} style={{ ...body, fontSize: 48, color: C.mute, marginTop: 34 }}>click rate on maps across UX Labs studies.</Rise>
      <Rise at={quote - 6} style={{ marginTop: 70, maxWidth: 1300, borderLeft: `3px solid ${C.rose}`, paddingLeft: 30 }}>
        <div style={{ ...heading, fontSize: 40, fontWeight: 560 }}>“{before}<Mark at={quote + 50} dur={18}>{highlight}</Mark>{after}”</div>
        <div style={{ ...body, fontSize: 24, color: C.mute, marginTop: 16 }}>{q.source}</div>
      </Rise>
    </AbsoluteFill>
  )
}

function Title() {
  return <TitleCard name={travel.name} headline={travel.headline} size={140} chips={[travel.role, travel.organization, travel.timeline!]} cover={{ src: travel.cover.src, size: [1600, 950], box: [1180, 701], left: 860, top: 470 }} />
}

// The old way to plan, one tab at a time, then the two gaps the map couldn't fill.
function Problem({ scene }: SceneProps) {
  const flow = travel.decisions[1].flows![0], l0 = line(scene, 0), start = b('problem.switch')
  const step = (l0 + scene.lines[0].duration - start) / flow.steps.length
  const gaps = [['No way to narrow the map to what mattered', b('problem.filter')], ['Little help deciding where to go at all', b('problem.help')]] as const
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0 - 6} style={{ ...body, fontSize: 26, fontWeight: 620, color: C.rose, letterSpacing: '0.04em' }}>{flow.label}</Rise>
      <div style={{ marginTop: 34, display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: 18 }}>
        {flow.steps.map((s, i) => (
          <Rise key={s} at={start + i * step} y={14} dur={16} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 ? <span style={{ ...body, fontSize: 30, color: C.mute, margin: '0 14px' }}>→</span> : null}
            <span style={{ ...body, display: 'inline-block', fontSize: 30, padding: '12px 22px', borderRadius: 999, border: `1.5px solid ${C.faint}`, background: 'rgba(13, 12, 14, 0.5)' }}>{s}</span>
          </Rise>
        ))}
      </div>
      <div style={{ marginTop: 90, display: 'grid', gap: 26 }}>
        {gaps.map(([text, at]) => (
          <Rise key={text} at={at} y={14} dur={16} style={{ ...heading, fontSize: 54, display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ width: 30, height: 3, background: C.rose, flex: 'none' }} />{typo(text)}
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Insight({ scene }: SceneProps) {
  const [first, second] = travel.insight.split(/(?<=\.) /)
  return <Statement parts={[{ text: first, at: line(scene, 0) - 6 }, { text: second, at: line(scene, 1) - 6, mark: { phrase: second, at: b('insight.mark') + 6 } }]} />
}

// Annotated board: continents in the Explore panel, then trips nearby, then the destination themes.
function Decision1() {
  const f = useCurrentFrame()
  const d = travel.decisions[0], continent = b('decision1.continent'), nearby = b('decision1.nearby'), themes = b('decision1.themes')
  const cam = camera(f, { x: 800, y: 449, z: 1 }, cues([[continent, { x: 420, y: 520, z: 1.6 }], [nearby, { x: 420, y: 200, z: 1.6 }], [themes, { x: 420, y: 700, z: 1.6 }]]))
  return (
    <DecisionLayout n={1} title={d.title} chips={[{ text: 'Destinations by continent', at: continent }, { text: 'Trips nearby, priced from you', at: nearby }, { text: 'Themes narrow the field', at: themes }]}>
      <Screen src={d.shots[0].src} size={[1600, 897]} box={[1000, 561]} cam={cam} enter={2} />
    </DecisionLayout>
  )
}

function Decision2() {
  const f = useCurrentFrame()
  const d = travel.decisions[1], search = b('decision2.search'), pins = b('decision2.pins'), distance = b('decision2.distance')
  const cam = camera(f, { x: 800, y: 434, z: 1 }, cues([[search, { x: 400, y: 280, z: 1.6 }], [pins, { x: 1150, y: 430, z: 1.5 }], [distance, { x: 800, y: 434, z: 1 }]]))
  return (
    <DecisionLayout n={2} title={d.title} chips={[{ text: 'One search for everything', at: search }, { text: 'Every vertical pinned', at: pins }, { text: 'Distance in view', at: distance }]}>
      <Screen src={d.shots[0].src} size={[1600, 869]} box={[1000, 543]} cam={cam} enter={2} />
    </DecisionLayout>
  )
}

// The filter board is a grid of map states; the camera steps through them as each filter is named.
function Decision3() {
  const f = useCurrentFrame()
  const d = travel.decisions[2], pins = b('decision3.pins'), attractions = b('decision3.attractions'), stays = b('decision3.stays'), restaurants = b('decision3.restaurants'), transit = b('decision3.transit')
  const cam = camera(f, { x: 800, y: 626, z: 1 }, cues([[pins, { x: 330, y: 330, z: 1.9 }], [attractions, { x: 860, y: 330, z: 1.9 }], [stays, { x: 1300, y: 330, z: 1.9 }], [restaurants, { x: 330, y: 950, z: 1.9 }], [transit, { x: 1300, y: 950, z: 1.9 }]], 6, 22))
  return (
    <DecisionLayout n={3} title={d.title} chips={[{ text: 'Attractions', at: attractions }, { text: 'Stays', at: stays }, { text: 'Restaurants, with a heat map of demand', at: restaurants }, { text: 'Transit to get around', at: transit }]}>
      <Screen src={d.shots[0].src} size={[1600, 1253]} box={[1000, 783]} cam={cam} enter={2} />
    </DecisionLayout>
  )
}

function Result() {
  const wild = b('result.wild'), tested = b('result.tested'), mvp = b('result.mvp')
  const shot = travel.result.shots![0]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 160, top: 0, bottom: 0, width: 780, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Rise at={wild - 8} style={{ ...heading, fontSize: 54 }}>Explored from mild to wild.</Rise>
        <Rise at={mvp - 4} style={{ ...heading, fontSize: 54, color: C.mute, marginTop: 10 }}>Prioritized into an MVP.</Rise>
        <div style={{ marginTop: 54, display: 'grid', gap: 18 }}>
          {travel.result.changes!.map(([from, to], i) => (
            <Rise key={from} at={tested + i * 10} y={12} dur={16} style={{ ...body, fontSize: 27, display: 'grid', gridTemplateColumns: '1fr 44px 1fr', alignItems: 'center' }}>
              <span style={{ color: C.mute }}>{from}</span>
              <span style={{ color: C.rose }}>→</span>
              <span style={{ fontWeight: 620 }}>{to}</span>
            </Rise>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1000, top: '50%', transform: 'translateY(-50%)' }}>
        <Screen src={shot.src} size={[1600, 955]} box={[780, 466]} cam={{ x: 800, y: 478, z: 1 }} enter={wild} />
      </div>
    </AbsoluteFill>
  )
}

function Takeaway({ scene }: SceneProps) {
  return <TakeawayCard scene={scene} lines={[{ text: travel.takeaway.line, mark: 'let the team decide what ships' }]} size={88} width={1300} />
}

const glow: Record<string, [number, number]> = { hook: [18, 30], title: [78, 80], problem: [12, 62], insight: [50, 55], decision1: [80, 50], decision2: [80, 44], decision3: [80, 58], result: [70, 42], takeaway: [40, 55], end: [30, 62] }

export function Film() {
  return <FilmShell id="travel-map" timeline={timeline} scenes={{ hook: Hook, title: Title, problem: Problem, insight: Insight, decision1: Decision1, decision2: Decision2, decision3: Decision3, result: Result, takeaway: Takeaway, end: () => <EndCard /> }} glow={glow} accent={travel.color} name={travel.name} />
}
