export const exhibits = [
  {
    id: 'store', label: 'Microsoft Store', discipline: 'Platform design', lens: 'End-to-end ownership',
    title: 'A shorter path to the Store.',
    summary: 'Company onboarding, redesigned from the first step.',
    color: '#b52845', paper: '#f0e7e6', ink: '#43202a',
    metric: '73%', metricLabel: 'Onboarding success', baselineLabel: 'Previous onboarding success', baseline: '35%',
    detail: 'Approx. 15 days to 1 day', detailLabel: 'Time to onboard',
    artwork: 'Three layered doorway frames with an open path through the centre, an original illustration for Microsoft Store onboarding.',
  },
  {
    id: 'copilot', label: 'Copilot Sports', discipline: 'AI + design systems', lens: 'Systems thinking',
    title: 'New sports, same playbook.',
    summary: 'A shared design language for a world of sports.',
    color: '#2d5bcc', paper: '#e2e9f5', ink: '#182c59',
    metric: '04', metricLabel: 'New sports per cycle', baselineLabel: 'System foundation', baseline: 'One reusable schema',
    detail: '4 new sports per cycle', detailLabel: 'Design-system impact',
    artwork: 'Four open rectangular modules in blue, lime and white, an original illustration of the reusable Copilot Sports schema.',
  },
  {
    id: 'hello', label: 'Windows Hello', discipline: 'Identity + interaction', lens: 'Usability and craft',
    title: 'Trust starts at sign-in.',
    summary: 'Making everyday sign-in feel more dependable.',
    color: '#d0e266', paper: '#eaf0d3', ink: '#293724',
    metric: '83.2', metricLabel: 'System Usability Scale', baselineLabel: 'Previous usability score', baseline: '79.5 SUS',
    detail: '20% fewer craft bugs', detailLabel: 'Interaction quality',
    artwork: 'An abstract fingerprint made of curved dark ridges on lime, an original illustration for Windows Hello, not a real biometric sample.',
  },
  {
    id: 'vr', label: 'PlayShifu', discipline: 'AR / VR', lens: 'Spatial interaction',
    title: 'Beyond the flat screen.',
    summary: 'Learning games, avatars, and interfaces in the world.',
    color: '#dc6b3d', paper: '#f2e8df', ink: '#573020',
    metric: '6+', metricLabel: 'AR STEM games', baselineLabel: 'Learning experiences', baseline: '6+ AR STEM games',
    detail: '10,000+ avatar users', detailLabel: 'Personal worlds',
    artwork: 'An arch, a blue corner and a lime wedge arranged as dimensional play pieces, an original illustration for PlayShifu.',
  },
]

export function exhibitAt(index) {
  return exhibits[((index % exhibits.length) + exhibits.length) % exhibits.length]
}

export function exhibitIndex(id) {
  return Math.max(0, exhibits.findIndex(exhibit => exhibit.id === id))
}