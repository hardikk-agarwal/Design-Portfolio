export type ProjectId = 'store' | 'portal' | 'copilot' | 'app-trust' | 'craft-check' | 'figma-storybook' | 'xaml-skill' | 'portal-prototype' | 'sms-organizer' | 'travel-map' | 'trip-planning' | 'club-seals'

export type Route =
  | { page: 'home'; anchor?: string }
  | { page: 'work' }
  | { page: 'ai' }
  | { page: 'about' }
  | { page: 'resume' }
  | { page: 'project'; id: ProjectId; film?: true }

export type Section = 'work' | 'ai'

export declare const workIds: ProjectId[]
export declare const aiIds: ProjectId[]
export declare const projectIds: ProjectId[]
export declare function projectSection(id: ProjectId): Section
export declare function projectHash(id: ProjectId): string
export declare function parseRoute(hash: string): Route
export declare function routeKey(route: Route): string
export declare function routeTitle(route: Route, names?: Record<string, string>): string
