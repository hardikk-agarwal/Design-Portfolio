import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { projects } from '../../../../src/app/lib/projects'
import { beats } from '../beats.js'
import defs from './beats.js'
import { C, Count, Mark, Rise, body, camera, display, heading, tw, type Cam } from '../../lib/ui'
import { DecisionLayout, EndCard, FilmShell, Statement, TakeawayCard, TitleCard, floating, line, type SceneProps, type Timeline } from '../../lib/film'
import data from './timeline.json'

const timeline = data as Timeline
const found = projects.find((p) => p.id === 'craft-check')
if (!found || found.locked) throw new Error('Craft Check case study missing')
const craft = found
const B = beats(timeline, defs)
const b = (name: string) => B[name].frame

// Hardik's FHL demo (video/public, kept out of git). The app sits at x 150-1769, y 79-1029 of the frame;
// APP frames it without the browser tabs and taskbar.
const DEMO: [number, number] = [1920, 1080]
const APP: Cam = { x: 960, y: 554, z: 1.185 }
const BOX: [number, number] = [1000, 563]
const card: CSSProperties = { border: `1.5px solid ${C.faint}`, borderRadius: 22, background: 'rgba(240, 231, 230, 0.035)' }

// A stretch of the recording, stretched to `frames` and framed by `cam` (source pixels, as Screen does for stills).
function Clip({ from, to, frames, cam = APP }: { from: number; to: number; frames: number; cam?: Cam }) {
  const f = useCurrentFrame()
  const [w, h] = BOX, [sw, sh] = DEMO
  const p = tw(f, 2, 26)
  const k = (w / sw) * cam.z
  const tx = Math.min(0, Math.max(w - sw * k, w / 2 - cam.x * k))
  const ty = Math.min(0, Math.max(h - sh * k, h / 2 - cam.y * k))
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#000', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, boxShadow: '0 50px 140px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(240, 231, 230, 0.09)' }}>
      <Sequence from={2} layout="none">
        <OffthreadVideo src={staticFile('craft-check-demo.mp4')} trimBefore={Math.round(from * 30)} trimAfter={Math.round(to * 30)} playbackRate={((to - from) * 30) / frames} muted style={{ position: 'absolute', left: 0, top: 0, width: sw, height: sh, maxWidth: 'none', transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${k})` }} />
      </Sequence>
    </div>
  )
}

// Source second -> scene frame for a clip of `frames` frames that starts at frame 2.
const at = (from: number, to: number, frames: number) => (s: number) => 2 + Math.round(((s - from) / (to - from)) * frames)

function Hook({ scene }: SceneProps) {
  const l0 = line(scene, 0), count = b('hook.count'), kinds = b('hook.kinds'), eye = b('hook.eye')
  const chips = ['Line heights', 'Spacing', 'Loaders', 'Dark-mode colors']
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0} style={{ ...body, fontSize: 30, fontWeight: 620, color: C.rose, letterSpacing: '0.04em' }}>One Microsoft Store launch</Rise>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-end', gap: 44 }}>
        <Rise at={count - 10} style={{ ...display, fontSize: 250 }}>
          <Count at={count - 8} from={0} to={400} dur={38} />
        </Rise>
        <Rise at={count + 8} style={{ ...body, fontSize: 42, color: C.mute, maxWidth: 760, paddingBottom: 26 }}>craft and implementation issues I surfaced in review</Rise>
      </div>
      <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
        {chips.map((text, i) => (
          <Rise key={text} at={kinds + i * 9} y={14} dur={16}>
            <span style={{ ...body, display: 'inline-block', fontSize: 30, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.faint}`, background: 'rgba(13, 12, 14, 0.5)' }}>{text}</span>
          </Rise>
        ))}
      </div>
      <Rise at={eye - 6} style={{ ...heading, fontSize: 64, marginTop: 80 }}>
        Found by eye, <Mark at={eye + 22} dur={20}>after the feature was built.</Mark>
      </Rise>
    </AbsoluteFill>
  )
}

function Title() {
  return <TitleCard name={craft.name} headline={craft.headline} chips={[craft.team, 'Microsoft', craft.timeline!]} cover={{ src: craft.cover.src, size: [1620, 950], box: [1150, 674], left: 860, top: 470 }} />
}

function Problem() {
  const steps = [['Spot the mismatch', b('problem.spot')], ['Screenshot it', b('problem.shot')], ['Write it up', b('problem.write')], ['File a bug', b('problem.file')], ['Check the fix', b('problem.fix')]] as const
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={steps[0][1] - 16} style={{ ...body, fontSize: 26, fontWeight: 620, color: C.rose, letterSpacing: '0.04em' }}>For every issue, by hand</Rise>
      <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {steps.map(([text, beat], i) => (
          <Rise key={text} at={beat - 4} y={12} dur={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ ...body, display: 'inline-block', fontSize: 32, padding: '14px 26px', borderRadius: 999, border: `1.5px solid ${C.faint}`, background: 'rgba(13, 12, 14, 0.5)' }}>{text}</span>
            {i < steps.length - 1 ? <span style={{ ...body, fontSize: 30, color: C.mute }}>→</span> : null}
          </Rise>
        ))}
      </div>
      <Rise at={b('problem.scatter') - 6} style={{ ...heading, fontSize: 58, marginTop: 90 }}>Scattered across Figma, Loop and the bug tracker.</Rise>
      <Rise at={b('problem.gate') - 6} style={{ ...heading, fontSize: 58, marginTop: 14, color: C.mute }}>And the designer stayed the last quality gate.</Rise>
    </AbsoluteFill>
  )
}

function Insight({ scene }: SceneProps) {
  const [first, second] = craft.insight.split(/(?<=\.) /)
  return <Statement parts={[{ text: first, at: line(scene, 0) - 6 }, { text: second, at: line(scene, 1) - 6, mark: { phrase: 'just need measuring', at: b('insight.mark') + 8 } }]} />
}

// Upload the design and the build, then run: 92-108 s of the recording.
function Decision1({ scene }: SceneProps) {
  const frames = scene.duration - 4
  return (
    <DecisionLayout n={1} title={craft.decisions[0].title} chips={[{ text: 'Before anyone signs off', at: b('decision1.before') }, { text: 'Drop in the design and the build', at: b('decision1.drop') }, { text: 'Run it', at: b('decision1.run') }, { text: 'No setup: two screenshots', at: b('decision1.two') }]}>
      <Clip from={92} to={108} frames={frames} />
    </DecisionLayout>
  )
}

// The check running, then the results: 106-129 s.
function Decision2({ scene }: SceneProps) {
  const frames = scene.duration - 4
  return (
    <DecisionLayout n={2} title={craft.decisions[1].title} chips={[{ text: 'Two engines per check', at: b('decision2.engines') }, { text: 'Pixel diff: exact hex colors', at: b('decision2.pixel') }, { text: 'AI vision: copy, spacing, missing elements', at: b('decision2.ai') }]}>
      <Clip from={106} to={129} frames={frames} />
    </DecisionLayout>
  )
}

// Results read up close, hover sync across both panels, then the type filters: 129-158 s.
function Decision3({ scene }: SceneProps) {
  const f = useCurrentFrame()
  const frames = scene.duration - 4, t = at(129, 158, frames)
  const cam = camera(f, APP, [
    { at: b('decision3.property') - 10, dur: 30, to: { x: 560, y: 420, z: 2 } },
    { at: Math.max(b('decision3.hover') - 8, t(137)), dur: 30, to: APP },
    { at: b('decision3.filter') - 4, dur: 30, to: { x: 600, y: 300, z: 2.2 } },
  ])
  return (
    <DecisionLayout n={3} title={craft.decisions[2].title} chips={[{ text: 'Property, design value, built value', at: b('decision3.property') }, { text: 'Hover to see where', at: b('decision3.hover') }, { text: 'Filter by type', at: b('decision3.filter') }]}>
      <Clip from={129} to={158} frames={frames} cam={cam} />
    </DecisionLayout>
  )
}

// The toolbar's Azure DevOps action, then the issues pasted into Loop: 150.5-171 s.
function Decision4({ scene }: SceneProps) {
  const f = useCurrentFrame()
  const frames = scene.duration - 4, t = at(150.5, 171, frames)
  const cam = camera(f, APP, [
    { at: t(158.5), dur: 26, to: { x: 760, y: 250, z: 2.2 } },
    { at: t(165), dur: 26, to: APP },
  ])
  return (
    <DecisionLayout n={4} title={craft.decisions[3].title} chips={[{ text: 'Straight into the team’s workflow', at: b('decision4.flow') }, { text: 'A pre-filled Azure DevOps bug', at: b('decision4.ado') }, { text: 'Or a ready table in Loop', at: b('decision4.loop') }]}>
      <Clip from={150.5} to={171} frames={frames} cam={cam} />
    </DecisionLayout>
  )
}

function Result() {
  const own = b('result.own'), server = b('result.server'), tokens = b('result.tokens'), fhl = b('result.fhl'), next = b('result.next')
  const cards: { at: number; value: ReactNode; label: string }[] = [
    { at: own, value: 'Web app', label: 'React with Fluent UI' },
    { at: server, value: 'Server', label: 'Runs both engines' },
    { at: tokens, value: 'CLI', label: 'Figma tokens vs CSS, SCSS and XAML' },
    { at: fhl, value: 'FHL', label: 'Microsoft hackathon, March 2026' },
  ]
  const road = [['Now', 'The core QA loop'], ['Next', 'Direct Figma integration'], ['Then', 'A check before every merge']]
  const loop = craft.decisions[3].shots[1]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 160, top: 0, bottom: 0, width: 900, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Rise at={own - 8} style={{ ...heading, fontSize: 56 }}>Built on my own, with AI.</Rise>
        <div style={{ marginTop: 46, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {cards.map((c) => (
            <Rise key={c.label} at={c.at} style={{ ...card, padding: '22px 28px 26px' }}>
              <div style={{ ...display, fontSize: 64 }}>{c.value}</div>
              <div style={{ ...body, fontSize: 24, color: C.mute, marginTop: 12 }}>{c.label}</div>
            </Rise>
          ))}
        </div>
        <div style={{ marginTop: 44, display: 'flex', gap: 14, alignItems: 'center' }}>
          {road.map(([when, what], i) => (
            <Rise key={when} at={next + i * 16} y={12} dur={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ ...body, fontSize: 24, padding: '10px 18px', borderRadius: 999, border: `1.5px solid ${i ? C.faint : C.rose}` }}><span style={{ fontWeight: 650 }}>{when}:</span> {what}</span>
              {i < road.length - 1 ? <span style={{ ...body, fontSize: 26, color: C.mute }}>→</span> : null}
            </Rise>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1130, top: 260, transform: 'rotate(3deg)' }}>
        <Rise at={own} y={50} dur={28}><Img src={loop.src} style={{ display: 'block', width: 680, ...floating }} /></Rise>
      </div>
    </AbsoluteFill>
  )
}

function Takeaway({ scene }: SceneProps) {
  return <TakeawayCard scene={scene} lines={[{ text: scene.lines[0].text, mark: 'judgment' }]} size={88} width={1400} />
}

const glow: Record<string, [number, number]> = { hook: [22, 40], title: [78, 68], problem: [14, 60], insight: [50, 55], decision1: [78, 50], decision2: [80, 56], decision3: [80, 45], decision4: [80, 55], result: [72, 45], takeaway: [40, 55], end: [30, 62] }

export function Film() {
  return <FilmShell id="craft-check" timeline={timeline} scenes={{ hook: Hook, title: Title, problem: Problem, insight: Insight, decision1: Decision1, decision2: Decision2, decision3: Decision3, decision4: Decision4, result: Result, takeaway: Takeaway, end: () => <EndCard /> }} glow={glow} accent={craft.color} name={craft.name} />
}
