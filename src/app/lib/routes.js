// Case studies live under #work; apps, tools and prototypes Hardik built with AI live under #ai.
export const workIds = ['store', 'portal', 'copilot', 'sms-organizer', 'travel-map', 'trip-planning', 'club-seals']
export const aiIds = ['app-trust', 'craft-check', 'portal-prototype', 'figma-storybook', 'xaml-skill']
export const projectIds = [...workIds, ...aiIds]

// Earlier placeholder projects; old links to them land on the Work index.
const retiredIds = ['hello', 'vr']
const projectPattern = new RegExp(`^(?:work/(${workIds.join('|')})|ai/(${aiIds.join('|')}))(/film)?$`)
const retiredPattern = new RegExp(`^(?:work|exhibition)/(?:${retiredIds.join('|')})$`)
const legacyPattern = new RegExp(`^exhibition/(${workIds.join('|')})$`)

const homeAnchors = new Set(['my-story', 'my-approach', 'selected-work', 'built-with-ai', 'experience', 'beyond-work', 'contact'])

export function projectSection(id) {
  return aiIds.includes(id) ? 'ai' : 'work'
}

export function projectHash(id) {
  return `#${projectSection(id)}/${id}`
}

export function parseRoute(hash) {
  const value = hash.startsWith('#') ? hash.slice(1) : hash
  if (value === 'work' || value === 'ai' || value === 'about' || value === 'resume') return { page: value }
  const project = projectPattern.exec(value)
  // #work/<id>/film and #ai/<id>/film are shareable links that open the project's film.
  if (project) {
    const id = project[1] ?? project[2]
    return project[3] ? { page: 'project', id, film: true } : { page: 'project', id }
  }
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
  return { home: 'Hardik Agarwal', work: 'Work', ai: 'Built with AI', about: 'About', resume: 'Resume' }[route.page]
}
