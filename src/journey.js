export const objectIds = ['store', 'copilot', 'hello', 'notebook', 'resume', 'vr', 'sky']

const surfaceFor = { store: 'work', copilot: 'work', hello: 'work', notebook: 'notebook', resume: 'resume', vr: 'vr', sky: 'sky' }

export function readerPageFromHash(hash) {
  if (['#work', '#about', '#resume'].includes(hash)) return hash.slice(1)
  return /^#work\/(store|copilot|hello|vr)$/.exec(hash)?.[1] || null
}

export function initialJourney() {
  return { mode: 'desk', focus: 'store', powered: false, returnMode: 'desk', visited: [] }
}

export function transitionJourney(state, event) {
  if (event.type === 'pickup' && state.mode === 'desk') return { ...state, mode: 'camera' }
  if (event.type === 'power' && state.mode === 'camera') return { ...state, powered: !state.powered }
  if (event.type === 'viewfinder' && state.mode === 'camera' && state.powered) return { ...state, mode: 'viewfinder' }
  if (event.type === 'putdown' && ['camera', 'viewfinder', 'gallery'].includes(state.mode)) return { ...state, mode: 'desk', returnMode: 'desk' }
  if (event.type === 'gallery' && state.mode === 'camera') return { ...state, mode: 'gallery' }
  if (event.type === 'focus' && objectIds.includes(event.id)) return { ...state, focus: event.id }
  if (event.type === 'open' || (event.type === 'capture' && state.mode === 'viewfinder')) {
    const id = event.type === 'capture' ? state.focus : event.id
    if (!surfaceFor[id]) return state
    const returnMode = state.mode === 'viewfinder' || state.mode === 'gallery' ? state.mode : state.returnMode
    return { ...state, mode: surfaceFor[id], focus: id, returnMode, visited: state.visited.includes(id) ? state.visited : [...state.visited, id] }
  }
  if (event.type === 'close') {
    if (state.mode === 'viewfinder' || state.mode === 'gallery') return { ...state, mode: 'camera' }
    if (state.mode !== 'desk' && state.mode !== 'camera') return { ...state, mode: state.returnMode, returnMode: 'desk' }
    if (state.mode === 'camera') return { ...state, mode: 'desk' }
  }
  if (event.type === 'home') return { ...state, mode: 'desk', returnMode: 'desk' }
  return state
}