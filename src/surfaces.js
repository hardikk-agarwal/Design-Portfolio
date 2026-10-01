import { stories, storyMarkup } from './stories.js'

export const resumeSections = [
  ['UX Designer | Microsoft | Mar 2025 - Present', [
    'Redesigned Microsoft Store company account onboarding as sole designer: lifted success from 35% to 73% and cut onboarding from ~15 days to ~1 day, scaling to 240+ companies across 50 countries.',
    'Led design for the Trusted Developer Program pilot with Microsoft PC Manager (20 apps, 313K+ trust dialog views) and developer identity verification concepts, grounded in research with 100+ participants.',
    'Raised craft in Windows Hello and passkeys: triaged 30+ usability issues, contributing to 20% fewer craft bugs, System Usability Scale 79.5 to 83.2, and a 12% lift in biometric enrollment.',
    'Standardized Copilot Sports answer cards, the AI result surface for cricket, tennis, motorsports and American football, into a reusable schema enabling 4 new sports per cycle.',
    'Drove AI-assisted design practice: Claude Code and Figma MCP workflows, design-to-code prototyping, and agentic prototypes demoed to 30+ stakeholders.',
  ]],
  ['Senior Associate UX Designer | Microsoft x Tech Mahindra | Feb 2023 - Jan 2025', [
    'Designed search answer modules for Bing Search, serving 1M+ user queries monthly.',
    'Optimized Bing Travel across flights, destinations, hotels and car rentals: 20% improvement in booking success.',
    'Led user research and usability testing that raised post-interaction satisfaction scores 45%.',
    'Contributed core components to the Bing design system, used across 5+ major products, and cut design signoff turnaround 40%.',
    'Revamped the SMS Organizer app, increasing user engagement 30%.',
  ]],
  ['Visual Designer | PlayShifu | May 2021 - Jan 2023', [
    'Launched 6+ AR STEM games for children aged 6–12, lifting educational engagement 40%.',
    'Led the 3D avatar team from concept art to app integration: a swappable avatar system improved resource reuse 20% and enabled customization for 10,000+ users.',
    'Converted traditional HUD UI to diegetic (world-space) UI for VR, raising interaction rates 35%.',
  ]],
]

export const education = [
  'Master of Design, User Experience Design with AI | O P Jindal University | Sep 2024 - Sep 2025',
  'Bachelor of Design, Communication Design | Pearl Academy | Jul 2017 - Jul 2021',
  'Bachelor of Arts, English | IGNOU | Jul 2019 - Jul 2023',
]

export const skillGroups = [
  ['Design', ['User-centered design', 'Interaction design', 'Information architecture', 'Design systems', 'Prototyping', 'Accessibility']],
  ['Research', ['User research', 'Usability testing', 'A/B testing']],
  ['AI and code', ['Claude Code', 'GitHub Copilot', 'Figma MCP', 'Figma Make', 'VS Code', 'HTML, CSS and JavaScript', 'Design-to-code', 'Agentic prototyping']],
  ['Tools', ['Figma', 'Framer', 'Adobe Creative Cloud', 'After Effects', 'Lottie', 'Sketch', 'Miro']],
]

export const skills = `${skillGroups.flatMap(([, items]) => items).join(', ')}.`

function icon(name) { return `<i data-lucide="${name}" aria-hidden="true"></i>` }
function back() { return `<button class="surface-icon return-control" data-action="close" type="button" aria-label="Return to desk" title="Return to desk">${icon('arrow-left')}</button>` }

export const surfaceMarkup = `
  <section id="name-surface" class="physical-surface nameplate">
    <button type="button" data-open="resume" class="name-button" title="Open resume"><h1>Hardik Agarwal<span>.</span></h1><p>Product designer at Microsoft</p></button>
  </section>
  <section id="catalog-surface" class="physical-surface display catalog" aria-label="Work monitor">
    <header class="screen-bar"><span class="screen-brand">${icon('aperture')} hardik / workspace</span><button class="surface-icon" data-action="home" type="button" aria-label="Return to desk" title="Return to desk">${icon('armchair')}</button></header>
    <div class="catalog-body"><p class="screen-eyebrow">AI / PLATFORMS / IDENTITY</p><h2>Selected work</h2>
      <div class="project-list">${['store', 'copilot', 'hello'].map(id => `<button class="project-item" data-project="${id}" type="button"><span><strong>${stories[id].name}</strong><small>${stories[id].category}</small></span>${icon('arrow-up-right')}</button>`).join('')}</div>
    </div>
    <footer class="screen-footer"><button data-open="notebook" type="button">${icon('notebook-pen')} My practice</button><button data-open="vr" type="button">${icon('glasses')} Spatial work</button><button data-open="sky" type="button" aria-label="Look through the telescope" title="Look through the telescope">${icon('telescope')}</button><button data-open="resume" type="button">${icon('file-text')} Resume</button></footer>
  </section>
  <section id="work-surface" class="physical-surface display work-display" aria-label="Project display">
    <header class="screen-bar">${back()}<span id="work-screen-label">Selected project</span><div class="screen-arrows"><button class="surface-icon" type="button" data-action="previous-project" aria-label="Previous project" title="Previous project">${icon('chevron-left')}</button><button class="surface-icon" type="button" data-action="next-project" aria-label="Next project" title="Next project">${icon('chevron-right')}</button></div></header>
    <div class="screen-scroll" id="work-content" tabindex="0"></div>
    <footer class="screen-footer work-footer"><button data-action="read-project" type="button" id="read-project">${icon('maximize-2')} Open project</button><a href="mailto:madebyhardik@gmail.com">Get in touch ${icon('arrow-up-right')}</a></footer>
  </section>
  <section id="resume-surface" class="physical-surface paper resume-paper" aria-label="Hardik's hanging resume">
    <header class="paper-toolbar">${back()}<span>Resume</span><button class="surface-icon" id="resume-download" data-action="download-resume" type="button" aria-label="Download resume PDF" title="Download resume PDF">${icon('download')}</button></header>
    <div class="resume-scroll" tabindex="0"><button data-open="resume" class="paper-title" type="button"><h2>Hardik Agarwal</h2><p>Product Designer</p></button><p class="resume-summary">5+ years across AI, platform and consumer products. End-to-end design, prototyping in code, and a curiosity for what comes next.</p>
    <a class="resume-email" href="mailto:madebyhardik@gmail.com">madebyhardik@gmail.com</a><h3>Experience</h3>${resumeSections.map(([title, bullets]) => `<section><h4>${title}</h4><ul>${bullets.map(bullet => `<li>${bullet}</li>`).join('')}</ul></section>`).join('')}<h3>Skills</h3><p>${skills}</p><h3>Education</h3>${education.map(item => `<p>${item}</p>`).join('')}</div>
    <footer class="paper-footer"><button data-open="resume" type="button">Read resume ${icon('arrow-up-right')}</button><span>Design / Build / Explore</span></footer>
  </section>
  <section id="notebook-surface" class="physical-surface paper notebook-paper" aria-label="Hardik's working notebook">
    <header class="paper-toolbar">${back()}<span>Working notebook</span>${icon('notebook-pen')}</header>
    <div class="notebook-content"><button class="paper-title" data-open="notebook" type="button"><h2>A thought,<br />made tangible.</h2></button><div class="notebook-tabs" role="tablist" aria-label="Notebook pages">${stories.notebook.pages.map((page, index) => `<button role="tab" type="button" id="practice-tab-${index}" data-page="${index}" aria-selected="${index === 0}" aria-controls="practice-panel-${index}" tabindex="${index ? '-1' : '0'}">${page.title}</button>`).join('')}</div>${stories.notebook.pages.map((page, index) => `<section id="practice-panel-${index}" role="tabpanel" aria-labelledby="practice-tab-${index}" tabindex="0" ${index ? 'hidden' : ''}><h3>${page.title}</h3><p>${page.text}</p><ul>${page.items.map(item => `<li>${item}</li>`).join('')}</ul></section>`).join('')}</div>
    <footer class="paper-footer"><button data-open="notebook" type="button">Open notebook ${icon('arrow-up-right')}</button></footer>
  </section>
  <section id="contact-surface" class="physical-surface contact-card" aria-label="Contact Hardik"><a href="mailto:madebyhardik@gmail.com"><span>Let's make something.</span><strong>madebyhardik@gmail.com ${icon('arrow-up-right')}</strong></a></section>
  <section id="camera-surface" class="physical-surface camera-display" aria-label="Canon camera display">
    <div id="camera-resting" class="camera-id"><span class="camera-wordmark">Canon</span><button type="button" data-action="pickup" id="pickup-camera">${icon('camera')} Pick up camera</button></div>
    <div id="camera-off" class="camera-id" hidden>${icon('aperture')}<p>Through my lens.</p><button type="button" data-action="power" id="screen-power">${icon('power')} Power on</button></div>
    <div id="camera-live" class="camera-live" hidden><img id="live-image" alt="Live view from the camera in the virtual room" /><span id="camera-focus-name">Microsoft Store</span><button type="button" data-action="viewfinder" id="enter-viewfinder">${icon('scan')} Viewfinder</button></div>
    <div id="camera-playback" class="camera-playback" hidden><header><button type="button" data-action="close" aria-label="Back to camera">${icon('arrow-left')}</button><span>Contact sheet</span></header><p id="empty-playback">No frames yet.</p><div id="camera-frames"></div></div>
  </section>
  <section id="camera-controls-surface" class="physical-surface camera-controls" aria-label="Physical camera buttons"><button id="camera-power" type="button" data-action="power" aria-label="Camera power" title="Camera power">${icon('power')}</button><button id="camera-shutter" type="button" data-action="viewfinder" aria-label="Look through viewfinder" title="Look through viewfinder">${icon('circle')}</button><div class="dial-buttons"><button type="button" data-action="previous" aria-label="Previous object" title="Previous object">${icon('chevron-left')}</button><button type="button" data-action="next" aria-label="Next object" title="Next object">${icon('chevron-right')}</button></div><button id="camera-play" type="button" data-action="gallery" aria-label="View captured frames" title="View captured frames">${icon('images')}</button><button id="put-camera-down" type="button" data-action="putdown" aria-label="Put camera down" title="Put camera down">${icon('corner-down-left')}</button></section>
`

export function projectMarkup(id, reading = false) {
  const story = stories[id]
  if (!story) return ''
  if (reading) return storyMarkup(id)
  const metrics = story.metrics?.slice(0, 2).map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('') || ''
  return `<article class="project-preview" data-color="${story.color}"><p class="screen-eyebrow">${story.category}</p><h2>${story.title}</h2><p class="preview-role">${story.role} at ${story.organization}</p><p>${story.description}</p><div class="preview-metrics">${metrics}</div></article>`
}

export function workIndexMarkup() {
  return `<div class="review-projects">${['store', 'copilot', 'hello', 'vr'].map(id => {
    const story = stories[id]
    const [value, label] = story.metrics[0]
    return `<a class="review-project" href="#work/${id}"><div><p class="review-category">${story.category}</p><h3>${story.name}</h3><p class="review-description">${story.summary}</p><p class="review-role">${story.role} / ${story.organization}</p></div><div class="review-result"><strong>${value}</strong><span>${label}</span></div>${icon('arrow-up-right')}</a>`
  }).join('')}</div>`
}

export function scrollWorkMarkup(exhibits) {
  return exhibits.map(exhibit => {
    const story = stories[exhibit.id]
    const [value, label] = story.metrics[0]
    const ink = ['hello', 'vr'].includes(exhibit.id) ? '#101714' : exhibit.paper
    return `<article class="work-chapter" id="exhibition/${exhibit.id}" data-project="${exhibit.id}" tabindex="-1" style="--cp-project-bg:${exhibit.color};--cp-project-ink:${ink}"><p class="project-discipline">${exhibit.lens}</p><h3>${story.name}</h3><p class="chapter-summary">${story.summary}</p><figure class="chapter-artwork"><img data-artwork="${exhibit.id}" alt="${exhibit.artwork}" width="1440" height="960" loading="lazy" decoding="async" /><figcaption>Original illustration, not product UI</figcaption></figure><dl class="chapter-evidence"><div><dt>My role</dt><dd>${story.role} / ${story.organization}</dd></div><div><dt>${label}</dt><dd class="chapter-result">${value}</dd></div></dl><a class="story-project-link" href="#work/${exhibit.id}" aria-label="Read project: ${exhibit.label}">Read project ${icon('arrow-up-right')}</a></article>`
  }).join('')
}

export function readerMarkup(page) {
  const projects = ['store', 'copilot', 'hello', 'vr']
  if (page === 'resume') return `<article class="reader-resume"><h2 id="reader-title" tabindex="-1">Resume</h2><p class="reader-lead">Hardik Agarwal / Product Designer</p><h3>Experience</h3>${resumeSections.map(([title, bullets]) => `<section><h4>${title}</h4><ul>${bullets.map(bullet => `<li>${bullet}</li>`).join('')}</ul></section>`).join('')}<h3>Skills</h3><p>${skills}</p><h3>Education</h3>${education.map(item => `<p>${item}</p>`).join('')}</article>`
  if (page === 'about') return `<article class="reader-story">${storyMarkup('about', { headingId: 'reader-title', title: 'About Hardik' })}</article>`
  if (projects.includes(page)) {
    const index = projects.indexOf(page)
    const previous = projects[index - 1]
    const next = projects[index + 1]
    return `<article class="reader-story"><a class="reader-back" href="#work">${icon('arrow-left')}All work</a>${storyMarkup(page, { headingId: 'reader-title', title: stories[page].name })}<nav class="reader-pagination" aria-label="Project navigation"><a href="${previous ? `#work/${previous}` : '#work'}">${icon('arrow-left')}${previous ? stories[previous].name : 'All work'}</a><a href="${next ? `#work/${next}` : '#work'}">${next ? stories[next].name : 'All work'}${icon('arrow-right')}</a></nav></article>`
  }
  return `<section class="reader-overview"><h2 id="reader-title" tabindex="-1">Selected work</h2><p class="reader-lead">5+ years designing AI, platform and consumer products.</p>${workIndexMarkup()}</section>`
}

export async function downloadResume() {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 42
  const width = 511
  let cursor = 47
  const write = (value, size, bold = false, gap = 6) => {
    document.setFont('helvetica', bold ? 'bold' : 'normal')
    document.setFontSize(size)
    const lines = document.splitTextToSize(value, width)
    const lineHeight = size * 1.32
    if (cursor + lines.length * lineHeight > 794) { document.addPage(); cursor = 47 }
    document.text(lines, margin, cursor)
    cursor += lines.length * lineHeight + gap
  }
  write('Hardik Agarwal', 25, true, 3)
  document.setTextColor(46, 95, 126)
  write('Product Designer', 12, true, 7)
  document.setTextColor(35, 35, 35)
  write('madebyhardik@gmail.com | +91-9205538968', 9, false, 10)
  write('Product designer with 5+ years across AI, platform and consumer products. Rated Outstanding at Microsoft. Designs end-to-end and prototypes in code with AI.', 9, false, 12)
  write('EXPERIENCE', 10, true, 8)
  for (const [title, bullets] of resumeSections) {
    write(title, 9.1, true, 5)
    for (const bullet of bullets) write(`- ${bullet}`, 8.5, false, 4)
    cursor += 5
  }
  write('SKILLS', 10, true, 5)
  write(skills, 8.5, false, 9)
  write('EDUCATION', 10, true, 5)
  for (const item of education) write(item, 8.5, false, 4)
  document.save('Hardik-Agarwal-Resume.pdf')
}