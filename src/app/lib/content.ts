import { stories } from '../../stories.js'
import { resumeSections, education as educationLines, skillGroups } from '../../surfaces.js'
import cameraPortrait from '../../assets/hardik-camera.webp'
import cameraChip from '../../assets/hardik-camera-chip.webp'
import candid from '../../assets/hardik-candid.webp'
import subject from '../../assets/hardik-bench-subject.webp'
import benchScene from '../../assets/hardik-bench-scene.webp'
import { projects } from './projects'
import type { Endorsement } from './projects'
import type { ProjectId } from './routes.js'

export { projects }
export type { CaseStudy, Endorsement, Film, Flow, Metric, Project, Quote, Shot } from './projects'
export const photos = { cameraPortrait, cameraChip, candid, subject, benchScene }
export const email = 'madebyhardik@gmail.com'
export const phone = { label: '+91 92055 38968', href: 'tel:+919205538968' }
export const profiles = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hardikkagarwal/' },
  { label: 'Instagram', href: 'https://www.instagram.com/hardikk_agarwal/' },
]

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

export const endorsements: { featured: Endorsement & { more: string }; quotes: Endorsement[] } = {
  featured: {
    text: 'Overall, your contribution has been transformative, bringing stability, quality, and a much stronger design culture to the team.',
    highlight: 'your contribution has been transformative',
    more: '…your arrival brought in much-needed clarity, structure, and momentum… You’ve also become a dependable partner for both PMs and engineering, bridging gaps and ensuring that design is not just an afterthought but a core part of the solution.',
    role: 'Principal group product manager',
  },
  quotes: [
    { text: 'Hardik is one of the most responsive and thoughtful designers I’ve worked with at Microsoft… He doesn’t just take a spec and wireframe it; he asks the right questions to understand the ‘why’ behind what we’re building, which means the designs hold up when we pressure-test them.', highlight: 'one of the most responsive and thoughtful designers', role: 'Senior product manager' },
    { text: 'Your contributions across a wide range of Store projects have been outstanding… you’ve consistently demonstrated the ability to handle diverse and complex areas with depth, quality, and ownership.', highlight: 'have been outstanding', role: 'Principal PM manager' },
    { text: 'Hardik went beyond design by building functional prototypes… This hands-on work helped the team quickly validate feasibility and informed key product directions.', highlight: 'went beyond design by building functional prototypes', role: 'Senior product manager' },
    { text: 'He has gone above and beyond his role as a designer by being involved in brainstorming and proposal sessions as well… He always thinks from the customer’s mindset and brings the customer’s opinion and voice to the conversation.', highlight: 'brings the customer’s opinion and voice to the conversation', role: 'Principal software engineering manager' },
    { text: 'His keen attention to small details, from spacing and alignment to micro-interactions, is what sets his work apart and shows how deeply he cares about craft… You can count on him to turn things around quickly without cutting corners, which is rare.', highlight: 'without cutting corners', role: 'Software engineer' },
  ],
}

export function splitChange(value: string) {
  const parts = value.split(' to ')
  return parts.length === 2 ? { from: parts[0], to: parts[1] } : null
}
