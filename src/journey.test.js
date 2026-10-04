import test from 'node:test'
import assert from 'node:assert/strict'
import { initialJourney, transitionJourney, readerPageFromHash } from './journey.js'
import { readerMarkup, workIndexMarkup, scrollWorkMarkup } from './surfaces.js'
import { exhibits, exhibitAt, exhibitIndex } from './exhibits.js'

test('the visitor starts at the desk with the camera resting and off', () => {
  assert.equal(initialJourney().mode, 'desk')
  assert.equal(initialJourney().powered, false)
})

test('pickup, power, viewfinder, capture, return and putdown form a complete journey', () => {
  let state = initialJourney()
  state = transitionJourney(state, { type: 'pickup' })
  assert.equal(state.mode, 'camera')
  state = transitionJourney(state, { type: 'power' })
  state = transitionJourney(state, { type: 'viewfinder' })
  assert.equal(state.mode, 'viewfinder')
  state = transitionJourney(state, { type: 'focus', id: 'notebook' })
  state = transitionJourney(state, { type: 'capture' })
  assert.equal(state.mode, 'notebook')
  state = transitionJourney(state, { type: 'close' })
  assert.equal(state.mode, 'viewfinder')
  assert.equal(state.focus, 'notebook')
  assert.deepEqual(state.visited, ['notebook'])
  state = transitionJourney(state, { type: 'putdown' })
  assert.equal(state.mode, 'desk')
})

test('monitors and resume are usable without picking up the camera', () => {
  for (const id of ['store', 'resume', 'vr', 'sky']) {
    const opened = transitionJourney(initialJourney(), { type: 'open', id })
    assert.notEqual(opened.mode, 'desk')
    assert.equal(opened.powered, false)
    assert.equal(transitionJourney(opened, { type: 'close' }).mode, 'desk')
  }
})

test('invalid targets and powered-off capture do nothing', () => {
  const state = initialJourney()
  assert.equal(transitionJourney(state, { type: 'capture' }), state)
  assert.equal(transitionJourney(state, { type: 'focus', id: 'missing' }), state)
  assert.equal(transitionJourney(state, { type: 'open', id: 'missing' }), state)
  const camera = transitionJourney(state, { type: 'pickup' })
  assert.equal(transitionJourney(camera, { type: 'viewfinder' }), camera)
})

test('repeat captures are deduplicated and return to the viewfinder', () => {
  let state = transitionJourney(initialJourney(), { type: 'pickup' })
  state = transitionJourney(state, { type: 'power' })
  state = transitionJourney(state, { type: 'viewfinder' })
  for (let index = 0; index < 2; index += 1) {
    state = transitionJourney(state, { type: 'capture' })
    state = transitionJourney(state, { type: 'close' })
  }
  assert.equal(state.mode, 'viewfinder')
  assert.deepEqual(state.visited, ['store'])
})

test('camera playback returns to the camera and does not forget visited work', () => {
  let state = transitionJourney(initialJourney(), { type: 'pickup' })
  state = transitionJourney(state, { type: 'gallery' })
  state = transitionJourney(state, { type: 'open', id: 'copilot' })
  state = transitionJourney(state, { type: 'close' })
  assert.equal(state.mode, 'gallery')
  state = transitionJourney(state, { type: 'close' })
  assert.equal(state.mode, 'camera')
  assert.deepEqual(state.visited, ['copilot'])
})

test('switching projects preserves the return path to the camera view', () => {
  for (const mode of ['viewfinder', 'gallery']) {
    let state = { ...initialJourney(), mode, powered: true }
    state = transitionJourney(state, { type: 'open', id: 'store' })
    state = transitionJourney(state, { type: 'open', id: 'copilot' })
    state = transitionJourney(state, { type: 'open', id: 'resume' })
    assert.equal(state.returnMode, mode)
    state = transitionJourney(state, { type: 'close' })
    assert.equal(state.mode, mode)
  }
})

test('reading links resolve only supported portfolio pages', () => {
  for (const page of ['work', 'about', 'resume']) assert.equal(readerPageFromHash(`#${page}`), page)
  for (const page of ['store', 'copilot', 'hello', 'vr']) assert.equal(readerPageFromHash(`#work/${page}`), page)
  for (const hash of ['', '#missing', '#work/unknown', '#work/store/extra', '#work/<script>']) assert.equal(readerPageFromHash(hash), null)
})

test('the work overview exposes roles, results, and direct project links', () => {
  const markup = readerMarkup('work')
  for (const page of ['store', 'copilot', 'hello', 'vr']) assert.ok(markup.includes(`href="#work/${page}"`))
  assert.ok(markup.includes('Product designer / Microsoft'))
  assert.ok(markup.includes('35% to 73%'))
  assert.ok(markup.includes('New sports per cycle'))
})

test('the work catalogue includes all four projects without duplicate heading IDs', () => {
  const markup = workIndexMarkup()
  assert.equal((markup.match(/class="review-project"/g) || []).length, 4)
  assert.equal((markup.match(/<h3>/g) || []).length, 4)
  assert.ok(!markup.includes('id="'))
  assert.ok(readerMarkup('work').includes(markup))
  for (const exhibit of exhibits) assert.ok(markup.includes(`href="#work/${exhibit.id}"`))
})

test('project readers use a unique heading and provide onward navigation', () => {
  const markup = readerMarkup('store')
  assert.ok(markup.includes('id="reader-title"'))
  assert.ok(!markup.includes('id="story-title"'))
  assert.ok(markup.includes('href="#work/copilot"'))
  assert.ok(readerMarkup('resume').includes('Experience'))
})

test('the about page introduces personal interests and practice before career history', () => {
  const markup = readerMarkup('about')
  assert.ok(markup.includes('customizing'))
  assert.ok(markup.includes('same lens'))
  assert.ok(markup.includes('Photography'))
  assert.ok(markup.includes('Astronomy'))
  assert.ok(markup.includes('staying active'))
  assert.ok(markup.indexOf('<h3>Outside work</h3>') < markup.indexOf('<h3>Microsoft</h3>'))
  assert.ok(markup.indexOf('<h3>How I work</h3>') < markup.indexOf('<h3>Microsoft</h3>'))
  assert.ok(markup.includes('id="reader-title"'))
})

test('the scroll story presents each project once with a readable role, result, and direct link', () => {
  const markup = scrollWorkMarkup(exhibits)
  assert.equal((markup.match(/class="work-chapter"/g) || []).length, 4)
  for (const exhibit of exhibits) {
    assert.equal(markup.split(`id="exhibition/${exhibit.id}"`).length - 1, 1)
    assert.ok(markup.includes(`href="#work/${exhibit.id}"`))
    assert.ok(markup.includes(`data-artwork="${exhibit.id}"`))
    assert.ok(markup.includes(`aria-label="Read project: ${exhibit.label}"`))
  }
  assert.ok(markup.includes('Product designer / Microsoft'))
  assert.ok(markup.includes('35% to 73%'))
  assert.ok(markup.includes('79.5 to 83.2'))
  assert.equal((markup.match(/Original illustration, not product UI/g) || []).length, 4)
})

test('the exhibition links to existing project readers and wraps in both directions', () => {
  for (const exhibit of exhibits) {
    assert.equal(readerPageFromHash(`#work/${exhibit.id}`), exhibit.id)
    assert.equal(exhibitAt(exhibitIndex(exhibit.id)), exhibit)
  }
  assert.equal(exhibitAt(-1).id, 'vr')
  assert.equal(exhibitAt(exhibits.length).id, 'store')
  assert.equal(exhibitIndex('unknown'), 0)
})