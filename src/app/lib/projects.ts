import type { ProjectId } from './routes.js'
import storeCover from '../../assets/work/store-cover.webp'
import storeAccount from '../../assets/work/store-account.webp'
import storeOcr from '../../assets/work/store-ocr.webp'
import storeRecover from '../../assets/work/store-recover.webp'
import portalCoverLocked from '../../assets/work/portal-cover-locked.webp'
import copilotCover from '../../assets/work/copilot-cover.webp'
import copilotBefore from '../../assets/work/copilot-before.webp'
import copilotAfter from '../../assets/work/copilot-after.webp'
import copilotF1 from '../../assets/work/copilot-f1.webp'
import copilotTennis from '../../assets/work/copilot-tennis.webp'
import copilotCricket from '../../assets/work/copilot-cricket.webp'
import copilotNfl from '../../assets/work/copilot-nfl.webp'
import copilotPre from '../../assets/work/copilot-pre.webp'
import copilotLive from '../../assets/work/copilot-live.webp'
import copilotPost from '../../assets/work/copilot-post.webp'
import copilotShell from '../../assets/work/copilot-shell.webp'

export type Metric = { value: string; label: string }
export type Shot = { src: string; alt: string; width: number; height: number; caption?: string }
export type Quote = { text: string; source: string }
export type Flow = { label: string; steps: string[] }

export type CaseStudy = {
  problem: { body: string; stats: Metric[]; quote?: Quote }
  insight: string
  contrast?: { title: string; items: string[]; keep: boolean }[]
  decisions: { title: string; body: string; shots: Shot[]; flows?: Flow[] }[]
  result: { title?: string; body: string; metrics?: Metric[]; note?: string; quote?: Quote; changes?: [string, string][]; shots?: Shot[] }
  takeaway: { line: string; body?: string }
  // Replaces the public cover once a locked case study is opened.
  cover?: Shot
}

type Teaser = {
  id: ProjectId
  name: string
  category: string
  headline: string
  description: string
  summary: string
  role: string
  organization: string
  timeline?: string
  status?: string
  team: string
  scope: string
  metrics: Metric[]
  color: string
  ink: string
  cover: Shot
}

// Locked case studies live encrypted in src/protected/<id> and open with a password.
export type Project = Teaser & ((CaseStudy & { locked?: never }) | { locked: true })

// Screens come from Hardik's Figma case studies. Figures are the ones those studies report.
export const projects: Project[] = [
  {
    id: 'store',
    name: 'Microsoft Store',
    category: 'Developer onboarding',
    headline: 'A shorter path to the Store.',
    description: 'I rebuilt company onboarding for Microsoft Store developers. Verification stayed strict; the guesswork around it went away.',
    summary: 'Rebuilt company onboarding around clarity and recovery, without lowering the trust bar.',
    role: 'Sole product designer',
    organization: 'Microsoft',
    timeline: '2025 to 2026',
    team: '8 partner teams across product, engineering, verification, accounts, legal, support and marketing',
    scope: 'Onboarding, verification, recovery and appeals, implementation review',
    metrics: [
      { value: '35% to 73%', label: 'Onboarding success' },
      { value: '~15 days to ~1 day', label: 'Average vetting time' },
      { value: '240+', label: 'Companies onboarded in a 50-country flight' },
    ],
    problem: {
      body: 'Microsoft Store reaches more than 250 million Windows customers a month, and every company that publishes there must pass business verification. Companies paid a $99 fee before they knew whether they could pass it. Requirements surfaced late, progress was invisible and failures arrived without a reason. Around 230 companies a month were affected, including well-known, legitimate organizations, and escalations reached executive channels.',
      stats: [
        { value: '35%', label: 'Of companies finished onboarding, against 90% of individuals' },
        { value: '1 in 3', label: 'Stopped at the $99 payment step' },
        { value: '~41%', label: 'Failed during vetting' },
        { value: '85%', label: 'Of failures came from domain and email checks' },
      ],
    },
    insight: "Verification was necessary. The uncertainty around it wasn't.",
    contrast: [
      { title: 'Kept: the checks that protect trust', items: ['Identity', 'Business verification', 'Domain verification', 'Due diligence', 'Legal information'], keep: true },
      { title: 'Removed: the friction that only added uncertainty', items: ['Hidden requirements', 'Late validation', 'Opaque progress', 'Unclear failures', 'Dead ends', 'Repeated work'], keep: false },
    ],
    decisions: [
      {
        title: 'Own the experience, then remove the commitment barrier',
        body: "We moved onboarding into a Store-owned flow built on the verification services, so the Store controlled guidance, status and recovery. That unlocked the rest: dropping the $99 fee, signing in with a company's Microsoft Entra identity, and a preparation step that explains what verification needs before anyone commits.",
        shots: [{ src: storeAccount, alt: 'Choose account type step of the redesigned onboarding, with individual and company developer options, both marked free', width: 1600, height: 801 }],
      },
      {
        title: 'Let companies prove who they are with what they have',
        body: 'Instead of one rigid path, companies can verify with a D-U-N-S number, look one up by name and country, or upload an official business document. AI reads the document and pre-fills the company details for review, while human verification stays in the loop.',
        shots: [{ src: storeOcr, alt: 'Business details step with an uploaded business document and the company details pre-filled from it, ready to review', width: 1600, height: 884 }],
      },
      {
        title: 'Make failure a step, not an ending',
        body: 'Most failures came from domain and email checks, so the flow now explains which email qualifies and verifies it inside onboarding, before anything is submitted. Verification status updates in real time, with a clear reason whenever action is needed. When a check still fails, companies fix it inside the flow and pick up where they left off, and reminders on days 2, 5 and 7 replace the old silence.',
        flows: [
          { label: 'Before: linear and opaque', steps: ['Choose account', 'Sign in with a personal account', 'Fill in details', 'Pay $99', 'Submit', 'Wait', 'Fail?', 'No reason given'] },
          { label: 'After: structured and recoverable', steps: ['Choose account', 'Sign in', 'Business details', 'Contact', 'Submit', 'Verify', 'Resolve or complete'] },
        ],
        shots: [{ src: storeRecover, alt: 'Account verification step explaining that business verification did not succeed, with an Upload document action beside it', width: 1600, height: 884 }],
      },
    ],
    result: {
      body: 'The redesign flighted in 50 countries, then rolled out to every Microsoft Store market. Onboarding success nearly doubled and the wait for vetting fell from about 15 days to 1, while vetting success held above 80%.',
      metrics: [
        { value: '35% to 73%', label: 'Onboarding success' },
        { value: '~15 days to ~1 day', label: 'Average vetting time' },
        { value: '240+', label: 'Companies onboarded in the flight' },
        { value: '80%+', label: 'Vetting success held' },
      ],
      note: 'Internal post-launch figures.',
      quote: { text: 'I have created developer accounts before, but with the new onboarding flow everything is so much smoother. From start to finish it took me less than 30 minutes to have a fully vetted business account, ready to go. Removing the onboarding fee is just the cherry on top of the cake.', source: 'Blue Banana Software, Microsoft Store company developer' },
    },
    takeaway: {
      line: "The best onboarding doesn't remove complexity from the system. It absorbs it, so the user doesn't have to.",
      body: 'Along the way I surfaced 400 craft and implementation issues in review, then prototyped Craft Check, a tool that compares the Figma design with the build, to catch them earlier.',
    },
    color: '#b52845',
    ink: '#f0e7e6',
    cover: { src: storeCover, alt: 'Redesigned Microsoft Store developer onboarding showing live status for email, business and employment verification', width: 1600, height: 884 },
  },
  {
    id: 'portal',
    name: 'Windows Developer Center',
    category: 'Developer platform',
    headline: 'Publishing, the way developers think about it.',
    description: 'I shaped the new Windows Developer Center, from where it should live to how an app goes from package to published.',
    summary: 'Redesigned app publishing around how developers think, tested with a coded prototype and developer research.',
    role: 'Sole product designer',
    organization: 'Microsoft',
    timeline: 'July 2026',
    status: 'Design complete, not yet built',
    team: 'Product, engineering, research and Store leadership',
    scope: 'Vision and information architecture, MSIX, Win32 and web app publishing, research, Fluent design and coded prototypes',
    metrics: [
      { value: '6,000+', label: 'Developers use the portal each month' },
      { value: '1,250+', label: 'New apps submitted each month' },
      { value: '5,500+', label: 'App updates each month' },
    ],
    locked: true,
    color: '#d0e266',
    ink: '#101714',
    cover: { src: portalCoverLocked, alt: 'Blurred preview of the Windows Developer Center with a lock, protected under NDA', width: 1600, height: 1000 },
  },
  {
    id: 'copilot',
    name: 'Copilot Sports',
    category: 'AI answers + design systems',
    headline: 'The answer became the interface.',
    description: 'Copilot answered sports questions in paragraphs. I designed the instant answer: visual cards that read like the game itself, on one system across four sports.',
    summary: "Turned Copilot's text answers into visual sports cards on one reusable schema.",
    role: 'Product designer',
    organization: 'Microsoft',
    timeline: 'March to May 2025',
    team: 'Engineering, plus a designer who owned deeper exploration',
    scope: 'Instant answer cards, design system, every match state, light and dark, desktop and mobile',
    metrics: [
      { value: '4', label: 'New sports per cycle on one schema' },
      { value: '1 system', label: "Carried through Copilot's 2026 redesign" },
    ],
    problem: {
      body: 'Sports fans are high-intent and real time: they want the answer now, and more of them were asking AI for it. Copilot already had the scores, teams and match state, but the answer was still mostly text.',
      stats: [
        { value: '4×', label: 'Growth in sports search interest, 2019 to 2023' },
        { value: '50%', label: 'Of sports searches happen live' },
        { value: '52%', label: 'Of fans used generative AI in 2025, up from 31%' },
      ],
    },
    insight: "The data was there. The interface wasn't.",
    decisions: [
      {
        title: 'Answer first, explore when you want more',
        body: 'I turned the structure already in the sports data into a visual hierarchy, so the card resolves the question at a glance and deeper content waits for fans who want it. I owned that instant layer; another designer owned the exploration below it.',
        shots: [
          { src: copilotBefore, alt: 'Copilot answering a question about the next India versus New Zealand match with a text list', width: 880, height: 588, caption: 'Before: a text answer' },
          { src: copilotAfter, alt: 'Copilot answering a question about the next India T20 match with a visual match card and upcoming fixtures', width: 880, height: 588, caption: 'After: the answer is the card' },
        ],
      },
      {
        title: "One reading model, each sport's own logic",
        body: 'Cricket has overs and run rates, tennis has sets and tiebreaks, F1 has laps and pit windows, and the NFL has downs. A shared layer controls how a card reads (type, spacing, hierarchy, surfaces and states); a sport layer controls what matters. Two card structures carry every sport: a Hero card spotlights one game before, during or after it, and a Table card lists several games for league and team questions. Adding a sport became data mapping, not a redesign.',
        flows: [
          { label: 'Before the system', steps: ['New sport', 'New design', 'New component decisions', 'New implementation'] },
          { label: 'With the system', steps: ['New sport', 'Existing schema', 'Sport-specific mapping', 'Implementation'] },
        ],
        shots: [
          { src: copilotF1, alt: 'Live F1 card for the Emilia Romagna Grand Prix with lap count and the top three drivers', width: 960, height: 666, caption: 'F1' },
          { src: copilotTennis, alt: 'Tennis card for the Indian Wells Open with live set scores', width: 960, height: 666, caption: 'Tennis' },
          { src: copilotCricket, alt: 'Live cricket card for India versus New Zealand with scores, overs and the run chase', width: 960, height: 666, caption: 'Cricket' },
          { src: copilotNfl, alt: 'NFL card for Giants versus Commanders with kickoff time and win probability', width: 763, height: 529, caption: 'NFL' },
        ],
      },
      {
        title: 'Design every state, not just the final score',
        body: 'Cards cover pre-game, live and post-game, plus the edge cases that break layouts: rain delays, red flags, super overs, 40-character names and dense stats. Every state works in light and dark, on desktop and mobile, with component specs engineers could build without reinterpreting. Before launch I reviewed the build against those specs for typography, spacing, score hierarchy, icons and dark mode.',
        shots: [
          { src: copilotPre, alt: "Pre-game cricket card with the start time and each team's recent form", width: 900, height: 485, caption: 'Pre-game' },
          { src: copilotLive, alt: 'Live cricket card with both scores and the runs still needed', width: 900, height: 583, caption: 'Live' },
          { src: copilotPost, alt: 'Post-game cricket card with the result, player of the match and video highlights', width: 900, height: 552, caption: 'Post-game' },
        ],
      },
    ],
    result: {
      body: "The instant answer system shipped across four sports and became the foundation others built Copilot's broader sports experience on. When Copilot introduced a new design language in September 2026, the same system carried straight into the new shell.",
      changes: [
        ['Plain-text answers', 'Visual answers'],
        ['One-off sport designs', 'A shared sports schema'],
        ['Answer as content', 'Answer as interface'],
        ['General UI language', 'Sports-specific design language'],
      ],
      shots: [{ src: copilotShell, alt: "Copilot's 2026 redesign answering a question about India's upcoming matches with the same sports card system", width: 1200, height: 933, caption: "The same system inside Copilot's 2026 redesign" }],
    },
    takeaway: { line: 'Consistency across surfaces is a system property, not a per-card decision.' },
    color: '#2d5bcc',
    ink: '#e2e9f5',
    cover: { src: copilotCover, alt: 'Copilot answering "Next India T20 match" with a match card for India versus New Zealand and a carousel of upcoming fixtures', width: 1400, height: 1447 },
  },
]
