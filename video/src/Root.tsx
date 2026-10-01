import type { ComponentType } from 'react'
import { Composition } from 'remotion'

type FilmModule = { Film: ComponentType; timeline: { fps: number; durationInFrames: number } }
// One composition per films/<id>/index.ts. NDA films live in git-ignored folders, so the list is whatever is on disk.
const films = require.context('./films', true, /^\.\/[\w-]+\/index\.ts$/)

export function Root() {
  return (
    <>
      {films.keys().map((key) => {
        const id = key.split('/')[1]
        const { Film, timeline } = films(key) as FilmModule
        return <Composition key={id} id={id} component={Film} durationInFrames={timeline.durationInFrames} fps={timeline.fps} width={1920} height={1080} />
      })}
    </>
  )
}
