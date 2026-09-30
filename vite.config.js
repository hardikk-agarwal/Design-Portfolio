import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath } from 'node:url'
import { existsSync, readdirSync, statSync } from 'node:fs'

const entries = { production: './index.html', desk: './desk.html', story: './story.html' }
const outDirs = { production: 'dist', desk: 'dist/desk', story: 'dist/story' }
const sealedFile = fileURLToPath(new URL('./src/app/lib/sealed-case-studies.json', import.meta.url))
const protectedSource = fileURLToPath(new URL('./src/protected/', import.meta.url))

function checkSealed() {
  if (!existsSync(sealedFile)) throw new Error('The password-protected case study is not sealed. Add CASE_STUDY_PASSWORD to .env.local and run npm run seal.')
  if (!existsSync(protectedSource)) return
  const sealedAt = statSync(sealedFile).mtimeMs
  if (readdirSync(protectedSource, { recursive: true }).some((file) => statSync(protectedSource + file).mtimeMs > sealedAt)) {
    console.warn('src/protected changed after the last seal. Run npm run seal to include the update.')
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'production') checkSealed()
  return {
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('./src/app/', import.meta.url)) }],
    },
    build: {
      assetsInlineLimit: 10000000,
      outDir: outDirs[mode] ?? outDirs.production,
      rollupOptions: { input: fileURLToPath(new URL(entries[mode] ?? entries.production, import.meta.url)) },
    },
    server: { host: '127.0.0.1' },
  }
})