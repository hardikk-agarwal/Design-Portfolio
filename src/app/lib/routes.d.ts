export type ProjectId = 'store' | 'portal' | 'copilot' | 'sms-organizer' | 'travel-map' | 'trip-planning'

export type Route =
  | { page: 'home'; anchor?: string }
  | { page: 'work' }
  | { page: 'about' }
  | { page: 'resume' }
  | { page: 'project'; id: ProjectId }

export declare const projectIds: ProjectId[]
export declare function parseRoute(hash: string): Route
export declare function routeKey(route: Route): string
export declare function routeTitle(route: Route, names?: Record<string, string>): string
