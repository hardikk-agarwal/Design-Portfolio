export const projectIds = ['store', 'portal', 'copilot', 'sms-organizer', 'travel-map', 'trip-planning']

// Earlier placeholder projects; old links to them land on the Work index.
const retiredIds = ['hello', 'vr']
const projectPattern = new RegExp(`^work/(${projectIds.join('|')})$`)
const retiredPattern = new RegExp(`^(?:work|exhibition)/(?:${retiredIds.join('|')})$`)
const legacyPattern = new RegExp(`^exhibition/(${projectIds.join('|')})$`)

const homeAnchors = new Set(['my-story', 'my-approach', 'selected-work', 'experience', 'beyond-work', 'contact'])

export function parseRoute(hash) {
  const value = hash.startsWith('#') ? hash.slice(1) : hash
  if (value === 'work' || value === 'about' || value === 'resume') return { page: value }
  const project = projectPattern.exec(value)
  if (project) return { page: 'project', id: project[1] }
  if (retiredPattern.test(value)) return { page: 'work' }
  const legacy = legacyPattern.exec(value)
  if (legacy) return { page: 'home', anchor: `project-${legacy[1]}` }
  if (homeAnchors.has(value)) return { page: 'home', anchor: value }
  return { page: 'home' }
}

export function routeKey(route) {
  return route.page === 'project' ? `project:${route.id}` : route.page
}

export function routeTitle(route, names = {}) {
  if (route.page === 'project') return names[route.id] || 'Project'
  return { home: 'Hardik Agarwal', work: 'Work', about: 'About', resume: 'Resume' }[route.page]
}
