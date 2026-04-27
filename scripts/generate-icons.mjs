// Run once: node scripts/generate-icons.mjs
// Requires: npm install sharp --save-dev
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const src   = resolve(__dir, '../public/profile.png')
const dest  = resolve(__dir, '../public/icons')

await sharp(src).resize(192, 192).toFile(`${dest}/icon-192.png`)
await sharp(src).resize(512, 512).toFile(`${dest}/icon-512.png`)
// maskable: add 20% safe-zone padding so focal content fits any mask shape
await sharp(src)
  .resize(410, 410)  // ~80% of 512 — focal area inside safe zone
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#09090b' })
  .resize(512, 512)
  .toFile(`${dest}/icon-512-maskable.png`)

console.log('Icons generated in public/icons/')
