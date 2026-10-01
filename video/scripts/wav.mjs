import { readFileSync, writeFileSync } from 'node:fs'

// 16-bit PCM WAV. `channels` are equal-length Float32Arrays.
export function writeWav(path, channels, rate) {
  const n = channels[0].length, c = channels.length
  const buf = Buffer.alloc(44 + n * c * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * c * 2, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(c, 22)
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * c * 2, 28); buf.writeUInt16LE(c * 2, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(n * c * 2, 40)
  let o = 44
  for (let i = 0; i < n; i++) for (let k = 0; k < c; k++, o += 2) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(channels[k][i] * 32767))), o)
  writeFileSync(path, buf)
}

export function readWav(path) {
  const buf = readFileSync(path)
  const c = buf.readUInt16LE(22), rate = buf.readUInt32LE(24), bits = buf.readUInt16LE(34)
  let o = 12
  while (buf.toString('ascii', o, o + 4) !== 'data') o += 8 + buf.readUInt32LE(o + 4)
  if (bits !== 16) throw new Error(`${path}: expected 16-bit PCM`)
  const n = buf.readUInt32LE(o + 4) / (c * 2)
  const channels = Array.from({ length: c }, () => new Float32Array(n))
  for (let i = 0, p = o + 8; i < n; i++) for (let k = 0; k < c; k++, p += 2) channels[k][i] = buf.readInt16LE(p) / 32768
  return { channels, rate }
}
