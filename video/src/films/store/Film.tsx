import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { projects } from '../../../../src/app/lib/projects'
import { beats } from '../beats.js'
import defs from './beats.js'
import { Box, C, Count, Cursor, Outline, Rise, Screen, body, camera, display, glide, heading, tw } from '../../lib/ui'
import { Bar, DecisionLayout, EndCard, FilmShell, QuoteCard, Statement, TakeawayCard, TitleCard, line, type SceneProps, type Timeline } from '../../lib/film'
import data from './timeline.json'

const timeline = data as Timeline
const found = projects.find((p) => p.id === 'store')
if (!found || found.locked) throw new Error('Store case study missing')
const store = found
const B = beats(timeline, defs)
const b = (name: string) => B[name].frame

function Hook({ scene }: SceneProps) {
  const f = useCurrentFrame()
  const l0 = line(scene, 0), l1 = line(scene, 1)
  return (
    <AbsoluteFill style={{ padding: '0 160px', justifyContent: 'center' }}>
      <Rise at={l0 - 10} style={{ ...display, fontSize: 300 }}>
        <Count at={l0 - 8} from={0} to={35} dur={34} format={(v) => `${v}%`} />
      </Rise>
      <Rise at={l0 + 6} style={{ ...body, fontSize: 48, color: C.mute, marginTop: 34 }}>of companies that started onboarding to Microsoft Store finished.</Rise>
      <div style={{ marginTop: 84, display: 'grid', gap: 26, width: 1560 }}>
        <Bar label="Companies" value={tw(f, l0 + 18, 44, 0, 35)} at={l0 + 14} fill={`linear-gradient(90deg, ${store.color}, ${C.rose})`} />
        <Bar label="Individual developers" value={tw(f, l1, 44, 0, 90)} at={l1 - 6} fill="rgba(240, 231, 230, 0.6)" />
      </div>
    </AbsoluteFill>
  )
}

function Title() {
  return <TitleCard name={store.name} headline={store.headline} chips={[store.role, store.organization, store.timeline!]} cover={{ src: store.cover.src, size: [1600, 884], box: [1180, 652], left: 860, top: 470 }} />
}

function Problem() {
  const f = useCurrentFrame()
  const steps = store.decisions[2].flows![0].steps
  const notes: Record<number, { box: number; at: number; stat: string; text: string }> = {
    3: { box: b('problem.fee'), at: b('problem.third'), stat: '1 in 3', text: 'stopped at the $99 payment step' },
    5: { box: b('problem.progress'), at: b('problem.progress') + 6, stat: 'No status', text: 'progress was invisible' },
    6: { box: b('problem.vetting'), at: b('problem.vetting') + 4, stat: '~41%', text: 'failed during vetting' },
    7: { box: b('problem.reason'), at: b('problem.reason') + 4, stat: 'No reason', text: 'failures arrived without one' },
  }
  return (
    <AbsoluteFill style={{ padding: '150px 160px 0' }}>
      <div style={{ position: 'absolute', left: 179, top: 196, width: 2, height: 7 * 96, background: C.faint, transformOrigin: 'top', transform: `scaleY(${tw(f, 2, 40, 0, 1, glide)})` }} />
      {steps.map((step, i) => {
        const note = notes[i]
        return (
          <div key={step} style={{ height: 96, display: 'grid', gridTemplateColumns: '40px auto 1fr 650px', alignItems: 'center', columnGap: 26 }}>
            <Rise at={4 + i * 4} y={10} dur={18}><span style={{ display: 'block', width: 14, height: 14, marginLeft: 13, borderRadius: 7, background: note && f >= note.box ? C.rose : C.ink }} /></Rise>
            <Rise at={4 + i * 4} y={10} dur={18}>
              <Outline at={note ? note.box : 1e6}>
                <span style={{ ...body, display: 'inline-block', fontSize: 32, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.faint}`, color: note && f >= note.box ? C.ink : 'rgba(240, 231, 230, 0.82)', background: 'rgba(13, 12, 14, 0.5)' }}>{step}</span>
              </Outline>
            </Rise>
            <div style={{ height: 2, background: C.rose, transformOrigin: 'left', transform: `scaleX(${note ? tw(f, note.at - 6, 14) : 0})` }} />
            {note ? (
              <Rise at={note.at} y={0} dur={16} style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ ...display, fontSize: 52, letterSpacing: '-0.03em' }}>{note.stat}</span>
                <span style={{ ...body, fontSize: 28, color: C.mute }}>{note.text}</span>
              </Rise>
            ) : <span />}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

function Insight({ scene }: SceneProps) {
  const [first, second] = store.insight.split(/(?<=\.) /)
  return <Statement parts={[{ text: first, at: line(scene, 0) - 6 }, { text: second, at: line(scene, 1) - 6, mark: { phrase: second, at: b('insight.mark') + 6 } }]} />
}

function Decision1() {
  const f = useCurrentFrame()
  const d = store.decisions[0], fee = b('decision1.fee'), entra = b('decision1.entra'), explain = b('decision1.explain')
  const cam = camera(f, { x: 800, y: 400, z: 1 }, [{ at: fee - 12, to: { x: 1000, y: 380, z: 1.32 } }, { at: explain - 8, to: { x: 800, y: 400, z: 1 } }])
  return (
    <DecisionLayout n={1} title={d.title} chips={[{ text: 'No $99 fee', at: fee }, { text: 'Sign in with Microsoft Entra', at: entra }, { text: 'See what verification needs first', at: explain }]}>
      <Screen src={d.shots[0].src} size={[1600, 801]} box={[1000, 501]} cam={cam} enter={2}>
        {(map) => (
          <>
            <Box rect={map({ x: 504, y: 341, w: 1002, h: 177 })} at={fee + 16} until={explain - 8} label="Free for companies too" place="below" />
            <Box rect={map({ x: 50, y: 110, w: 310, h: 220 })} at={explain + 26} label="Every step, up front" place="below" />
          </>
        )}
      </Screen>
    </DecisionLayout>
  )
}

function Decision2() {
  const f = useCurrentFrame()
  const d = store.decisions[1], three = b('decision2.three'), doc = b('decision2.document'), prefill = b('decision2.prefill'), people = b('decision2.people')
  const cam = camera(f, { x: 800, y: 442, z: 1 }, [{ at: three - 10, to: { x: 950, y: 260, z: 1.45 } }, { at: prefill - 10, to: { x: 1000, y: 650, z: 1.3 } }])
  const scan = tw(f, prefill + 6, 44, 0, 1, glide)
  return (
    <DecisionLayout n={2} title={d.title} chips={[{ text: 'A D-U-N-S number', at: three + 4 }, { text: 'Company name and country', at: three + 10 }, { text: 'An official business document', at: three + 16 }, { text: 'AI pre-fills, people review', at: people }]}>
      <Screen src={d.shots[0].src} size={[1600, 884]} box={[1000, 553]} cam={cam} enter={2}>
        {(map) => {
          const fields = map({ x: 504, y: 610, w: 1002, h: 262 })
          return (
            <>
              <Box rect={map({ x: 504, y: 134, w: 322, h: 38 })} at={three + 8} until={doc - 4} label="Choose how to verify" place="below" />
              <Box rect={map({ x: 504, y: 306, w: 420, h: 88 })} at={doc + 4} until={prefill + 18} label="Upload a document" place="right" />
              {scan > 0 && scan < 1 ? <div style={{ position: 'absolute', left: fields.x, width: fields.w, top: fields.y + fields.h * scan - 70, height: 70, background: 'linear-gradient(180deg, rgba(240, 88, 122, 0), rgba(240, 88, 122, 0.3))', borderBottom: `2px solid ${C.rose}` }} /> : null}
              <Box rect={map({ x: 504, y: 413, w: 1002, h: 42 })} at={prefill + 30} label="Details pre-filled for review" place="below" />
            </>
          )
        }}
      </Screen>
    </DecisionLayout>
  )
}

function Decision3() {
  const f = useCurrentFrame()
  const d = store.decisions[2], email = b('decision3.email'), live = b('decision3.live'), reason = b('decision3.reason'), fix = b('decision3.fix')
  const cam = camera(f, { x: 800, y: 442, z: 1 }, [{ at: email - 12, to: { x: 1000, y: 300, z: 1.38 } }])
  const swap = tw(f, reason - 6, 16, 0, 1, glide)
  const size: [number, number] = [1600, 884], box: [number, number] = [1000, 553]
  return (
    <DecisionLayout n={3} title={d.title} chips={[{ text: 'Email and domain checked up front', at: email + 4 }, { text: 'Live status, with a clear reason', at: live + 4 }, { text: 'Fix it without starting over', at: fix + 4 }]}>
      <div style={{ position: 'relative' }}>
        <Screen src={store.cover.src} size={size} box={box} cam={cam} enter={2} opacity={swap < 1 ? 1 : 0}>
          {(map) => swap < 1 ? (
            <>
              <Box rect={map({ x: 520, y: 250, w: 970, h: 50 })} at={email + 6} until={live + 2} label="Checked before you submit" />
              <Box rect={map({ x: 1384, y: 322, w: 98, h: 90 })} at={live + 4} label="Live status" place="below" />
            </>
          ) : null}
        </Screen>
        <div style={{ position: 'absolute', inset: 0, opacity: swap }}>
          <Screen src={d.shots[0].src} size={size} box={box} cam={cam} enter={-200}>
            {(map) => {
              const button = map({ x: 1320, y: 317, w: 163, h: 37 })
              const target: [number, number] = [button.x + button.w * 0.45, button.y + button.h * 0.6]
              return (
                <>
                  <Box rect={map({ x: 520, y: 312, w: 400, h: 50 })} at={reason + 12} label="A clear reason" place="right" />
                  <Box rect={button} at={fix + 10} label="Fix it in the flow" place="below" />
                  <Cursor from={[target[0] + 120, target[1] + 160]} to={target} at={fix - 28} click={fix} />
                </>
              )
            }}
          </Screen>
        </div>
      </div>
    </DecisionLayout>
  )
}

function Result() {
  const pilot = b('result.pilot'), rollout = b('result.rollout'), success = b('result.success'), vetting = b('result.vetting')
  const cards = [
    { at: success - 6, over: 'Onboarding success', value: <Count at={success} from={35} to={73} format={(v) => `${v}%`} />, sub: 'up from 35%' },
    { at: vetting - 6, over: 'Average vetting time', value: <Count at={vetting} from={15} to={1} format={(v) => `~${v} day${v === 1 ? '' : 's'}`} />, sub: 'down from ~15 days' },
    { at: vetting + 18, over: 'Companies onboarded', value: '240+', sub: 'in the 50-country pilot' },
    { at: vetting + 30, over: 'Vetting success', value: '80%+', sub: 'held through the change' },
  ]
  return (
    <AbsoluteFill style={{ padding: '180px 160px 0' }}>
      <div style={{ ...heading, fontSize: 66 }}>
        <Rise at={pilot - 8}>Piloted in 50 countries.</Rise>
        <Rise at={rollout - 4} style={{ color: C.mute }}>Then every Store market.</Rise>
      </div>
      <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {cards.map((c) => (
          <Rise key={c.over} at={c.at} style={{ border: `1.5px solid ${C.line}`, borderRadius: 24, padding: '30px 38px 34px', background: 'rgba(240, 231, 230, 0.035)' }}>
            <div style={{ ...body, fontSize: 27, color: C.mute }}>{c.over}</div>
            <div style={{ ...display, fontSize: 108, marginTop: 16 }}>{c.value}</div>
            <div style={{ ...body, fontSize: 27, color: C.mute, marginTop: 14 }}>{c.sub}</div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Quote() {
  const q = store.result.quote!
  const excerpt = 'From start to finish it took me less than 30 minutes to have a fully vetted business account, ready to go.'
  if (!q.text.includes(excerpt)) throw new Error('Quote excerpt no longer matches the case study')
  const [by, detail] = q.source.split(', ')
  return <QuoteCard text={excerpt} highlight="less than 30 minutes" by={by} detail={detail} />
}

function Takeaway({ scene }: SceneProps) {
  const [first, second] = store.takeaway.line.split(/(?<=\.) /)
  return <TakeawayCard scene={scene} lines={[{ text: first }, { text: second, mark: 'absorbs it' }]} />
}

const glow: Record<string, [number, number]> = { hook: [18, 30], title: [78, 80], problem: [10, 70], insight: [50, 55], decision1: [82, 45], decision2: [80, 62], decision3: [82, 38], result: [50, 22], quote: [24, 46], takeaway: [70, 52], end: [30, 62] }

export function Film() {
  return <FilmShell id="store" timeline={timeline} scenes={{ hook: Hook, title: Title, problem: Problem, insight: Insight, decision1: Decision1, decision2: Decision2, decision3: Decision3, result: Result, quote: Quote, takeaway: Takeaway, end: () => <EndCard /> }} glow={glow} accent={store.color} name={store.name} />
}
