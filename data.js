const sqlite = require('sqlite')
require('dotenv').config()

const dbPromise = sqlite.open(process.env.DB_HOST, {Promise})

module.exports = async function () {
  const db = await dbPromise
  // TODO: Read this from SQL files!
  await db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      slug varchar(256),
      content varchar(1024),
      geourl varchar(256),
      categories varchar(256)
    );
  `)
  await db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      url varchar(128),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      slug char(10)
    );
  `)
  await db.run(`
    CREATE TABLE IF NOT EXISTS photos (
      slug char(10),
      url varchar(2048),
      alt varchar(1024)
    );
  `)
  return dbPromise
}
