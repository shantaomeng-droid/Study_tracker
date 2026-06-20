// Downloads the Google Fonts used by the app and rewrites src/styles/fonts.css
// with the font files embedded as base64 data: URIs, so the built site needs
// no internet connection and renders with identical typography offline.
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FONTS_CSS = path.resolve(__dirname, '../src/styles/fonts.css')

const GOOGLE_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap'

// Modern browser UA so Google serves woff2 (smallest, widely supported).
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

// Keep the latin subsets — they cover all the app's text. Other subsets
// (cyrillic, vietnamese, …) are never used here, so dropping them keeps the
// file small without changing what you see.
const KEEP_SUBSETS = new Set(['latin', 'latin-ext'])

const css = await fetch(GOOGLE_URL, { headers: { 'User-Agent': UA } }).then((r) => r.text())

// Split into individual @font-face blocks, each preceded by a /* subset */ comment.
const blocks = css.split('@font-face').slice(1)
let prevComment = ''
const out = []
let kept = 0

// Recover the leading comment for the first block.
const leadMatch = css.match(/\/\*\s*([\w-]+)\s*\*\//)
prevComment = leadMatch ? leadMatch[1] : ''

const commentRegex = /\/\*\s*([\w-]+)\s*\*\//g
const subsetForBlock = []
{
  // Map each block to the comment immediately before it.
  let idx = 0
  const parts = css.split('@font-face')
  for (let i = 1; i < parts.length; i++) {
    const before = parts[i - 1]
    const matches = [...before.matchAll(commentRegex)]
    subsetForBlock[idx++] = matches.length ? matches[matches.length - 1][1] : ''
  }
}

for (let i = 0; i < blocks.length; i++) {
  const subset = subsetForBlock[i] || ''
  if (KEEP_SUBSETS.size && !KEEP_SUBSETS.has(subset)) continue

  let block = '@font-face' + blocks[i].split('@font-face')[0]
  const urlMatch = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)
  if (!urlMatch) continue

  const fontUrl = urlMatch[1]
  const buf = Buffer.from(await fetch(fontUrl).then((r) => r.arrayBuffer()))
  const dataUri = `url(data:font/woff2;base64,${buf.toString('base64')})`
  block = block.replace(/url\(https:\/\/[^)]+\.woff2\)/, dataUri)
  out.push(block.trim())
  kept++
  process.stdout.write(`  embedded ${subset.padEnd(10)} ${fontUrl.split('/').pop()}\n`)
}

const header = `/* Fonts embedded as base64 so the site works offline with identical
   typography. Regenerate with: npm run embed-fonts */\n\n`

await writeFile(FONTS_CSS, header + out.join('\n\n') + '\n')
console.log(`\nDone — embedded ${kept} font files into src/styles/fonts.css`)
