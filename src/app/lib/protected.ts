import type { CaseStudy } from './projects'
import type { ProjectId } from './routes.js'

type Box = { iv: string; data: string }
type Sealed = { salt: string; iterations: number; studies: Record<string, { content: Box; files: Record<string, Box & { type: string }> }> }

// Written by `npm run seal`; absent only before the first seal. Loaded on demand, so only the gate downloads it.
const loadSealed = Object.values(import.meta.glob<Sealed>('./sealed-case-studies.json', { import: 'default' }))[0]
const opened = new Map<ProjectId, CaseStudy>()
const bytes = (base64: string) => Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))

export const isSealed = loadSealed !== undefined

// Starts the download while the visitor types; unlockStudy reports a failed load.
export function preloadSealed() {
  loadSealed?.().catch(() => {})
}
// Web Crypto only exists on https and localhost; GitHub Pages serves https.
export const isSecure = typeof crypto !== 'undefined' && crypto.subtle !== undefined

export function openedStudy(id: ProjectId) {
  return opened.get(id)
}

// A wrong password fails AES-GCM authentication and rejects with an OperationError.
export async function unlockStudy(id: ProjectId, password: string) {
  const sealed = await loadSealed?.()
  const study = sealed?.studies[id]
  if (!sealed || !study) throw new Error(`No sealed case study for ${id}`)
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: bytes(sealed.salt), iterations: sealed.iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  const open = (box: Box) => crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(box.iv) }, key, bytes(box.data))
  const text = new TextDecoder().decode(await open(study.content))
  const urls: Record<string, string> = {}
  for (const [name, file] of Object.entries(study.files)) {
    urls[name] = URL.createObjectURL(new Blob([await open(file)], { type: file.type }))
  }
  const result = JSON.parse(text, (field, value) => (field === 'src' && urls[value]) || value) as CaseStudy
  opened.set(id, result)
  return result
}
