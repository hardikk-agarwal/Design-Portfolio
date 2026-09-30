import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import './desk.css'
import { createIcons, Accessibility, Aperture, Armchair, ArrowLeft, ArrowRight, ArrowUpRight, Camera, Check, ChevronLeft, ChevronRight, Circle, CornerDownLeft, Download, FileText, Glasses, Images, Maximize2, Moon, NotebookPen, Power, RotateCcw, Scan, Sun, Telescope, X, ZoomIn, ZoomOut } from 'lucide'
import { initialJourney, objectIds, transitionJourney, readerPageFromHash } from './journey.js'
import { stories } from './stories.js'
import { surfaceMarkup, projectMarkup, readerMarkup, downloadResume } from './surfaces.js'

const icons = { Accessibility, Aperture, Armchair, ArrowLeft, ArrowRight, ArrowUpRight, Camera, Check, ChevronLeft, ChevronRight, Circle, CornerDownLeft, Download, FileText, Glasses, Images, Maximize2, Moon, NotebookPen, Power, RotateCcw, Scan, Sun, Telescope, X, ZoomIn, ZoomOut }
const stage = document.getElementById('room')
const readable = document.getElementById('readable-view')
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const capturedFrames = new Map()
const surfacePreviews = new Map()
const names = { store: 'Microsoft Store', copilot: 'Copilot Sports', hello: 'Windows Hello', notebook: 'Working notebook', resume: 'Hardik / Resume', vr: 'AR / VR at PlayShifu', sky: 'The night sky' }
const bindings = new AbortController()
let state = initialJourney()
let room = null
let project = 'store'
let graphicsFailed = false
let disposed = false
let lastLive = 0
let lastMode = null
let contentKey = ''
let previewPending = null
let roomStarting = false
let readerReturnFocus = null
document.getElementById('surface-library').innerHTML = surfaceMarkup

function refreshIcons() { createIcons({ icons, attrs: { 'stroke-width': 1.65, 'aria-hidden': 'true' } }) }
function listen(element, name, handler) { element.addEventListener(name, handler, { signal: bindings.signal }) }
function announce(text) { document.getElementById('announcement').textContent = text }
function applyState(event, instant = false) {
  const previous = state
  state = transitionJourney(state, event)
  if (state === previous) return
  if (['store', 'copilot', 'hello'].includes(state.focus)) project = state.focus
  renderUI()
  room?.setState(state, instant)
  if (state.mode !== previous.mode) announce(state.mode === 'desk' ? 'Back at the desk' : state.mode === 'work' ? `${names[project]}, project monitor` : `Opened ${names[state.focus] || state.mode}`)
}

function renderUI() {
  document.body.dataset.mode = state.mode
  document.getElementById('camera-resting').hidden = state.mode !== 'desk'
  document.getElementById('camera-off').hidden = state.mode !== 'camera' || state.powered
  document.getElementById('camera-live').hidden = state.mode !== 'camera' || !state.powered
  document.getElementById('camera-playback').hidden = state.mode !== 'gallery'
  document.getElementById('camera-controls-surface').dataset.active = String(state.mode !== 'desk')
  document.getElementById('camera-power').disabled = state.mode !== 'camera'
  document.getElementById('camera-power').setAttribute('aria-pressed', String(state.powered))
  document.getElementById('camera-shutter').disabled = state.mode !== 'camera' || !state.powered
  for (const element of document.querySelectorAll('.dial-buttons button')) element.disabled = state.mode !== 'camera' || !state.powered
  document.getElementById('camera-play').disabled = state.mode !== 'camera'
  document.getElementById('camera-focus-name').textContent = names[state.focus]
  document.getElementById('finder-name').textContent = names[state.focus]
  document.getElementById('finder-hud').hidden = state.mode !== 'viewfinder'
  document.getElementById('scope-hud').hidden = state.mode !== 'sky'
  document.getElementById('resume-surface').classList.toggle('is-reading', state.mode === 'resume')
  document.getElementById('notebook-surface').classList.toggle('is-reading', state.mode === 'notebook')
  document.getElementById('work-surface').classList.toggle('is-reading', state.mode === 'work' || state.mode === 'vr')
  const backLabel = state.returnMode === 'viewfinder' ? 'Back to viewfinder' : state.returnMode === 'gallery' ? 'Back to captured frames' : 'Back to desk'
  for (const button of document.querySelectorAll('.return-control')) {
    button.setAttribute('aria-label', backLabel)
    button.title = backLabel
  }
  const activeStory = state.mode === 'vr' ? 'vr' : project
  const reading = state.mode === 'work' || state.mode === 'vr'
  const nextKey = `${activeStory}/${reading}`
  if (nextKey !== contentKey) {
    document.getElementById('work-content').innerHTML = projectMarkup(activeStory, reading)
    document.getElementById('work-content').scrollTop = 0
    document.getElementById('work-screen-label').textContent = stories[activeStory].name
    contentKey = nextKey
  }
  document.getElementById('read-project').hidden = reading
  for (const button of document.querySelectorAll('[data-project]')) button.setAttribute('aria-pressed', String(button.dataset.project === project))
  if (state.mode === 'gallery') renderPlayback()
  refreshIcons()
  if (lastMode !== state.mode) {
    lastMode = state.mode
    const focusTarget = { work: '#work-content', vr: '#work-content', resume: '.resume-scroll', notebook: '#practice-tab-0', camera: state.powered ? '#enter-viewfinder' : '#screen-power', viewfinder: '#capture-frame', sky: '#scope-back', gallery: '#camera-playback button' }[state.mode]
    if (focusTarget && !graphicsFailed && readable.hidden) queueMicrotask(() => document.querySelector(focusTarget)?.focus({ preventScroll: true }))
  }
}

function cycle(direction, instant = false) {
  const index = objectIds.indexOf(state.focus)
  applyState({ type: 'focus', id: objectIds[(index + direction + objectIds.length) % objectIds.length] }, instant)
  announce(`${names[state.focus]}, in focus`)
  updateLive()
}
function cycleProject(direction) {
  const projects = ['store', 'copilot', 'hello']
  project = projects[(projects.indexOf(project) + direction + projects.length) % projects.length]
  applyState({ type: 'open', id: project }, true)
}
function renderPlayback() {
  const container = document.getElementById('camera-frames')
  container.replaceChildren()
  document.getElementById('empty-playback').hidden = capturedFrames.size > 0
  for (const [id, source] of capturedFrames) {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.open = id
    button.setAttribute('aria-label', `Open ${names[id]}`)
    const image = document.createElement('img')
    image.src = source
    image.alt = ''
    const caption = document.createElement('span')
    caption.textContent = names[id]
    button.append(image, caption)
    container.append(button)
  }
}
function updateLive() {
  if (state.mode !== 'camera' || !state.powered || !room) return
  document.getElementById('live-image').src = room.getLiveImage()
}
async function prepareSurfacePreviews() {
  if (previewPending) return previewPending
  previewPending = (async () => {
    const { toCanvas } = await import('html-to-image')
    for (const id of ['name-surface', 'catalog-surface', 'work-surface', 'resume-surface', 'notebook-surface', 'contact-surface']) {
      const element = document.getElementById(id)
      const version = element.innerHTML
      if (surfacePreviews.get(id) === version) continue
      const canvas = await toCanvas(element, { width: element.clientWidth, height: element.clientHeight, pixelRatio: 0.75, style: { transform: 'none', position: 'relative', top: '0', left: '0', backfaceVisibility: 'visible' } })
      if (disposed) return
      room?.setSurfacePreview(id, canvas)
      surfacePreviews.set(id, version)
    }
  })()
  try { await previewPending }
  catch (error) { console.warn('A screen preview could not be prepared.', error) }
  finally { previewPending = null }
}
function toggleTheme() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem('portfolio-theme', theme) } catch {}
  room?.updateTheme()
  document.getElementById('lighting-label').textContent = theme === 'dark' ? 'Daylight' : 'Evening'
}
function showReadable(page) {
  if (readable.hidden) readerReturnFocus = document.activeElement
  document.body.classList.add('readable-mode')
  readable.hidden = false
  readable.dataset.readerRoute = page
  stage.inert = true
  room?.setActive(false)
  document.getElementById('readable-content').innerHTML = readerMarkup(page)
  const section = ['about', 'resume'].includes(page) ? page : 'work'
  for (const link of document.querySelectorAll('[data-reader-page]')) {
    if (link.dataset.readerPage === section) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  }
  document.getElementById('leave-readable-label').textContent = !room ? 'Explore desk' : ['camera', 'gallery', 'viewfinder'].includes(state.mode) ? 'Back to camera' : ['work', 'vr'].includes(state.mode) ? 'Back to monitor' : state.mode === 'desk' ? 'Back to desk' : `Back to ${state.mode}`
  document.getElementById('leave-readable').title = document.getElementById('leave-readable-label').textContent
  document.title = `${stories[page]?.name || { work: 'Selected work', about: 'About', resume: 'Resume' }[page]} | Hardik Agarwal`
  readable.scrollTop = 0
  refreshIcons()
  document.getElementById('reader-title').focus({ preventScroll: true })
}
function openReadable() {
  const page = state.mode === 'resume' ? 'resume' : state.mode === 'notebook' ? 'about' : ['work', 'vr', 'camera', 'viewfinder', 'gallery'].includes(state.mode) && ['store', 'copilot', 'hello', 'vr'].includes(state.focus) ? state.focus : 'work'
  const hash = ['store', 'copilot', 'hello', 'vr'].includes(page) ? `#work/${page}` : `#${page}`
  if (location.hash === hash) showReadable(page)
  else location.hash = hash
}
function hideReadable() {
  readable.hidden = true
  document.body.classList.remove('readable-mode')
  stage.inert = false
  room?.setActive(true)
  document.title = 'Hardik Agarwal | Product Designer'
  const target = readerReturnFocus?.isConnected && readerReturnFocus !== document.body ? readerReturnFocus : document.getElementById('review-work')
  target.focus({ preventScroll: true })
  startRoom()
}
function leaveReadable() {
  if (graphicsFailed) { announce('3D graphics are unavailable. The readable version remains open.'); return }
  history.pushState(null, '', location.href.split('#')[0])
  hideReadable()
}
function syncReaderRoute() {
  const page = readerPageFromHash(location.hash)
  if (page) showReadable(page)
  else if (!readable.hidden && !graphicsFailed) hideReadable()
}

listen(window, 'hashchange', syncReaderRoute)

listen(document, 'click', async event => {
  const opened = event.target.closest('[data-open]')
  if (opened) { applyState({ type: 'open', id: opened.dataset.open }, event.detail === 0); return }
  const selected = event.target.closest('[data-project]')
  if (selected) { project = selected.dataset.project; applyState({ type: 'open', id: project }, event.detail === 0); return }
  const tab = event.target.closest('.notebook-tabs [data-page]')
  if (tab) { selectPage(tab); return }
  const button = event.target.closest('[data-action]')
  if (!button) return
  const action = button.dataset.action
  if (['pickup', 'power', 'viewfinder', 'putdown', 'gallery', 'close', 'home'].includes(action)) {
    if (action === 'viewfinder') await prepareSurfacePreviews()
    applyState({ type: action }, event.detail === 0)
    if (action === 'power' && state.powered) await prepareSurfacePreviews()
    updateLive()
  } else if (action === 'next' || action === 'previous') cycle(action === 'next' ? 1 : -1, event.detail === 0)
  else if (action === 'next-project' || action === 'previous-project') cycleProject(action === 'next-project' ? 1 : -1)
  else if (action === 'read-project') applyState({ type: 'open', id: project }, event.detail === 0)
  else if (action === 'capture') {
    await prepareSurfacePreviews()
    if (state.mode !== 'viewfinder') return
    if (room) { document.body.classList.add('shutter-release'); room.capture() }
    else applyState({ type: 'capture' })
  } else if (action === 'zoom-in' || action === 'zoom-out') room?.zoom(action === 'zoom-in' ? -1 : 1)
  else if (action === 'reset') room?.reset()
  else if (action === 'light') toggleTheme()
  else if (action === 'accessible') openReadable()
  else if (action === 'leave-readable') leaveReadable()
  else if (action === 'download-resume') {
    button.disabled = true
    try { await downloadResume(); announce('Resume downloaded') }
    catch { announce('Resume download failed. Please try again.') }
    finally { button.disabled = false }
  }
})

function selectPage(tab) {
  for (const button of document.querySelectorAll('.notebook-tabs [data-page]')) {
    const active = button === tab
    button.setAttribute('aria-selected', String(active))
    button.tabIndex = active ? 0 : -1
    document.getElementById(button.getAttribute('aria-controls')).hidden = !active
  }
}
listen(document, 'keydown', event => {
  if (event.key === 'Escape' && !readable.hidden) { event.preventDefault(); leaveReadable(); return }
  const tab = event.target.closest('.notebook-tabs [data-page]')
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    const tabs = [...document.querySelectorAll('.notebook-tabs [data-page]')]
    const index = tabs.indexOf(tab)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    selectPage(tabs[next]); tabs[next].focus(); return
  }
  if (event.key === 'Escape' && !document.body.classList.contains('readable-mode')) { event.preventDefault(); applyState({ type: 'close' }, true) }
  if (state.mode === 'viewfinder' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); cycle(event.key === 'ArrowRight' ? 1 : -1, true) }
})
for (const element of document.querySelectorAll('.physical-surface')) {
  for (const event of ['pointerdown', 'pointerup', 'wheel']) listen(element, event, value => value.stopPropagation())
}
listen(reduced, 'change', () => room?.setState(state, true))

renderUI()
syncReaderRoute()
startRoom()

async function startRoom() {
  if (disposed || room || roomStarting || !readable.hidden || graphicsFailed) return
  roomStarting = true
  try {
    await document.fonts.ready
    if (disposed || !readable.hidden) return
    const { createRoom } = await import('./room.js')
    if (disposed || !readable.hidden) return
    room = createRoom(stage, {
      onReady() {
        graphicsFailed = false
        document.body.classList.add('room-ready')
        document.getElementById('loading-status').hidden = true
        room?.setState(state, true)
        room?.setActive(readable.hidden)
      },
      async onObject(id) {
        if (id === 'camera') { if (state.mode === 'desk') applyState({ type: 'pickup' }); return }
        if (id === 'power') {
          if (state.mode === 'desk') applyState({ type: 'pickup' })
          applyState({ type: 'power' })
          if (state.powered) await prepareSurfacePreviews()
          return
        }
        if (id === 'viewfinder') {
          if (state.mode === 'desk') applyState({ type: 'pickup' })
          else { await prepareSurfacePreviews(); applyState({ type: 'viewfinder' }) }
          return
        }
        if (id === 'work') { applyState({ type: 'open', id: project }); return }
        if (id === 'resume' || id === 'notebook' || id === 'vr' || id === 'sky') applyState({ type: 'open', id })
        if (id === 'light') toggleTheme()
      },
      onLiveFrame() {
        if (performance.now() - lastLive > 180) { lastLive = performance.now(); queueMicrotask(updateLive) }
      },
      onFocusPoint(point) { document.getElementById('finder-focus').style.transform = `translate(${point.x}px,${point.y}px) translate(-50%,-50%)` },
      onCapture(id, source) {
        capturedFrames.set(id, source)
        document.body.classList.remove('shutter-release')
        applyState({ type: 'capture' })
      },
      onError() {
        graphicsFailed = true
        document.getElementById('loading-status').hidden = true
        announce('The 3D room is unavailable. Opening the readable portfolio.')
        openReadable()
      },
    })
  } catch (error) {
    console.warn('Unable to render the room.', error)
    graphicsFailed = true
    document.getElementById('loading-status').hidden = true
    openReadable()
  } finally {
    roomStarting = false
  }
}

if (import.meta.hot) import.meta.hot.dispose(() => { disposed = true; bindings.abort(); room?.dispose() })