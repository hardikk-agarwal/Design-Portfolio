import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRoute, routeKey, routeTitle } from './routes.js'

test('reading routes stay compatible with the previous portfolio', () => {
  assert.deepEqual(parseRoute('#work'), { page: 'work' })
  assert.deepEqual(parseRoute('#about'), { page: 'about' })
  assert.deepEqual(parseRoute('#resume'), { page: 'resume' })
  assert.deepEqual(parseRoute('#work/portal'), { page: 'project', id: 'portal' })
  assert.deepEqual(parseRoute('#work/sms-organizer'), { page: 'project', id: 'sms-organizer' })
  assert.deepEqual(parseRoute('#work/hello'), { page: 'work' })
})

test('legacy story links resolve to home anchors', () => {
  assert.deepEqual(parseRoute('#exhibition/store'), { page: 'home', anchor: 'project-store' })
  assert.deepEqual(parseRoute('#exhibition/vr'), { page: 'work' })
  assert.deepEqual(parseRoute('#my-story'), { page: 'home', anchor: 'my-story' })
  assert.deepEqual(parseRoute('#selected-work'), { page: 'home', anchor: 'selected-work' })
  assert.deepEqual(parseRoute('#exhibition'), { page: 'home' })
})

test('unknown or malicious hashes fall back to home', () => {
  assert.deepEqual(parseRoute(''), { page: 'home' })
  assert.deepEqual(parseRoute('#work/unknown'), { page: 'home' })
  assert.deepEqual(parseRoute('#<img src=x onerror=alert(1)>'), { page: 'home' })
})

test('route keys and titles', () => {
  assert.equal(routeKey({ page: 'project', id: 'store' }), 'project:store')
  assert.equal(routeKey({ page: 'home', anchor: 'contact' }), 'home')
  assert.equal(routeTitle({ page: 'project', id: 'store' }, { store: 'Microsoft Store' }), 'Microsoft Store')
  assert.equal(routeTitle({ page: 'resume' }), 'Resume')
})
