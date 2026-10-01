import { AbsoluteFill, Img, useCurrentFrame } from 'remotion'
import { projects } from '../../../../src/app/lib/projects'
import { beats } from '../beats.js'
import defs from './beats.js'
import { Box, C, Count, Rise, Screen, body, chip, display, glide, heading, tw } from '../../lib/ui'
import { Bar, DecisionLayout, EndCard, FilmShell, Statement, TakeawayCard, TitleCard, floating, line, type SceneProps, type Timeline } from '../../lib/film'
import data from './timeline.json'

const timeline = data as Timeline
const found = projects.find((p) => p.id === 'copilot')
if (!found || found.locked) throw new Error('Copilot case study missing')
const copilot = found
const B = beats(timeline, defs)
const b = (name: string) => B[name].frame

function Hook({ scene }: SceneProps) {
  const f = useCurrentFrame()
  const l0 = line(scene, 0), now = b('hook.now')
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0 - 10} style={{ ...display, fontSize: 300 }}>
        <Count at={l0 - 8} from={0} to={50} dur={34} format={(v) => `${v}%`} />
      </Rise>
      <Rise at={l0 + 6} style={{ ...body, fontSize: 48, color: C.mute, marginTop: 34 }}>of sports searches happen while the game is live.</Rise>
      <Rise at={now - 10} style={{ ...body, fontSize: 30, color: C.mute, marginTop: 72 }}>Fans who used generative AI</Rise>
      <div style={{ marginTop: 22, display: 'grid', gap: 26, width: 1560 }}>
        <Bar label="In 2025" value={tw(f, now, 40, 0, 52)} at={now - 6} fill={`linear-gradient(90deg, ${copilot.color}, ${C.rose})`} />
        <Bar label="Earlier" value={tw(f, now + 12, 40, 0, 31)} at={now + 6} fill="rgba(240, 231, 230, 0.6)" />
      </div>
    </AbsoluteFill>
  )
}

function Title() {
  return <TitleCard name={copilot.name} headline={copilot.headline} chips={[copilot.role, copilot.organization, copilot.timeline!]} cover={{ src: copilot.cover.src, size: [1400, 1447], box: [600, 620], left: 1200, top: 470 }} />
}

function Problem() {
  const before = copilot.decisions[0].shots[0], scores = b('problem.scores'), text = b('problem.text')
  return (
    <DecisionLayout kicker="Before" title="The answer was still mostly text." chips={[{ text: 'Scores, teams and match state were in the data', at: scores }, { text: 'Fans still got a paragraph', at: text }]}>
      <Screen src={before.src} size={[880, 588]} box={[1000, 668]} cam={{ x: 440, y: 294, z: 1 }} enter={2}>
        {(map) => <Box rect={map({ x: 60, y: 108, w: 680, h: 452 })} at={text + 4} label="A text answer" />}
      </Screen>
    </DecisionLayout>
  )
}

function Insight({ scene }: SceneProps) {
  const [first, second] = copilot.insight.split(/(?<=\.) /)
  return <Statement parts={[{ text: first, at: line(scene, 0) - 6 }, { text: second, at: line(scene, 1) - 6, mark: { phrase: second, at: b('insight.mark') + 6 } }]} />
}

// Before/after: the card wipes in over the text answer, like the compare slider on the case study.
function Decision1() {
  const f = useCurrentFrame()
  const d = copilot.decisions[0], [before, after] = d.shots
  const hierarchy = b('decision1.hierarchy'), glance = b('decision1.glance'), deeper = b('decision1.deeper')
  const wipe = tw(f, hierarchy - 2, 44, 0, 1, glide)
  const box: [number, number] = [1000, 668], cam = { x: 440, y: 294, z: 1 }
  return (
    <DecisionLayout n={1} title={d.title} chips={[{ text: 'Structure the data already had', at: hierarchy }, { text: 'The answer at a glance', at: glance }, { text: 'More for fans who want it', at: deeper }]}>
      <div style={{ position: 'relative', width: box[0], height: box[1] }}>
        <Screen src={before.src} size={[880, 588]} box={box} cam={cam} enter={2} />
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)` }}>
          <Screen src={after.src} size={[880, 588]} box={box} cam={cam} enter={-200}>
            {(map) => (
              <>
                <Box rect={map({ x: 47, y: 168, w: 770, h: 180 })} at={glance + 4} until={deeper} label="The answer, at a glance" />
                <Box rect={map({ x: 47, y: 360, w: 770, h: 215 })} at={deeper + 4} label="More when you want it" />
              </>
            )}
          </Screen>
        </div>
        {wipe > 0 && wipe < 1 ? <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(1 - wipe) * 100}%`, width: 3, marginLeft: -1, background: C.rose, boxShadow: '0 0 24px rgba(240, 88, 122, 0.8)' }} /> : null}
      </div>
    </DecisionLayout>
  )
}

function Decision2() {
  const d = copilot.decisions[1], [f1, tennis, cricket, nfl] = d.shots
  const shared = b('decision2.shared'), sport = b('decision2.sport'), mapping = b('decision2.mapping')
  const cards = [
    { shot: cricket, at: b('decision2.cricket'), tag: 'Overs and run rates' },
    { shot: tennis, at: b('decision2.tennis'), tag: 'Sets and tiebreaks' },
    { shot: f1, at: b('decision2.f1'), tag: 'Laps and pit windows' },
    { shot: nfl, at: b('decision2.nfl'), tag: 'Downs' },
  ]
  const w = 488, h = Math.round(w / 1.441)
  return (
    <DecisionLayout n={2} title={d.title} chips={[{ text: 'A shared layer for how a card reads', at: shared }, { text: 'A sport layer for what matters', at: sport }, { text: 'A new sport is data mapping', at: mapping }]}>
      <div style={{ position: 'relative', width: 1000, display: 'grid', gridTemplateColumns: `${w}px ${w}px`, gap: 24 }}>
        {cards.map((c) => (
          <Rise key={c.tag} at={c.at - 4} y={30} dur={22}>
            <div style={{ ...floating, width: w, height: h }}><Img src={c.shot.src} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
            <Rise at={sport + 4} y={8} dur={14} style={{ marginTop: 12 }}><span style={chip}>{c.tag}</span></Rise>
          </Rise>
        ))}
        <Box rect={{ x: 0, y: 0, w: 1000, h: 2 * (h + 50) + 24 }} at={shared + 4} until={sport} label="One reading model" />
      </div>
    </DecisionLayout>
  )
}

function Decision3() {
  const f = useCurrentFrame()
  const d = copilot.decisions[2]
  const pre = b('decision3.pre'), edge = b('decision3.edge'), overs = b('decision3.overs')
  const states = [{ shot: d.shots[0], at: 2, label: 'Pre-game' }, { shot: d.shots[1], at: b('decision3.live'), label: 'Live' }, { shot: d.shots[2], at: b('decision3.post'), label: 'Post-game' }]
  const front = states.filter((s) => f >= s.at).length - 1
  const edges = [['Rain delays', b('decision3.rain')], ['Red flags', b('decision3.flags')], ['Super overs', overs], ['40-character names', overs + 10], ['Dense stats', overs + 18]] as const
  const w = 820
  return (
    <DecisionLayout n={3} title={d.title} chips={[{ text: 'Pre-game, live and post-game', at: pre }, { text: 'Edge cases that break layouts', at: edge }, { text: 'Light and dark, desktop and mobile', at: overs + 26 }]}>
      <div style={{ position: 'relative', width: 1000, height: 820 }}>
        {states.map((s, i) => {
          const enter = tw(f, s.at - 4, 24)
          const depth = states.slice(i + 1).reduce((sum, n) => sum + tw(f, n.at - 4, 24), 0)
          return (
            <div key={s.label} style={{ position: 'absolute', left: (1000 - w) / 2, top: 110 - depth * 48 + (1 - enter) * 90, width: w, opacity: enter * (1 - depth * 0.3), transform: `scale(${1 - depth * 0.06})`, transformOrigin: 'top center' }}>
              {/* The cards are translucent glass; show them on Copilot's light canvas, as they ship. */}
              <div style={{ ...floating, width: w, padding: 18, background: '#f9f3f0' }}><Img src={s.shot.src} style={{ width: '100%', display: 'block' }} /></div>
            </div>
          )
        })}
        <Rise at={pre - 6} style={{ position: 'absolute', left: 90, top: 680, display: 'flex', gap: 10 }}>
          {states.map((s, i) => (
            <span key={s.label} style={{ ...body, fontSize: 24, fontWeight: 600, padding: '8px 16px', borderRadius: 999, border: `1.5px solid ${i === front ? C.rose : C.faint}`, color: i === front ? C.ink : C.mute, background: i === front ? 'rgba(240, 88, 122, 0.16)' : 'transparent' }}>{s.label}</span>
          ))}
        </Rise>
        <div style={{ position: 'absolute', left: 90, top: 750, display: 'flex', flexWrap: 'wrap', gap: 10, width: 860 }}>
          {edges.map(([label, at]) => <Rise key={label} at={at} y={10} dur={14}><span style={chip}>{label}</span></Rise>)}
        </div>
      </div>
    </DecisionLayout>
  )
}

function Result() {
  const four = b('result.four'), redesign = b('result.redesign'), shell = b('result.shell')
  const shot = copilot.result.shots![0]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 160, top: 0, bottom: 0, width: 760, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Rise at={four - 8} style={{ ...heading, fontSize: 54 }}>Shipped across four sports.</Rise>
        <Rise at={redesign - 4} style={{ ...heading, fontSize: 54, color: C.mute, marginTop: 10 }}>Carried straight into<br />Copilot’s 2026 redesign.</Rise>
        <div style={{ marginTop: 54, display: 'grid', gap: 18 }}>
          {copilot.result.changes!.map(([from, to], i) => (
            <Rise key={from} at={four + 18 + i * 8} y={12} dur={16} style={{ ...body, fontSize: 27, display: 'grid', gridTemplateColumns: '1fr 44px 1fr', alignItems: 'center' }}>
              <span style={{ color: C.mute }}>{from}</span>
              <span style={{ color: C.rose }}>→</span>
              <span style={{ fontWeight: 620 }}>{to}</span>
            </Rise>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 990, top: '50%', transform: 'translateY(-50%)' }}>
        <Screen src={shot.src} size={[1134, 974]} box={[780, 670]} cam={{ x: 567, y: 487, z: 1 }} enter={6}>
          {(map) => <Box rect={map({ x: 45, y: 228, w: 1043, h: 716 })} at={shell + 4} label="Same cards, new shell" />}
        </Screen>
      </div>
    </AbsoluteFill>
  )
}

function Takeaway({ scene }: SceneProps) {
  return <TakeawayCard scene={scene} lines={[{ text: copilot.takeaway.line, mark: 'a system property' }]} size={88} width={1240} />
}

const glow: Record<string, [number, number]> = { hook: [18, 30], title: [78, 80], problem: [82, 45], insight: [50, 55], decision1: [80, 50], decision2: [76, 42], decision3: [80, 62], result: [70, 40], takeaway: [40, 55], end: [30, 62] }

export function Film() {
  return <FilmShell id="copilot" timeline={timeline} scenes={{ hook: Hook, title: Title, problem: Problem, insight: Insight, decision1: Decision1, decision2: Decision2, decision3: Decision3, result: Result, takeaway: Takeaway, end: () => <EndCard /> }} glow={glow} accent={copilot.color} name={copilot.name} />
}
