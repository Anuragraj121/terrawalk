import 'dotenv/config'
import { readFileSync, readdirSync } from 'fs'
import { pool } from './db.js'

async function migrate() {
  const files = readdirSync(new URL('../migrations', import.meta.url)).sort()
  for (const file of files) {
    console.log(`Running ${file}...`)
    const sql = readFileSync(new URL(`../migrations/${file}`, import.meta.url), 'utf-8')
    await pool.query(sql)
  }
  console.log('All migrations complete.')
  await pool.end()
}

migrate().catch((e) => { console.error(e); process.exit(1) })
