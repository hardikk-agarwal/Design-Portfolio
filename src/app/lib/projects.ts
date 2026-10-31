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
import appTrustCover from '../../assets/work/app-trust-cover.webp'
import appTrustUnverified from '../../assets/work/app-trust-unverified.webp'
import appTrustUnsigned from '../../assets/work/app-trust-unsigned.webp'
import appTrustClean from '../../assets/work/app-trust-clean.webp'
import appTrustMalicious from '../../assets/work/app-trust-malicious.webp'
import appTrustStoreToast from '../../assets/work/app-trust-store-toast.webp'
import appTrustStore from '../../assets/work/app-trust-store.webp'
import appTrustRightClick from '../../assets/work/app-trust-right-click.webp'
import appTrustReport from '../../assets/work/app-trust-report.webp'
import craftCover from '../../assets/work/craft-check-cover.webp'
import craftEmpty from '../../assets/work/craft-check-empty.webp'
import craftRunning from '../../assets/work/craft-check-running.webp'
import craftResults from '../../assets/work/craft-check-results.webp'
import craftActions from '../../assets/work/craft-check-actions.webp'
import craftLoop from '../../assets/work/craft-check-loop.webp'
import storybookCoverLocked from '../../assets/work/figma-storybook-cover-locked.webp'
import xamlCoverLocked from '../../assets/work/xaml-skill-cover-locked.webp'
import prototypeCoverLocked from '../../assets/work/portal-prototype-cover-locked.webp'
import smsCover from '../../assets/work/sms-cover.webp'
import smsNavigation from '../../assets/work/sms-navigation.webp'
import smsReminders from '../../assets/work/sms-reminders.webp'
import smsLanguages from '../../assets/work/sms-languages.webp'
import smsFinance from '../../assets/work/sms-finance.webp'
import smsOffers from '../../assets/work/sms-offers.webp'
import smsFirstRun from '../../assets/work/sms-first-run.webp'
import mapCover from '../../assets/work/map-cover.webp'
import mapDestinations from '../../assets/work/map-destinations.webp'
import mapVerticals from '../../assets/work/map-verticals.webp'
import mapFilters from '../../assets/work/map-filters.webp'
import mapDestination from '../../assets/work/map-destination.webp'
import mapAttraction from '../../assets/work/map-attraction.webp'
import tripsCoverLocked from '../../assets/work/trips-cover-locked.webp'
import sealsCover from '../../assets/work/club-seals-cover.webp'
import sealsHomeToday from '../../assets/work/club-seals-home-today.webp'
import sealsHome from '../../assets/work/club-seals-home.webp'
import sealsHold from '../../assets/work/club-seals-hold.webp'
import sealsCrack from '../../assets/work/club-seals-crack.webp'
import sealsReveal from '../../assets/work/club-seals-reveal.webp'
import sealsWeek from '../../assets/work/club-seals-week.webp'
import sealsGolden from '../../assets/work/club-seals-golden.webp'
import sealsCart from '../../assets/work/club-seals-cart.webp'
import sealsNight from '../../assets/work/club-seals-night.webp'
import sealsShelf from '../../assets/work/club-seals-shelf.webp'
import sealsRules from '../../assets/work/club-seals-rules.webp'

export type Metric = { value: string; label: string }
export type Shot = { src: string; alt: string; width: number; height: number; caption?: string }
export type Quote = { text: string; source: string }
// Words from colleagues' Microsoft feedback; an ellipsis marks each cut. `highlight` is quoted verbatim from `text`.
export type Endorsement = { text: string; role: string; highlight?: string }
export type Flow = { label: string; steps: string[] }
// The opening visual of an AI project, chosen to show its own idea: states to flip through, a tour of the tool,
// a skill run, the live prototype, or a before and after to drag.
export type Stage =
  | { kind: 'fan'; caption: string; items: { label: string; note: string; shot: Shot }[] }
  | { kind: 'tour'; caption: string; items: { label: string; shot: Shot }[] }
  | { kind: 'run'; command: string; caption: string; items: { label: string; shot: Shot }[] }
  | { kind: 'live'; caption: string; href: string; title: string; poster: Shot }
  | { kind: 'compare'; before: Shot; after: Shot }
// Rendered by the Remotion project in video/ into public/films.
// NDA films are AES-GCM encrypted; their key and iv only exist inside the unlocked case study.
export type Film = { src: string; poster: string; captions: string; duration: string; key?: string; iv?: string }

export type CaseStudy = {
  problem: { body: string; stats?: Metric[]; quote?: Quote }
  insight: string
  contrast?: { title: string; items: string[]; keep: boolean }[]
  decisions: { title: string; body: string; shots: Shot[]; flows?: Flow[]; compare?: true }[]
  // Moments where an AI-built project went wrong and how it was caught; `fix` names Hardik only where the work was his.
  steering?: { title: string; wrong: string; fix: string }[]
  result: { title?: string; body: string; metrics?: Metric[]; note?: string; quote?: Quote; changes?: [string, string][]; shots?: Shot[] }
  takeaway: { line: string; body?: string }
  partners?: Endorsement[]
  film?: Film
  // A working prototype readers can open, shown beside the film.
  live?: { href: string; label: string }
  stage?: Stage
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
  // Earlier work is listed on the Work page only, after the featured projects.
  earlier?: true
  // Self-initiated or challenge work that wasn't built: Work page only, labelled as a concept.
  concept?: true
  // Apps, tools and prototypes Hardik built with AI: listed under Built with AI (#ai), never among the case studies.
  tool?: true
  // What an AI project was built with, as short names. Hardik built all of them with GitHub Copilot in VS Code and a Claude Opus model.
  stack?: string[]
}

// Locked case studies live encrypted in src/protected/<id> and open with a password.
export type Project = Teaser & ((CaseStudy & { locked?: never }) | { locked: true })

// Screens come from Hardik's Figma case studies and, for earlier work, his previous portfolio. Figures are the ones those sources and his resume report.
// App Trust screens are rendered from the working app he built and taken from his demo recording.
// Club Seals is a design challenge: its screens come from its prototype and its figures describe the work, not results.
export const projects: Project[] = [
  {
    id: 'store',
    name: 'Microsoft Store',
    category: 'Developer onboarding',
    headline: 'A shorter path to the Store.',
    description: 'I rebuilt company onboarding for Microsoft Store developers. Verification stayed strict; the guesswork around it went away.',
    summary: 'I rebuilt company onboarding around clarity and recovery, without lowering the trust bar.',
    role: 'Product designer',
    organization: 'Microsoft',
    timeline: '2025 to 2026',
    team: '8 partner teams across product, engineering, verification, accounts, legal, support and marketing',
    scope: 'Onboarding, verification, recovery and appeals, implementation review',
    metrics: [
      { value: '35% to 73%', label: 'Onboarding success' },
      { value: '~15 days to ~1 day', label: 'Average vetting time' },
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
        body: 'I replaced one rigid path with three ways to verify: a D-U-N-S number, a lookup by company name and country, or an official business document. AI reads the document and pre-fills the company details for review, while human verification stays in the loop.',
        shots: [{ src: storeOcr, alt: 'Business details step with an uploaded business document and the company details pre-filled from it, ready to review', width: 1600, height: 884 }],
      },
      {
        title: 'Make failure a step, not an ending',
        body: 'Most failures came from domain and email checks, so I brought that check into onboarding: the flow explains which email qualifies and verifies it before anything is submitted. Verification status updates in real time, with a clear reason whenever action is needed. When a check still fails, companies fix it inside the flow and pick up where they left off, and reminders on days 2, 5 and 7 replace the old silence.',
        flows: [
          { label: 'Before: linear and opaque', steps: ['Choose account', 'Sign in with a personal account', 'Fill in details', 'Pay $99', 'Submit', 'Wait', 'Fail?', 'No reason given'] },
          { label: 'After: structured and recoverable', steps: ['Choose account', 'Sign in', 'Business details', 'Contact', 'Submit', 'Verify', 'Resolve or complete'] },
        ],
        shots: [{ src: storeRecover, alt: 'Account verification step explaining that business verification did not succeed, with an Upload document action beside it', width: 1600, height: 884 }],
      },
    ],
    result: {
      body: 'The redesign launched as a pilot in 50 countries, then rolled out to every Microsoft Store market. Onboarding success nearly doubled and the wait for vetting fell from about 15 days to 1, while vetting success held above 80%.',
      metrics: [
        { value: '35% to 73%', label: 'Onboarding success' },
        { value: '~15 days to ~1 day', label: 'Average vetting time' },
        { value: '240+', label: 'Companies onboarded in the pilot' },
        { value: '80%+', label: 'Vetting success held' },
      ],
      note: 'Internal post-launch figures.',
      quote: { text: 'I have created developer accounts before, but with the new onboarding flow everything is so much smoother. From start to finish it took me less than 30 minutes to have a fully vetted business account, ready to go. Removing the onboarding fee is just the cherry on top of the cake.', source: 'Blue Banana Software, Microsoft Store company developer' },
    },
    takeaway: {
      line: "The best onboarding doesn't remove complexity from the system. It absorbs it, so the user doesn't have to.",
      body: 'Along the way I surfaced 400 craft and implementation issues in review, then prototyped Craft Check, a tool that compares the Figma design with the build, to catch them earlier.',
    },
    partners: [
      { text: 'On Company Account Onboarding, the UX requirements were complex (Reverse D-U-N-S search, country-specific fields, verification failure paths, document upload, retry flows), and you consistently delivered clear, high-bar Figma prototypes with a fast turnaround. You didn’t make the team wait on design.', highlight: 'You didn’t make the team wait on design.', role: 'Senior product manager' },
      { text: 'Beyond design, your attention to detail and diligence in ensuring engineering implemented the experience as intended were equally impressive. You also showed strong conviction in holding your ground through tough tradeoff discussions, which helped maintain the integrity of the experience.', highlight: 'holding your ground through tough tradeoff discussions', role: 'Principal PM manager' },
    ],
    film: { src: './films/store.mp4', poster: './films/store-poster.jpg', captions: './films/store.vtt', duration: '1:52' },
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
    summary: 'I redesigned app publishing around how developers think, and tested it with a coded prototype and developer research.',
    role: 'Product designer',
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
    category: 'AI answers and design systems',
    headline: 'The answer became the interface.',
    description: 'Copilot answered sports questions in paragraphs. I designed the instant answer: visual cards that read like the game itself, on one system across four sports.',
    summary: "I turned Copilot's text answers into visual sports cards, built on one reusable schema.",
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
        compare: true,
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
      shots: [{ src: copilotShell, alt: "Copilot's 2026 redesign answering a question about India's upcoming matches with the same sports card system", width: 1134, height: 974, caption: "The same system inside Copilot's 2026 redesign" }],
    },
    takeaway: { line: 'Consistency across surfaces is a system property, not a per-card decision.' },
    film: { src: './films/copilot.mp4', poster: './films/copilot-poster.jpg', captions: './films/copilot.vtt', duration: '1:42' },
    color: '#2d5bcc',
    ink: '#e2e9f5',
    cover: { src: copilotCover, alt: 'Copilot answering "Next India T20 match" with a match card for India versus New Zealand and a carousel of upcoming fixtures', width: 1400, height: 1447 },
  },
  {
    id: 'app-trust',
    name: 'Windows App Trust',
    category: 'Consumer trust and security',
    headline: 'Know who made it before you install it.',
    description: 'Apps from the web leave people guessing who made them. I designed how Windows could show who stands behind an app and what it knows about the file, then built a working app that checks real installers.',
    summary: "I split trust into two questions, who made the app and whether it's the real file, then built a working app that checks real installers. The trust states were piloted in China.",
    role: 'Product designer',
    organization: 'Microsoft',
    timeline: 'March 2026',
    status: 'Piloted in China with Microsoft PC Manager',
    team: 'Store and PC Manager partners on the pilot. I built the working app on my own.',
    scope: 'Research, trust model, install experience, trust states and a working Windows app built with AI',
    tool: true,
    stack: ['GitHub Copilot', 'Claude Opus', 'Python', 'PyQt6'],
    metrics: [
      { value: '313K+', label: 'Trust dialog views in the PC Manager pilot' },
      { value: '6', label: 'Checks in every scan of the working app' },
      { value: '~2 s', label: 'Per scan, with no admin rights' },
    ],
    problem: {
      body: "Windows is open by design: people install apps from the Microsoft Store or straight from the web. Outside the Store, they're left to work out who made an app, whether the file is genuine and what Windows knows about it. A warning can block an app without saying why, and no warning doesn't feel like proof of safety. Technical users check signatures, compare hashes or upload files to VirusTotal; everyone else guesses. In a survey of 60 Windows users, most were already doing this work themselves.",
      stats: [
        { value: '89%', label: 'Said knowing who made an app is important or very important' },
        { value: '87%', label: 'Stop or research an app when they see an unrecognized publisher' },
        { value: '53%', label: 'Want Windows to warn them about unverified developers' },
      ],
    },
    insight: "People weren't asking whether a file was signed. They were asking who made it.",
    contrast: [
      { title: 'Kept: an open platform', items: ['Installs from anywhere', 'Defender, SmartScreen and Smart App Control', 'The choice to install anyway'], keep: true },
      { title: 'Removed: the guesswork', items: ['Certificate jargon', 'Blocks with no reason', 'One badge for every kind of trust', 'Checking VirusTotal by hand'], keep: false },
    ],
    decisions: [
      {
        title: "Separate who made the app from what you're installing",
        body: "A digital signature shows which certificate signed a file and that the file hasn't changed since. It doesn't show who stands behind the app, or whether this is the version they shipped. I split trust into two questions. Is the developer verified, with an identity that follows them across apps and releases? And is this exact file signed, unchanged and recognized? Signals from Defender and reputation services complete the picture, so signed never has to mean safe.",
        flows: [
          { label: 'Before: a verdict without reasons', steps: ['Download', 'A warning, or nothing', 'Guess'] },
          { label: 'After: what Windows knows', steps: ['Who made it', 'Is the developer verified', 'Is this the real file', 'What security signals say', 'What to do next'] },
        ],
        shots: [],
      },
      {
        title: 'Four trust states instead of block or allow',
        body: "A trusted app from a verified developer installs without a question. A signed app from an unverified developer gets a plain explanation and a choice. An unsigned app gets the strongest warning, with exactly what's missing. A known developer shipping an unrecognized version gets a state in between. Every message says what Windows knows, what it doesn't and what to do next, without certificate jargon.",
        shots: [
          { src: appTrustUnverified, alt: 'Windows App Trust dialog: Publisher not verified by Microsoft, for SomeTool_Setup.exe from SomeTool Inc, with Browse Microsoft Store and Install anyway', width: 1096, height: 860, caption: "Signed, but the developer isn't verified" },
          { src: appTrustUnsigned, alt: "Windows App Trust dialog: We don't know who made this app, for an unsigned FoneTool_Installer.exe, with Browse Microsoft Store and Install anyway", width: 1096, height: 860, caption: "Unsigned: Windows can't confirm who made it" },
          { src: appTrustClean, alt: 'SmartInstall notification: ChromeSetup.exe from Google LLC is safe to install, starting installation in 5 seconds', width: 1096, height: 520, caption: 'Trusted: it installs after a short countdown' },
          { src: appTrustMalicious, alt: 'SmartInstall notification: TotalVideoConverter is malicious, with Check report, Install anyway and Don\'t install', width: 1096, height: 600, caption: 'Malicious: stop, and say why' },
        ],
      },
      {
        title: 'Offer a better path, not just a warning',
        body: "A warning alone leaves people stuck with the job they came to do, so the experience also points to the Microsoft Store. It first looks for the same app from the same publisher: Canva's installer leads to Canva in the Store. When there's no match, AI turns the file's name, description and company into a short category search, like a video player, and suggests a verified alternative.",
        shots: [
          { src: appTrustStoreToast, alt: 'SmartInstall notification: Canva Setup is safe to install, with Install, Don\'t install and a link to get Canva from Microsoft Store', width: 1096, height: 600, caption: 'A Store link next to the verdict' },
          { src: appTrustStore, alt: 'Canva open in the Microsoft Store after following the link, with the SmartInstall notification still in the corner', width: 1600, height: 1067, caption: 'One click opens the Store version' },
        ],
      },
      {
        title: 'Build it for real, not just in Figma',
        body: 'To test the experience on real installers, I built a working Windows app with AI, in Python and PyQt6. It runs when a setup file starts, or from the right-click menu. It reads the signature and the executable and combines six checks: digital signature, Windows Defender, VirusTotal, MalwareBazaar, import analysis and file entropy. A scan takes about two seconds without admin rights, and each result maps to a trust state, with a full report for anyone who wants the detail.',
        flows: [{ label: 'How a scan works', steps: ['Run or right-click', 'Read signature and executable', 'Six checks', 'Classify', 'Explain', 'Suggest a next step'] }],
        shots: [
          { src: appTrustRightClick, alt: 'File Explorer right-click menu on Canva Setup in Downloads, with Scan with Windows SmartInstall', width: 1700, height: 1280, caption: 'Scan any installer from the right-click menu' },
          { src: appTrustReport, alt: 'SmartInstall report for a malicious test file: threat detected, app information and security checks for antivirus, malware database, publisher identity and file structure', width: 1360, height: 1440, caption: 'The report behind a verdict' },
        ],
      },
    ],
    steering: [
      {
        title: 'One verdict looked like proof of safety',
        wrong: 'The first build rolled all six signals into a single verdict: safe, suspicious or malicious. A verdict like that looks authoritative even when data is missing, services disagree or a valid signature is taken as proof of safety, and a new app with little reputation can read as malicious.',
        fix: 'I split it into two questions: who made the app, and what we know about this exact file. That split became the trust model, so a verified developer never reads as a safe app by default.',
      },
      {
        title: 'It looked more finished than it was',
        wrong: 'A working app that labels real installers can pass for a production security classifier, while the trust science behind it was still a first pass.',
        fix: 'I presented it as a testable idea for the experience and the signal model, and kept user research, more signals, false-positive analysis and security review as the next steps.',
      },
    ],
    result: {
      body: 'The trust states went into a pilot in China through Microsoft PC Manager, which checks installers downloaded from the web against verified publishers and apps, then shows the matching dialog. The working app showed the full model holding up on real files: developer identity, file provenance and security signals in one answer people can act on.',
      metrics: [
        { value: '313K+', label: 'Trust dialog views in the PC Manager pilot' },
        { value: '20', label: 'Apps in the pilot' },
        { value: '6', label: 'Checks in every scan of the working app' },
        { value: '~2 s', label: 'Per scan, with no admin rights' },
      ],
      note: 'Pilot figures from Microsoft PC Manager. The working app is a prototype.',
    },
    takeaway: {
      line: "Trust isn't a badge. It's knowing who made something and what you're about to run.",
      body: 'The project started as dialog design and became a working trust system I could test on real files.',
    },
    stage: {
      kind: 'fan',
      caption: 'Screens from the working app I built.',
      items: [
        { label: 'Trusted', note: 'a verified developer and a clean file, so it installs after a short countdown.', shot: { src: appTrustClean, alt: 'SmartInstall notification: ChromeSetup.exe from Google LLC is safe to install, starting installation in 5 seconds', width: 1096, height: 520 } },
        { label: 'Unverified developer', note: 'the file is signed, but the developer isn\'t verified, so you get a plain explanation and a choice.', shot: { src: appTrustUnverified, alt: 'Windows App Trust dialog: Publisher not verified by Microsoft, for SomeTool_Setup.exe from SomeTool Inc, with Browse Microsoft Store and Install anyway', width: 1096, height: 860 } },
        { label: 'Unsigned', note: 'no signature, so Windows can\'t confirm who made it or whether it changed. The strongest warning, with what\'s missing.', shot: { src: appTrustUnsigned, alt: "Windows App Trust dialog: We don't know who made this app, for an unsigned FoneTool_Installer.exe, with Browse Microsoft Store and Install anyway", width: 1096, height: 860 } },
        { label: 'Malicious', note: 'security checks flag the file, so it says stop, and why.', shot: { src: appTrustMalicious, alt: "SmartInstall notification: TotalVideoConverter is malicious, with Check report, Install anyway and Don't install", width: 1096, height: 600 } },
      ],
    },
    film: { src: './films/app-trust.mp4', poster: './films/app-trust-poster.jpg', captions: './films/app-trust.vtt', duration: '2:33' },
    color: '#a9c7ee',
    ink: '#0d1b2e',
    cover: { src: appTrustCover, alt: 'Windows App Trust dialog over a dimmed desktop: Publisher not verified by Microsoft, for SomeTool_Setup.exe from SomeTool Inc', width: 1600, height: 1000 },
  },
  {
    id: 'craft-check',
    name: 'Craft Check',
    category: 'Design QA tool',
    headline: 'Catch design drift before it ships.',
    description: 'Designers were the last visual QA gate, comparing builds with Figma by eye after features were built. I built Craft Check on my own with AI: it compares a design with its build, lists every mismatch with the expected and actual value, and hands the list to engineering in one click.',
    summary: 'After finding 400 craft issues by hand for one launch, I built a tool with AI that compares a design with its build, lists every mismatch and files them to engineering in one click.',
    role: 'Product designer',
    organization: 'Microsoft',
    timeline: 'March 2026',
    status: 'Working prototype',
    team: 'Built on my own',
    scope: 'Problem framing, QA workflow, interface design and a working tool built with AI: web app, server and command line',
    tool: true,
    stack: ['GitHub Copilot', 'Claude Opus', 'React', 'Fluent UI', 'GPT-4.1'],
    metrics: [
      { value: '1 click', label: 'From a mismatch to a pre-filled Azure DevOps bug' },
      { value: '2', label: 'Engines in every check: a pixel color diff and an AI vision pass' },
    ],
    problem: {
      body: "Shipping didn't end when the Figma file was done. Engineers translated designs into code, small mismatches piled up, and designers became the last visual QA gate, comparing screens by eye after the feature was built. Every finding meant a screenshot, a write-up and a bug, spread across Figma, Loop and the bug tracker, then another round to check the fix.",
      stats: [
        { value: '400', label: 'Craft and implementation issues I surfaced in review for one launch, Microsoft Store onboarding' },
      ],
    },
    insight: 'Some craft decisions need a designer. Most mismatches just need measuring.',
    contrast: [
      { title: 'Kept: design judgment', items: ['Hierarchy and clarity', 'Interaction and accessibility', 'The formal craft review'], keep: true },
      { title: 'Removed: the mechanical work', items: ['Comparing values by eye', 'Screenshots pasted between tools', 'Writing up every bug by hand', 'Finding drift after the build'], keep: false },
    ],
    decisions: [
      {
        title: "Move the check before the designer's review",
        body: "The old loop ended with a designer inspecting the build. I put a repeatable check in front of that: engineers drop in the design and the build, run the check and fix what it finds before anyone signs off. Two screenshots are enough to start, with no setup, so it fits wherever the work already is.",
        flows: [
          { label: 'Before', steps: ['Figma done', 'Engineer builds', 'Designer inspects by eye', 'Fix', 'Recheck'] },
          { label: 'After', steps: ['Figma done', 'Engineer builds', 'Craft Check', 'Fix', 'Designer validates'] },
        ],
        shots: [{ src: craftEmpty, alt: 'Craft Check before a run: a design panel and an implementation panel, each asking for a Figma link, an app link or a screenshot', width: 1620, height: 950, caption: 'Drop in the design and the build' }],
      },
      {
        title: 'Exact where it can be, AI where it needs judgment',
        body: "Each check runs two engines. A pixel-level color diff catches exact hex mismatches. Then an AI vision model, GPT-4.1, compares both screens for copy, spacing and missing elements, the differences a pixel diff can't explain. A second mode compares Figma tokens with the CSS, SCSS or Windows XAML that should match them.",
        shots: [{ src: craftRunning, alt: 'Craft Check running on a Microsoft Store onboarding screen, with the design on the left, the build on the right and a status line sending both to the AI model', width: 1620, height: 950, caption: 'Pixel diff first, then the AI pass' }],
      },
      {
        title: "Every issue says what's wrong, and where",
        body: 'Each issue names the property, the design value and the built value. Hover an issue and its region lights up on the build; hover the build and the issue lights up, so both panels stay in sync. Filters by type let designers and engineers each focus on what matters to them.',
        shots: [{ src: craftResults, alt: 'Craft Check results: issues such as wrong button color and wrong heading copy, each with a fix, beside the build with the mismatched regions highlighted', width: 1620, height: 950, caption: 'Issues on the left, their regions highlighted on the build' }],
      },
      {
        title: 'Hand it off without retyping',
        body: 'Finding an issue and tracking it used to be separate jobs. From one issue or all of them, one click files a pre-filled bug in Azure DevOps with the title, repro steps and design values, or copies the issues into Loop as a ready table.',
        shots: [
          { src: craftActions, alt: 'Craft Check toolbar with File all to Azure DevOps and Copy to Loop actions', width: 1620, height: 950, caption: 'File to Azure DevOps or copy to Loop' },
          { src: craftLoop, alt: 'A Loop page called Craft Bugs with a table of issues, each with the property, design value, implementation value and fix', width: 1620, height: 950, caption: 'Pasted into Loop as a ready table' },
        ],
      },
    ],
    steering: [
      {
        title: 'A missing link read as a typo',
        wrong: 'Craft Check caught that the helper text had dropped “Look it up” and suggested adding the words back. But “Look it up” was a link into the company lookup, where a company finds its D-U-N-S number. Fixing the sentence alone would have left that path missing.',
        fix: 'I split the finding into copy and behavior: correct the text, and build the missing link to the lookup. Engineering got both, so the journey was fixed and not just the words.',
      },
      {
        title: 'Every color difference became an error',
        wrong: 'It reported near matches such as #D8DDF6 against #DEDEF7 as errors. A small difference can mean a wrong token, but it can also come from theming, opacity or rendering.',
        fix: 'I added a color tolerance and treat the results as a review queue: I check the intended Fluent token before asking engineering for a change. The tool supplies the evidence; a designer makes the call.',
      },
    ],
    result: {
      body: "Craft Check works end to end: drop in a design and a build, get categorized issues in seconds, and send them on to Azure DevOps or Loop. I built it on my own with AI, as a React app with Fluent UI, a server and a command line tool, and took it to Microsoft's FHL hackathon in March 2026. Next comes direct Figma integration, then a check on every pull request.",
      metrics: [
        { value: '2', label: 'Engines in every check' },
        { value: '4', label: 'Issue types: color, copy, spacing and missing elements' },
        { value: '3', label: 'Code formats for token checks: CSS, SCSS and XAML' },
        { value: '1 click', label: 'To Azure DevOps or Loop' },
      ],
      note: 'A working prototype, not yet rolled out to teams. The 400 issues were found by hand, before it existed.',
    },
    takeaway: {
      line: 'Automate the measuring, not the judgment.',
      body: "Building it changed how I see the designer's job: the handoff and the quality loop are part of the design too.",
    },
    stage: {
      kind: 'tour',
      caption: 'One check, from two screenshots to a filed bug.',
      items: [
        { label: 'Drop in the design and the build', shot: { src: craftEmpty, alt: 'Craft Check before a run: a design panel and an implementation panel, each asking for a Figma link, an app link or a screenshot', width: 1620, height: 950 } },
        { label: 'Pixel diff first, then the AI pass', shot: { src: craftRunning, alt: 'Craft Check running on a Microsoft Store onboarding screen, with the design on the left and the build on the right', width: 1620, height: 950 } },
        { label: 'Every mismatch, located on the build', shot: { src: craftResults, alt: 'Craft Check results: issues with design and built values beside the build, with the mismatched regions highlighted', width: 1620, height: 950 } },
        { label: 'Filed to Azure DevOps in one click', shot: { src: craftActions, alt: 'Craft Check toolbar with File all to Azure DevOps and Copy to Loop actions', width: 1620, height: 950 } },
      ],
    },
    film: { src: './films/craft-check.mp4', poster: './films/craft-check-poster.jpg', captions: './films/craft-check.vtt', duration: '2:17' },
    color: '#c9b8f5',
    ink: '#1b1230',
    cover: { src: craftCover, alt: 'Craft Check results: a list of issues with design and built values beside the implementation screen, with mismatched regions highlighted', width: 1620, height: 950 },
  },
  {
    id: 'portal-prototype',
    name: 'Developer Center, vibe coded',
    category: 'AI-built prototype',
    headline: 'The whole developer journey, clickable before it was built.',
    description: 'I built the new Windows Developer Center end to end with AI, from a developer finding it in search to publishing an app, so product, engineering and leadership could use the direction instead of imagining it.',
    summary: 'I built it end to end with AI, from a search result to a published app, so product, engineering and leadership could use the direction instead of imagining it.',
    role: 'Product designer',
    organization: 'Microsoft',
    timeline: 'June to September 2026',
    status: 'Prototype for alignment and research',
    team: 'I built it with AI; two product managers also edited it',
    scope: 'End-to-end prototype with GitHub Copilot, Opus 4.8 and Fluent: search, marketing, sign-in, portal, publishing, certificates and analytics',
    tool: true,
    stack: ['GitHub Copilot', 'Claude Opus 4.8', 'Fluent web components'],
    metrics: [
      { value: '6', label: 'Versions of the publishing flow, built in code' },
      { value: '4', label: 'Developers tested the core flow' },
      { value: '2', label: 'Leadership reviews of the whole journey' },
    ],
    locked: true,
    color: '#f4e19a',
    ink: '#2a2208',
    cover: { src: prototypeCoverLocked, alt: 'Blurred preview of the vibe-coded Windows Developer Center with a lock, protected under NDA', width: 1600, height: 1000 },
  },
  {
    id: 'figma-storybook',
    name: 'Figma to Storybook',
    category: 'Design to code',
    headline: 'From a Figma frame to a reviewed component.',
    description: 'My idea for the Windows Developer Center: an AI workflow that turns approved Figma screens into reusable React components, reviewed in Storybook and merged through engineering’s pull requests.',
    summary: 'I brought Storybook into our design-to-code process and wrote the AI skill that turns Figma screens into components engineers can review.',
    role: 'Product designer, workflow lead',
    organization: 'Microsoft',
    timeline: 'September 2026',
    status: 'Proof of concept',
    team: 'Led it, with two product managers and two engineers',
    scope: 'Agent skill, Figma MCP, React and Fluent 2 components, Storybook, pull request and package flow',
    tool: true,
    stack: ['GitHub Copilot', 'Claude Opus', 'Figma MCP', 'React', 'Fluent 2', 'Storybook'],
    metrics: [
      { value: '65', label: 'Stories in the shared Storybook' },
      { value: '4', label: 'Reusable parts from one portal page' },
      { value: '1 link', label: 'A Figma frame link starts the skill' },
    ],
    locked: true,
    color: '#f5b8cb',
    ink: '#2b0d17',
    cover: { src: storybookCoverLocked, alt: 'Blurred preview of the Figma to Storybook workflow with a lock, protected under NDA', width: 1600, height: 1000 },
  },
  {
    id: 'xaml-skill',
    name: 'Windows XAML skill',
    category: 'Native Windows prototyping',
    headline: 'From a screenshot to a running Windows app.',
    description: 'Windows UX Engineering built an AI skill that writes and reviews WinUI 3 code. Within hours of their workshop I rebuilt legacy Windows surfaces with it, then wrote a guide and taught our design team to do the same.',
    summary: 'Within hours of Windows UX Engineering’s workshop, I rebuilt legacy Windows surfaces as native WinUI 3 prototypes with their AI skill, then taught our design team to do the same.',
    role: 'Product designer',
    organization: 'Microsoft',
    timeline: 'July 2026',
    status: 'Prototypes and team training',
    team: 'With Windows UX Engineering in Redmond',
    scope: 'WinUI 3 prototypes from screenshots, a visual guide for designers and a live team session',
    tool: true,
    stack: ['GitHub Copilot', 'Claude Opus', 'WinUI 3', 'XAML'],
    metrics: [
      { value: '3', label: 'Legacy Windows surfaces rebuilt as WinUI 3 prototypes' },
      { value: '1 afternoon', label: 'From the workshop to two running prototypes' },
      { value: '10 days', label: 'From learning the skill to teaching it' },
    ],
    locked: true,
    color: '#a9e4cf',
    ink: '#0b2a20',
    cover: { src: xamlCoverLocked, alt: 'Blurred preview of the Windows XAML skill prototypes with a lock, protected under NDA', width: 1600, height: 1000 },
  },
  {
    id: 'sms-organizer',
    name: 'SMS Organizer',
    category: 'Android app redesign',
    headline: 'The inbox that speaks your language.',
    description: "I redesigned SMS Organizer, Microsoft's messaging app for India, from audit to delivery: one clear navigation, reminders you can act on, and messages you can translate or hear read aloud.",
    summary: "I redesigned Microsoft's SMS app for India around clarity, smarter reminders and messages in your own language.",
    role: 'Product designer',
    organization: 'Microsoft x Tech Mahindra',
    timeline: 'April to October 2023',
    team: 'A senior designer who oversaw the work, 1 product manager and 4+ engineers',
    scope: 'Research, competitive analysis, app audit, Material 3 design system, usability testing and delivery',
    metrics: [
      { value: '30%', label: 'Lift in user engagement' },
      { value: '5+', label: 'Languages, translated or read aloud' },
    ],
    problem: {
      body: "SMS Organizer sorts an Indian inbox on the phone itself, from one-time passwords and bills to bookings and offers, without uploading a thing. People loved what it did. They didn't love using it: reviews kept asking for a modern, easier app, and my audit showed why. Two navigation bars competed for attention, text was small and low in contrast, reminders stopped at the alert, and messages arrived in languages some readers couldn't read.",
      stats: [
        { value: '1M+', label: 'Downloads, with every message sorted on the device' },
        { value: '2', label: 'Navigation bars competing on one screen' },
        { value: '20+', label: 'Languages spoken across India' },
      ],
      quote: { text: 'Never seen such an advanced messaging app… Just an attractive GUI lacks, especially because this app is by Microsoft.', source: 'Google Play review, March 2023' },
    },
    insight: "The app was smart. The interface didn't show it.",
    contrast: [
      { title: 'Kept: what people already loved', items: ['Sorting on the device, nothing uploaded', 'OTP copying', 'Bills and accounts tracked', 'Offers in one place', 'Backup and restore'], keep: true },
      { title: 'Removed: what got in the way', items: ['Two competing navigation bars', 'Small, low-contrast text', 'Reminders that stopped at the alert', "Messages people couldn't read", 'Taps with no feedback', 'A dated look'], keep: false },
    ],
    decisions: [
      {
        title: 'One navigation, within thumb reach',
        body: "Two navigation bars made every screen harder to parse. I moved primary navigation to the bottom, where it's familiar and easy to reach, turned the top bar into clearly secondary message filters and named the current page in bold. More space, a clearer type hierarchy, larger text options and stronger contrast took out the rest of the noise. Moving the bar overnight would have broken habits, so the update asks people before swapping it.",
        shots: [{ src: smsNavigation, alt: 'Before and after of the SMS Organizer inbox, annotated: the old app with two navigation bars at the top, and the new one with message filters at the top and the main navigation at the bottom', width: 1600, height: 784 }],
      },
      {
        title: 'Reminders that help you act',
        body: "Reminders sat in one flat list and stopped at the alert. I redesigned them around the next step: the app creates them from booking messages for flights, trains, hotels, movies and doctor's appointments, groups them by type and shows the details that matter. Tapping one opens a sheet with relevant information from Bing, like hotels at your destination, so the next step is right there.",
        shots: [{ src: smsReminders, alt: 'Reminders before and after, annotated: a plain list in the old app, and grouped reminder cards in the new one, with a flight reminder open in a sheet that suggests hotels and car rentals', width: 1600, height: 1105 }],
      },
      {
        title: 'Every message in a language you know',
        body: "An SMS arrives in whichever language the sender chose, and that isn't always one the reader can read. I built language into the core of the app: people pick theirs once, translate any message into it or hear it read aloud, which matters for people who understand a language better than they read it. Every layout was designed to hold when a translation runs long.",
        shots: [{ src: smsLanguages, alt: 'Multilingual features, annotated: choosing a preferred language from English, Gujarati, Hindi, Marathi, Tamil and Telugu, and a conversation showing a message, its translation and a read-aloud option', width: 1600, height: 774 }],
      },
    ],
    result: {
      body: 'In UX Labs testing, people preferred the new design to the old one for its layout and modern look. It shipped on a Material 3 design system I built, with a brighter blue chosen through analogous color theory, themes to choose from, micro-animations that answer taps, swipes and filters, and designed empty, error and first-run states.',
      metrics: [
        { value: '30%', label: 'Lift in user engagement' },
        { value: '5+', label: 'Languages, translated or read aloud' },
        { value: '8+', label: 'Themes to make it yours' },
        { value: '4.5:1', label: 'Minimum text contrast' },
      ],
      shots: [
        { src: smsFinance, alt: 'Finance screen listing bank accounts and credit cards with balances read from SMS', width: 900, height: 1895, caption: 'Finance' },
        { src: smsOffers, alt: 'Offers screen with cashback offers grouped by category', width: 900, height: 1895, caption: 'Offers' },
        { src: smsFirstRun, alt: 'First-run screen introducing message translation', width: 900, height: 1873, caption: 'First run' },
      ],
    },
    takeaway: {
      line: 'Redesigning an app people already use is a migration as much as a launch.',
      body: 'The screens were half the work. The other half was a system that could take a longer translation on any screen, and a phased rollout that let existing users move at their own pace.',
    },
    film: { src: './films/sms-organizer.mp4', poster: './films/sms-organizer-poster.jpg', captions: './films/sms-organizer.vtt', duration: '1:50' },
    earlier: true,
    color: '#4466ff',
    ink: '#ffffff',
    cover: { src: smsCover, alt: "Redesigned SMS Organizer Reminders screen with an Amazon order, a doctor's appointment and two bills, above the new bottom navigation", width: 900, height: 1895 },
  },
  {
    id: 'travel-map',
    name: 'Bing Travel Map',
    category: 'Travel discovery',
    headline: 'The whole trip, on one map.',
    description: "I took Bing Travel's map from concept to MVP: one interactive map for destinations, hotels, attractions and transit, so planning a trip no longer means switching apps.",
    summary: 'I brought destinations, hotels, attractions and transit onto one map for Bing Travel.',
    role: 'Product designer',
    organization: 'Microsoft x Tech Mahindra',
    timeline: 'November 2023 to January 2024',
    team: '1 product manager and 3+ engineers',
    scope: 'Concept, interaction design, usability testing and delivery of key modules',
    metrics: [
      { value: '5', label: 'Travel verticals on one map' },
      { value: '68%', label: 'Map click rate in UX Labs studies' },
    ],
    problem: {
      body: 'Travelers plan on maps. They check whether a hotel is close to what they want to see, and whether a day is even feasible. On Bing, planning a trip meant switching between apps and sites for hotels, flights, activities and transit, with no way to narrow the map to what mattered and little help deciding where to go in the first place.',
      stats: [{ value: '68%', label: 'Click rate on maps across UX Labs studies' }],
      quote: { text: 'I just look at the location of every place on the map to check that I do not take something which is very far, because feasibility is important.', source: 'Research participant, Bing Travel' },
    },
    insight: "Travelers don't plan in lists. They plan in places.",
    decisions: [
      {
        title: 'Help people decide where to go',
        body: "Many travelers start without a destination, so the map starts there too. It groups places by continent with the top picks from each, offers trips nearby and prices them from where you're browsing. Themes like beaches, relaxation and adventure narrow the field, and each destination shows when to visit, the weather, average flight and hotel costs, and the currency and visa details people check before they commit.",
        shots: [{ src: mapDestinations, alt: 'Exploring destinations, annotated: a panel of nearby, North American and Asian destinations with the browsing location and search, beside a map that groups destinations by continent', width: 1600, height: 897 }],
      },
      {
        title: 'Every vertical on one map',
        body: "I brought every travel vertical onto one surface. One search covers destinations, hotels, attractions and countries, each destination gathers flights, hotels, attractions, transit and restaurants, and the map pins all of them, so a hotel's distance from the sights shows at a glance. People choose which pins they see.",
        flows: [
          { label: 'Before: a tab for every question', steps: ['Search hotels', 'Open a map', 'Look up attractions', 'Back to hotels', 'Find transit'] },
          { label: 'After: one map for the whole trip', steps: ['Search a destination', 'See every vertical pinned', 'Filter to what matters', 'Choose with distance in view'] },
        ],
        shots: [{ src: mapVerticals, alt: 'Miami on one map, annotated: universal search, the selected destination with top attractions, flights and hotels, and a map pinning all of them', width: 1600, height: 869 }],
      },
      {
        title: 'Filter the map to what matters',
        body: 'A map with every pin is as hard to read as a long list. I designed filters that narrow it to attractions, stays, restaurants or transit, one at a time or combined, with sub-filters inside each. A heat map shows where restaurants are in demand, and transit options show how to get around the city.',
        shots: [{ src: mapFilters, alt: 'Filter states of the Miami map, annotated: all pins, multi-select filters, attractions only, stays only, restaurants with a demand heat map, and transit', width: 1600, height: 1253 }],
      },
    ],
    result: {
      body: 'I explored the map from mild to wild. The mild ideas gave engineering something to build early, and the wild ones showed where the experience could go. I tested the concepts with users, prioritized an MVP with the product manager and engineers, and delivered its key modules.',
      changes: [
        ['Switching between apps', 'Every vertical on one map'],
        ['Not sure where to go', 'Destinations by region, theme and season'],
        ['Every pin at once', 'Filters for what matters'],
      ],
      shots: [
        { src: mapDestination, alt: 'Miami destination panel with the best time to visit, things to do and flights, beside a map of hotel and attraction pins', width: 1600, height: 955, caption: 'A destination, with every vertical pinned' },
        { src: mapAttraction, alt: 'Zoo Miami detail with peak hours, opening times and nearby attractions, beside the map', width: 1600, height: 955, caption: 'An attraction in context' },
      ],
    },
    takeaway: {
      line: 'Design without constraints first, then let the team decide what ships.',
      body: 'I had to hold the vision and the plan at once. Starting wide kept the map ambitious, and prioritizing with product and engineering kept the first release buildable.',
    },
    film: { src: './films/travel-map.mp4', poster: './films/travel-map-poster.jpg', captions: './films/travel-map.vtt', duration: '1:54' },
    earlier: true,
    color: '#1e5b4f',
    ink: '#e3efe9',
    cover: { src: mapCover, alt: 'Bing Travel map with an Explore panel of nearby, North American and Asian destinations beside a world map of destination pins', width: 1600, height: 950 },
  },
  {
    id: 'trip-planning',
    name: 'Bing Trip Planning',
    category: 'Travel planning',
    headline: 'Pick up the trip where you left it.',
    description: "I designed trip planning for Bing Travel, from north star to delivery: one page per trip that remembers what you saved, what you booked and what's left to do.",
    summary: 'I designed one page per trip on Bing Travel that remembers your planning across sessions.',
    role: 'Product designer',
    organization: 'Microsoft x Tech Mahindra',
    timeline: 'June to September 2024',
    team: 'A senior designer for overall look and feedback, 1 product manager and 2+ engineers',
    scope: 'Concept, north star design, interaction design and delivery of key modules',
    metrics: [{ value: '1 page', label: 'Per trip, for every save and booking' }],
    locked: true,
    earlier: true,
    color: '#f2a65a',
    ink: '#1d1308',
    cover: { src: tripsCoverLocked, alt: 'Blurred preview of Bing Trip Planning with a lock, protected under NDA', width: 1600, height: 1000 },
  },
  {
    id: 'club-seals',
    name: 'Club Seals',
    category: 'Rewards and gamification',
    headline: 'Always something inside.',
    description: 'In a 24-hour challenge for FirstClub, a premium grocery app, I turned its hidden Toss & Win game into a daily wax seal you hold to open, with something useful inside every time.',
    summary: 'A 24-hour concept for FirstClub: a daily wax seal that always has something useful inside.',
    role: 'Product designer',
    organization: 'FirstClub design challenge',
    timeline: 'October 2026, in 24 hours',
    status: 'Concept, not affiliated with FirstClub',
    team: 'Solo',
    scope: 'App audit, concept, interaction and motion design, edge cases, and a clickable prototype built with AI',
    metrics: [
      { value: '24 hours', label: 'From brief to a clickable prototype' },
      { value: '18', label: 'Screens in the main flow' },
      { value: '9', label: 'Edge cases designed' },
    ],
    problem: {
      body: 'The brief asked for a gamified way for members to find and unlock offers, something that gives them a reason to come back and feels like FirstClub. I started with the live app. Offers and rewards already showed up in at least six places, from the gift icon on Home to the cart, and nearly all of them asked for something first: a bigger cart, a first order or a referral. The one game, Toss & Win, sits in the Profile menu, and for a new member it opens to an empty screen with no way to play. A toss can also land on the losing side, which sits badly with a brand built on “tested and tasted”.',
      stats: [
        { value: '6+', label: 'Places offers and rewards show up in the app' },
        { value: '3', label: 'Prompts to spend more on a single cart screen' },
      ],
      quote: { text: 'No Rewards Earned Yet. Play to unlock them now', source: 'Toss & Win for a new member, with no button to play' },
    },
    insight: 'Plenty of rewards. No reason to come back tomorrow.',
    contrast: [
      { title: 'Kept: what members already know', items: ['The gift icon on Home', 'The Toss & Win rewards inbox', "The cart's Gifts for you rail", 'The Free chip and struck-out price', 'The FirstClub Approved stamp'], keep: true },
      { title: 'Left out: what makes rewards feel like work', items: ['A side that loses', 'Spending more to unlock', 'An empty screen with nothing to do', 'Streaks that reset', 'Countdowns', 'Another pop-up'], keep: false },
    ],
    decisions: [
      {
        title: 'Put it where members already look',
        body: "I compared four places for a daily reward on Home: a slide in the hero carousel, a pop-up when the app opens, a new tab and the gift icon. The carousel has six slides, Home opens with a pop-up and the tab bar is full. The gift icon already means rewards, so a small wax seal appears on it only when there's one to open, with a one-time tip for new members. Toss & Win's row in Profile becomes Club Seals, so the old way in keeps working.",
        flows: [
          { label: 'Before: rewards behind the Profile menu', steps: ['Profile', 'Toss & Win', 'Empty inbox', 'Nothing to play'] },
          { label: 'After: a seal on the gift icon', steps: ['Home', 'Gift icon', 'Hold the seal', 'Something inside'] },
        ],
        compare: true,
        shots: [
          { src: sealsHomeToday, alt: "FirstClub's Home screen today, with the gift and wallet icons at the top right and a Free raisins and cashews banner", width: 900, height: 1948, caption: 'Home today' },
          { src: sealsHome, alt: 'The same Home screen with a small green wax seal on the gift icon and a one-time tip: a sealed gift waits here every day', width: 900, height: 1948, caption: 'With a seal on the gift icon' },
        ],
      },
      {
        title: "Make the brand's stamp something you open",
        body: "FirstClub already has a round “FirstClub Approved” stamp with its F, so I made that stamp into a wax seal. Opening it is a press and hold for under a second: a ring fills, the phone ticks and the seal cracks. Holding gives the moment some weight and stops accidental opens, and letting go early costs nothing. The daily seal never needs a purchase, and there's always something useful inside, most often a member price or free delivery. Every reward is used with an order, so the cost only lands when someone orders. The reveal says what it is and how long it's valid, with no “You won!” and no countdown.",
        flows: [{ label: 'From their stamp to a seal', steps: ['FirstClub Approved stamp', 'A wax seal with the same F', 'Hold to break it', 'Something inside'] }],
        shots: [
          { src: sealsHold, alt: 'Rewards page with the wax seal on an envelope and a red ring filling around it while it is held', width: 900, height: 1948, caption: 'Hold' },
          { src: sealsCrack, alt: 'The wax seal splitting into two halves on the envelope', width: 900, height: 1948, caption: 'It cracks' },
          { src: sealsReveal, alt: 'Reveal card: a treat from FC Cafe, a box of six choco chip cookies, free, valid till Wednesday, with progress toward this week', width: 900, height: 1948, caption: "What's inside" },
        ],
      },
      {
        title: 'Give the week a goal, with no streak to lose',
        body: "Streaks punish the one day life gets in the way. Instead, any five seals in a week turn the card gold, and the Golden Seal lets members choose one of three gifts, the same way Refer & Earn lets them choose. A seal also comes with every order, opened during the wait for delivery, so five is reachable without opening the app every day. Rewards apply on their own in the cart's Gifts for you rail, with no code and no “shop for ₹X more”.",
        flows: [
          { label: 'First try: a daily streak', steps: ['Day 3 streak', 'Miss a day', 'Start again'] },
          { label: 'Now: any five days in a week', steps: ['Five seals', 'Golden Seal', 'Choose a gift', 'Applied in the cart'] },
        ],
        shots: [
          { src: sealsWeek, alt: 'Rewards page after opening a seal: this week shows 3 of 5 seals, with a gift at the end of the row', width: 900, height: 1948, caption: 'Five in a week' },
          { src: sealsGolden, alt: 'Golden Seal: choose one of three gifts worth up to 500 rupees, mustard oil, cheese or a week of free delivery', width: 900, height: 1948, caption: 'Choose a gift' },
          { src: sealsCart, alt: "Cart with the cookies already unlocked in the Gifts for you rail and listed as free from your seal", width: 900, height: 1948, caption: 'Applied in the cart' },
        ],
      },
    ],
    result: {
      title: 'Where it landed',
      body: "I delivered it in 24 hours: an audit of the live app, four directions, the main flow, nine edge cases, motion specs, a component library and a clickable prototype. Most of the edge cases are about not punishing people: missing a day resets nothing, a full shelf asks before anything goes, and the rules and odds are one tap away. It isn't built, so there are no results yet. Next I'd test the hold with five to eight members, then measure weekly seal opens, rewards used and orders per member against a holdout group, with checkout conversion as the guardrail.",
      changes: [
        ['A toss with a losing side', 'A seal with something in every one'],
        ['Only in the Profile menu', "On the gift icon, when there's a seal"],
        ['Spend more to unlock', 'Rewards that apply on their own'],
        ['An empty screen for new members', 'A seal waiting on the first visit'],
      ],
      shots: [
        { src: sealsNight, alt: 'After midnight the seal rests on a dark envelope until 6 AM, with an optional reminder', width: 900, height: 1948, caption: 'After midnight' },
        { src: sealsShelf, alt: 'Sheet for when three rewards are already saved: swap one out for the new one or keep the current three', width: 900, height: 1948, caption: 'Holding three already' },
        { src: sealsRules, alt: 'How seals work: five rules, the odds for each kind of reward and who can take part', width: 900, height: 1948, caption: 'Rules and odds' },
      ],
    },
    takeaway: {
      line: 'Most of the work was finding what the app already had, and connecting it.',
      body: "The gift icon, the rewards inbox, the cart's gift rail, the Free chip and the Approved stamp were all there. The new parts are small: a seal, a hold and a weekly card. I used AI to build the clickable prototype and the Figma file, which is how one person covered the audit, the flow, the edge cases and the motion in a day.",
    },
    film: { src: './films/club-seals.mp4', poster: './films/club-seals-poster.jpg', captions: './films/club-seals.vtt', duration: '1:57' },
    concept: true,
    color: '#0e4d2e',
    ink: '#f3ecdc',
    cover: { src: sealsCover, alt: 'Club Seals Rewards page: a cream envelope closed with a green wax seal, press and hold to open, and this week at 2 of 5', width: 900, height: 1948 },
  },
]
