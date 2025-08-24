#!/usr/bin/env node
/*
 Simple CI bundle budget checker.
 - Checks sizes of .next/static/chunks/*.js and total JS payload estimate
 - Fails if a single chunk exceeds 300 KiB parsed or if total exceeds 350 KiB for first load shared.

 Note: This is a heuristic without external deps. Tune thresholds as needed.
*/
import { promises as fs } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const chunksDir = path.join(root, '.next', 'static', 'chunks')

const KB = 1024
const MAX_CHUNK_KIB = 300 // per-chunk limit
const MAX_TOTAL_KIB = 350 // total shared chunks limit

async function getJsFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.js'))
      .map((e) => path.join(dir, e.name))
  } catch (e) {
    return []
  }
}

async function fileSizeKiB(file) {
  const st = await fs.stat(file)
  return st.size / KB
}

async function main() {
  const files = await getJsFiles(chunksDir)
  if (files.length === 0) {
    console.log('No JS chunks found. Skipping budget check.')
    return
  }

  let ok = true
  const sizes = []
  for (const f of files) {
    const kib = await fileSizeKiB(f)
    sizes.push({ file: f, kib })
    if (kib > MAX_CHUNK_KIB) {
      console.error(`Budget violation: ${path.basename(f)} is ${kib.toFixed(1)} KiB (> ${MAX_CHUNK_KIB} KiB)`) 
      ok = false
    }
  }

  // Rough approximation of shared first load: sum of all chunks
  const total = sizes.reduce((acc, s) => acc + s.kib, 0)
  if (total > MAX_TOTAL_KIB) {
    console.error(`Budget violation: total JS chunks ≈ ${total.toFixed(1)} KiB (> ${MAX_TOTAL_KIB} KiB)`) 
    ok = false
  }

  // Print summary sorted desc
  sizes.sort((a, b) => b.kib - a.kib)
  console.log('Bundle sizes (KiB):')
  for (const s of sizes.slice(0, 20)) {
    console.log(` - ${path.basename(s.file)}: ${s.kib.toFixed(1)} KiB`)
  }
  console.log(`Approx total: ${total.toFixed(1)} KiB`)

  if (!ok) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Budget checker failed:', err)
  process.exit(1)
})
