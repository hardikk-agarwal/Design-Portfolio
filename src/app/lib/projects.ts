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

export type Metric = { value: string; label: string }
export type Shot = { src: string; alt: string; width: number; height: number; caption?: string }
export type Quote = { text: string; source: string }
// Words from colleagues' Microsoft feedback; an ellipsis marks each cut. `highlight` is quoted verbatim from `text`.
export type Endorsement = { text: string; role: string; highlight?: string }
export type Flow = { label: string; steps: string[] }
// Rendered by the Remotion project in video/ into public/films.
// NDA films are AES-GCM encrypted; their key and iv only exist inside the unlocked case study.
export type Film = { src: string; poster: string; captions: string; duration: string; key?: string; iv?: string }

export type CaseStudy = {
  problem: { body: string; stats?: Metric[]; quote?: Quote }
  insight: string
  contrast?: { title: string; items: string[]; keep: boolean }[]
  decisions: { title: string; body: string; shots: Shot[]; flows?: Flow[]; compare?: true }[]
  result: { title?: string; body: string; metrics?: Metric[]; note?: string; quote?: Quote; changes?: [string, string][]; shots?: Shot[] }
  takeaway: { line: string; body?: string }
  partners?: Endorsement[]
  film?: Film
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
}

// Locked case studies live encrypted in src/protected/<id> and open with a password.
export type Project = Teaser & ((CaseStudy & { locked?: never }) | { locked: true })

// Screens come from Hardik's Figma case studies and, for earlier work, his previous portfolio. Figures are the ones those sources and his resume report.
export const projects: Project[] = [
  {
    id: 'store',
    name: 'Microsoft Store',
    category: 'Developer onboarding',
    headline: 'A shorter path to the Store.',
    description: 'I rebuilt company onboarding for Microsoft Store developers. Verification stayed strict; the guesswork around it went away.',
    summary: 'I rebuilt company onboarding around clarity and recovery, without lowering the trust bar.',
    role: 'Sole product designer',
    organization: 'Microsoft',
    timeline: '2025 to 2026',
    team: '8 partner teams across product, engineering, verification, accounts, legal, support and marketing',
    scope: 'Onboarding, verification, recovery and appeals, implementation review',
    metrics: [
      { value: '35% to 73%', label: 'Onboarding success' },
      { value: '~15 days to ~1 day', label: 'Average vetting time' },
      { value: '240+', label: 'Companies onboarded in a 50-country pilot' },
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
    role: 'Sole product designer',
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
      body: 'Being the only designer meant holding the vision and the plan at once. Starting wide kept the map ambitious, and prioritizing with product and engineering kept the first release buildable.',
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
]
