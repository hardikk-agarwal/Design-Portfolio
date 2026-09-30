// Encrypts src/protected/<id> into src/app/lib/sealed-case-studies.json with CASE_STUDY_PASSWORD.
// The sealed file is safe to commit and deploy; src/protected and .env.local stay on this machine.
import { readFileSync, writeFileSync } from 'node:fs'
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const studies = ['portal']
const password = loadEnv('production', root, '').CASE_STUDY_PASSWORD?.trim()

if (!password) {
  console.error('Add CASE_STUDY_PASSWORD=your-password to .env.local, then run npm run seal again.')
  process.exit(1)
}
if (password.length < 12) console.warn('Warning: use 12+ characters. The sealed file is public, so short passwords can be guessed offline.')

const salt = randomBytes(16)
const iterations = 600000
const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256')
const seal = (bytes) => {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  return { iv: iv.toString('base64'), data: Buffer.concat([cipher.update(bytes), cipher.final(), cipher.getAuthTag()]).toString('base64') }
}

const sealed = {
  salt: salt.toString('base64'),
  iterations,
  studies: Object.fromEntries(studies.map((study) => {
    const folder = `${root}src/protected/${study}/`
    const content = readFileSync(`${folder}case-study.json`)
    JSON.parse(content.toString())
    const names = new Set([...content.toString().matchAll(/"src":\s*"([^"]+)"/g)].map((match) => match[1]))
    const files = Object.fromEntries([...names].map((name) => [name, { ...seal(readFileSync(folder + name)), type: `image/${name.split('.').pop()}` }]))
    return [study, { content: seal(content), files }]
  })),
}

writeFileSync(`${root}src/app/lib/sealed-case-studies.json`, JSON.stringify(sealed))
console.log(`Sealed ${studies.join(', ')} into src/app/lib/sealed-case-studies.json. Commit that file; src/protected stays local.`)
