import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource-variable/bricolage-grotesque/index.css'
import './exhibition.css'
import { createIcons, ArrowLeft, ArrowRight, ArrowDown, ArrowUpRight, Download, Link2, Mail, Moon, Sun, X } from 'lucide'
import { exhibits, exhibitAt, exhibitIndex } from './exhibits.js'
import { readerPageFromHash } from './journey.js'
import { readerMarkup, scrollWorkMarkup, downloadResume } from './surfaces.js'

const icons = { ArrowLeft, ArrowRight, ArrowDown, ArrowUpRight, Download, Link2, Mail, Moon, Sun, X }
const exhibition = document.getElementById('exhibition-view')
const reading = document.getElementById('reading-view')
const stage = document.getElementById('exhibit-stage')
const bindings = new AbortController()
let selected = 0
let scene = null
let sceneWanted = false
let sceneLoading = false
let motion = null
let motionLoading = null
let disposed = false
let activePage = null
let routeRevision = 0
let feedbackTimeout = null
let homeScroll = 0
let homeHash = '#exhibition'

function listen(element, event, handler, options = {}) { element.addEventListener(event, handler, { ...options, signal: bindings.signal }) }
function refreshIcons() { createIcons({ icons, attrs: { 'stroke-width': 1.65, 'aria-hidden': 'true' } }) }
function announce(text) { document.getElementById('exhibition-status').textContent = text }
function dismissFeedback() {
  clearTimeout(feedbackTimeout)
  document.getElementById('action-feedback').hidden = true
}
function feedback(text) {
  dismissFeedback()
  document.getElementById('action-feedback-text').textContent = text
  document.getElementById('action-feedback').hidden = false
  announce(text)
  feedbackTimeout = setTimeout(dismissFeedback, 6000)
}

for (const image of document.querySelectorAll('[data-photo-from]')) {
  image.src = document.getElementById(image.dataset.photoFrom).src
}
document.getElementById('work-chapters').innerHTML = scrollWorkMarkup(exhibits)

function selectProject(index, instant = false) {
  const exhibit = exhibitAt(index)
  selected = exhibitIndex(exhibit.id)
  exhibition.dataset.currentExhibit = exhibit.id
  document.documentElement.style.setProperty('--cp-stage-bg', exhibit.color)
  document.documentElement.style.setProperty('--cp-stage-ink', ['hello', 'vr'].includes(exhibit.id) ? '#101714' : exhibit.paper)
  document.getElementById('study-label').textContent = exhibit.label
  scene?.select(selected, instant)
  if (artworkModule) document.getElementById('exhibit-fallback').src = artworkModule.artworkUrl(exhibit.id)
}

let artworkModule = null
let artworkLoading = null
async function loadArtwork() {
  artworkLoading ||= import('./exhibition-art.js')
  artworkModule = await artworkLoading
  if (disposed) return
  for (const image of exhibition.querySelectorAll('[data-artwork]')) image.src = artworkModule.artworkUrl(image.dataset.artwork)
  document.getElementById('exhibit-fallback').src = artworkModule.artworkUrl(exhibitAt(selected).id)
}

function addProjectArtwork(root) {
  for (const link of root.querySelectorAll('.review-project')) {
    if (link.querySelector('.index-artwork')) continue
    const image = document.createElement('img')
    image.className = 'index-artwork'
    image.src = artworkModule.artworkUrl(readerPageFromHash(link.hash))
    image.alt = ''
    image.width = 1440
    image.height = 960
    image.loading = 'lazy'
    image.decoding = 'async'
    link.prepend(image)
  }
}

function enhanceReader(page) {
  if (!artworkModule) return
  if (exhibits.some(exhibit => exhibit.id === page)) {
    const figure = document.createElement('figure')
    figure.className = 'reader-artwork'
    const image = document.createElement('img')
    image.src = artworkModule.artworkUrl(page)
    image.alt = exhibits[exhibitIndex(page)].artwork
    image.width = 1440
    image.height = 960
    image.loading = 'lazy'
    image.decoding = 'async'
    const caption = document.createElement('figcaption')
    caption.textContent = 'Illustrative project cover, not a product screenshot.'
    figure.append(image, caption)
    reading.querySelector('.project-body')?.append(figure)
  }
  addProjectArtwork(reading)
}

async function renderRoute({ focus = false } = {}) {
  const revision = ++routeRevision
  delete document.body.dataset.routeReady
  const wasReading = Boolean(activePage)
  dismissFeedback()
  const page = readerPageFromHash(location.hash)
  if (!wasReading && page) homeScroll = window.scrollY
  activePage = page
  reading.hidden = !page
  exhibition.hidden = Boolean(page)
  document.body.dataset.view = page ? 'reading' : 'exhibition'
  document.querySelector('.skip-link').href = page ? '#reading-content' : '#exhibition-view'
  motion?.setActive(!page)
  if (page) setSceneActive(false)
  for (const link of document.querySelectorAll('[data-nav]')) {
    const current = link.dataset.nav === (['about', 'resume'].includes(page) ? page : page ? 'work' : null)
    if (current) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  }
  if (page) {
    const project = exhibits.find(exhibit => exhibit.id === page)
    const linkLabel = project ? 'Copy project link' : 'Copy page link'
    document.getElementById('copy-project-link').setAttribute('aria-label', linkLabel)
    document.getElementById('copy-project-link').title = linkLabel
    document.getElementById('back-exhibition').href = project ? `#exhibition/${page}` : homeHash
    if (project) selectProject(exhibitIndex(page), true)
    document.getElementById('reading-content').innerHTML = readerMarkup(page)
    const oldHeading = document.getElementById('reader-title')
    const heading = document.createElement('h1')
    heading.id = 'reader-title'
    heading.tabIndex = -1
    heading.textContent = oldHeading.textContent
    oldHeading.replaceWith(heading)
    for (const previous of reading.querySelectorAll('h3, h4')) {
      const next = document.createElement(previous.tagName === 'H3' ? 'h2' : 'h3')
      next.textContent = previous.textContent
      previous.replaceWith(next)
    }
    if (exhibits.some(exhibit => exhibit.id === page)) {
      const article = reading.querySelector('.reader-story')
      const sections = [...article.querySelectorAll('.story-section')]
      const body = document.createElement('div')
      body.className = 'project-body'
      const narrative = document.createElement('div')
      narrative.className = 'project-narrative'
      sections[0].before(body)
      narrative.append(...sections)
      body.append(narrative)
      article.classList.add('project-reader')
    }
    document.title = `${exhibits.find(exhibit => exhibit.id === page)?.label || { work: 'Selected work', about: 'About', resume: 'Resume' }[page]} | Hardik Agarwal`
    refreshIcons()
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (focus) document.getElementById('reader-title').focus({ preventScroll: true })
    await loadArtwork()
    if (disposed || routeRevision !== revision) return
    enhanceReader(page)
  } else {
    document.title = 'Hardik Agarwal | Product Designer'
    const target = storyTarget(location.hash)
    if (target?.dataset.project) selectProject(exhibitIndex(target.dataset.project), true)
    refreshIcons()
    await loadArtwork()
    if (disposed || routeRevision !== revision) return
    try { await ensureMotion() }
    catch (error) { console.warn('Using the static portfolio story.', error) }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    if (disposed || routeRevision !== revision) return
    motion?.setActive(true)
    motion?.refresh()
    const restore = wasReading && location.hash === homeHash
    if (restore) window.scrollTo({ top: homeScroll, behavior: 'instant' })
    else if (target) {
      const anchor = target.closest('.lens-sequence') || target
      const headerHeight = document.querySelector('.site-header').getBoundingClientRect().height
      const top = window.scrollY + anchor.getBoundingClientRect().top - headerHeight
      window.scrollTo({ top: Math.ceil(top), behavior: 'instant' })
    }
    else window.scrollTo({ top: 0, behavior: 'instant' })
    homeHash = location.hash || '#exhibition'
    if (focus) {
      const heading = target?.querySelector('h2, h3') || document.getElementById('home-title')
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }
  if (!disposed && routeRevision === revision) document.body.dataset.routeReady = location.hash || '#exhibition'
}

function setSceneActive(value) {
  sceneWanted = value && !activePage && !disposed
  scene?.setActive(sceneWanted)
  if (sceneWanted) startScene()
}

async function startScene() {
  if (scene || sceneLoading || !sceneWanted || disposed) return
  sceneLoading = true
  try {
    const { createExhibition } = await import('./exhibition-stage.js')
    if (!sceneWanted || disposed) return
    scene = createExhibition(stage, { index: selected, centered: false, interactive: false })
  } catch (error) {
    stage.dataset.renderer = 'image'
    console.warn('Using the static project artwork.', error)
  } finally { sceneLoading = false }
}

async function ensureMotion() {
  if (motion) return motion
  if (motionLoading) return motionLoading
  motionLoading = (async () => {
    await document.fonts.ready
    const { createPortfolioScroll } = await import('./portfolio-scroll.js')
    if (disposed || activePage) return null
    motion = createPortfolioScroll(exhibition, { onProject: selectProject, onSceneActive: setSceneActive })
    return motion
  })()
  try { return await motionLoading }
  finally { motionLoading = null }
}

function storyTarget(hash) {
  const project = /^#exhibition\/(store|copilot|hello|vr)$/.exec(hash)?.[1]
  if (project) return document.getElementById(`exhibition/${project}`)
  const section = /^#(my-story|my-approach|selected-work|beyond-work)$/.exec(hash)?.[1]
  return section ? document.getElementById(section) : null
}

function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark'
  const button = document.querySelector('.theme-control')
  button.innerHTML = `<i data-lucide="${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`
  button.setAttribute('aria-label', `Switch to ${dark ? 'daylight' : 'evening'} theme`)
  button.title = button.getAttribute('aria-label')
  refreshIcons()
  scene?.updateTheme()
}

listen(document, 'click', async event => {
  if (event.target.closest('.wordmark')) {
    homeScroll = 0
    if (!activePage) window.scrollTo({ top: 0, behavior: 'instant' })
  }
  if (event.target.closest('.skip-link')) {
    event.preventDefault()
    const target = activePage ? document.getElementById('reading-content') : exhibition
    target.focus({ preventScroll: true })
    target.scrollIntoView({ block: 'start', behavior: 'instant' })
    return
  }
  const action = event.target.closest('[data-action]')
  if (!action) return
  if (action.dataset.action === 'theme') {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('portfolio-theme', theme) } catch {}
    syncTheme()
  }
  if (action.dataset.action === 'dismiss-feedback') dismissFeedback()
  if (action.dataset.action === 'copy-link') {
    const url = new URL(location.href)
    if (!['http:', 'https:'].includes(url.protocol)) {
      feedback('This local file does not have a shareable web address.')
      return
    }
    action.disabled = true
    const revision = routeRevision
    try {
      await navigator.clipboard.writeText(url.href)
      if (!disposed && routeRevision === revision) feedback('Link copied.')
    } catch {
      if (!disposed && routeRevision === revision) feedback('Link not copied. You can copy the address from your browser.')
    } finally { action.disabled = false }
  }
  if (action.dataset.action === 'download') {
    action.disabled = true
    action.setAttribute('aria-busy', 'true')
    try { await downloadResume(); if (!disposed) feedback('Resume PDF prepared.') }
    catch { if (!disposed) feedback('The resume could not be downloaded. Please try again.') }
    finally { action.disabled = false; action.removeAttribute('aria-busy') }
  }
})
listen(document, 'keydown', event => {
  if (event.key !== 'Escape') return
  if (!document.getElementById('action-feedback').hidden) {
    event.preventDefault()
    dismissFeedback()
  } else if (activePage) location.hash = document.getElementById('back-exhibition').hash
})
listen(window, 'hashchange', () => renderRoute({ focus: true }))
selectProject(0, true)
syncTheme()
renderRoute()
if (import.meta.hot) import.meta.hot.dispose(() => { disposed = true; clearTimeout(feedbackTimeout); bindings.abort(); motion?.dispose(); scene?.dispose() })