import sqlite3 from 'sqlite3'
import {open} from 'sqlite'

export async function all(statement, ...args) {
  const db = await open({
    filename: process.env.DB_HOST,
    driver: sqlite3.Database
  })
  const results = await db.all(statement, ...args)
  db.close()
  return results
}

export async function get(statement, ...args) {
  const db = await open({
    filename: process.env.DB_HOST,
    driver: sqlite3.Database
  })
  const results = await db.get(statement, ...args)
  db.close()
  return results
}

export async function run(statement, ...args) {
  const db = await open({
    filename: process.env.DB_HOST,
    driver: sqlite3.Database
  })
  const results = await db.run(statement, ...args)
  db.close()
  return results
}
