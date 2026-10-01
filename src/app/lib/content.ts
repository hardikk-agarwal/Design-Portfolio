import { stories } from '../../stories.js'
import { resumeSections, education as educationLines, skillGroups } from '../../surfaces.js'
import cameraPortrait from '../../assets/hardik-camera.webp'
import cameraChip from '../../assets/hardik-camera-chip.webp'
import candid from '../../assets/hardik-candid.webp'
import subject from '../../assets/hardik-bench-subject.webp'
import benchScene from '../../assets/hardik-bench-scene.webp'
import { projects } from './projects'
import type { ProjectId } from './routes.js'

export { projects }
export type { CaseStudy, Flow, Metric, Project, Quote, Shot } from './projects'
export const photos = { cameraPortrait, cameraChip, candid, subject, benchScene }
export const email = 'madebyhardik@gmail.com'

export function projectById(id: ProjectId) {
  return projects.find((project) => project.id === id)!
}

export const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.name]))
export const featuredProjects = projects.filter((project) => !project.earlier)
export const earlierProjects = projects.filter((project) => project.earlier)

export const experience = (resumeSections as [string, string[]][]).map(([title, highlights]) => {
  const [role, company, dates] = title.split(' | ')
  return { role, company, dates: dates.replace('Present', 'Now'), highlights }
})

export const education = (educationLines as string[]).map((line) => {
  const [degree, school, dates] = line.split(' | ')
  return { degree, school, dates }
})

export const skills = (skillGroups as [string, string[]][]).map(([group, items]) => ({ group, items }))

export const practice = stories.notebook.pages.map((page) => ({ title: page.title, text: page.text, tools: page.items }))

export const about = {
  title: 'Curiosity brought me here.',
  intro: stories.about.description,
  story: stories.about.sections.slice(0, 4).map(([heading, body]) => ({ heading, body })),
  career: stories.about.sections.slice(4, 7).map(([company, body]) => {
    const job = experience.find((item) => item.company === company)!
    return {
      company,
      role: job.role,
      year: job.dates.match(/\d{4}/)![0],
      dates: job.dates.replace(' - ', ' to ').replace('Now', 'now'),
      body: body.slice(body.indexOf('. ') + 2),
    }
  }),
}

export const interests = [
  { title: 'Photography', text: 'It trains me to decide what belongs in the frame and what to leave out.' },
  { title: 'Space', text: 'It keeps reminding me how much is left to learn.' },
  { title: 'Technology', text: "I try new tech early to see what I can make with it. It's why I prototype with AI." },
  { title: 'Fitness', text: 'Staying active keeps my head clear for the next problem.' },
]

export const toolkit = ['Figma', 'Figma Make', 'Claude Code', 'GitHub Copilot', 'Figma MCP', 'Framer', 'After Effects', 'Lottie', 'HTML, CSS and JavaScript', 'VS Code', 'Adobe Creative Cloud', 'Miro']

export function splitChange(value: string) {
  const parts = value.split(' to ')
  return parts.length === 2 ? { from: parts[0], to: parts[1] } : null
}
