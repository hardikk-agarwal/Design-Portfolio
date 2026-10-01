// Turns a film's beat list (films/<id>/beats.js) into times: frames within the scene for the film, seconds for the mixer.
// A fragment's time is interpolated by its position in the narration line.
/**
 * @param {{ fps: number, scenes: { id: string, from: number, lines: { text: string, start: number, seconds: number }[] }[] }} timeline
 * @param {(string | number | null)[][]} defs
 * @returns {Record<string, { sec: number, frame: number, sound: string | null }>}
 */
export function beats(timeline, defs) {
  /** @type {Record<string, { sec: number, frame: number, sound: string | null }>} */
  const out = {}
  for (const [sceneId, line, fragment, name, sound] of defs) {
    const scene = timeline.scenes.find((s) => s.id === sceneId)
    if (!scene) throw new Error(`No scene ${sceneId}`)
    const l = scene.lines[Number(line)]
    const index = fragment === '^' ? 0 : l.text.indexOf(String(fragment))
    if (index < 0) throw new Error(`Beat "${fragment}" not found in ${sceneId} line ${line}`)
    const sec = l.start + l.seconds * (index / l.text.length)
    out[`${sceneId}.${name}`] = { sec, frame: Math.round(sec * timeline.fps) - scene.from, sound: sound == null ? null : String(sound) }
  }
  return out
}
