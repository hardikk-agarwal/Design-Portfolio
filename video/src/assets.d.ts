declare module '*.webp' {
  const src: string
  export default src
}

// webpack's require.context, used by Root to find films.
declare const require: { context(directory: string, recursive: boolean, pattern: RegExp): { keys(): string[]; (id: string): unknown } }
