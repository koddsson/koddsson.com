const sqlite = require('sqlite')
require('dotenv').config()

const dbPromise = sqlite.open(process.env.DB_HOST, {Promise})

if (process.env.DB_HOST === 'test.db') {
  ;(async function() {
    const db = await dbPromise
    await db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        slug char(10),
        content varchar(1024)
      );
      `)
    await db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        url varchar(128),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      `)
    await db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        slug char(10),
        url varchar(2048),
        alt varchar(1024)
      );
      `)
  })();
}

module.exports = dbPromise
