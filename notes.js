import fs from 'fs'
import express from 'express'
import bodyParser from 'body-parser'
import relativeDate from 'relative-date'
import hbs from 'hbs'
import markdown from 'helper-markdown'
import HTMLEntities from 'html-entities'
import handlebars from 'handlebars'

import * as db from './database.js'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const entities = new HTMLEntities.XmlEntities()

handlebars.registerHelper('markdown', markdown({linkify: true}))
const rssNoteTemplate = handlebars.compile(
  fs.readFileSync(__dirname + '/views/partials/rss-note.hbs', {
    encoding: 'utf8'
  })
)

const app = express()
app.use(bodyParser.json())

app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials')
hbs.registerHelper('markdown', markdown({linkify: true}))

app.get('/', async (req, res) => {
  const notes = await db.all('SELECT * FROM notes ORDER BY timestamp DESC')
  const notesWithTimestamps = await Promise.all(
    notes.map(async note => {
      note.timestamp = relativeDate(note.timestamp * 1000)
      note.photo = await db.get('SELECT * FROM photos where slug = ?', note.slug)
      return note
    })
  )
  return res.status(200).render('notes', {notes: notesWithTimestamps})
})

app.get('/feed.xml', async (req, res) => {
  const notes = await db.all('SELECT * FROM notes ORDER BY timestamp DESC')
  const items = []
  for (const note of notes) {
    const date = new Date(note.timestamp * 1000)
    let month = date.getMonth() + 1
    if (month < 10) {
      month = `0${month}`
    }
    let day = date.getDate()
    if (day < 10) {
      day = `0${day}`
    }
    const timestamp = `${date.getFullYear()}-${month}-${day}`
    note.photo = await db.get('SELECT * FROM photos where slug = ?', note.slug)
    items.push(`
    <item>
      <title>${timestamp}</title>
      <description>${entities.encode(rssNoteTemplate(note))}</description>
      <pubDate>${new Date(note.timestamp * 1000).toUTCString()}</pubDate>
      <link>https://koddsson.com/notes/${note.slug}</link>
      <guid isPermaLink="true">https://koddsson.com/notes/${note.slug}</guid>
    </item>`)
  }
  const xml = `
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>koddsson.com notes</title>
    <description>notes</description>
    <link>https://koddsson.com</link>
    <atom:link href="https://koddsson.com/notes/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date(notes[0].timestamp * 1000).toUTCString()}</lastBuildDate>
    ${items.join('')}
  </channel>
</rss>
`
  return res.type('application/xml').send(xml)
})

app.get('/:slug', async (req, res) => {
  const legacyLinks = {
    '2018-08-25-0.html': 1535200649,
    '2018-08-23-0.html': 1535047453,
    '2018-08-22-1.html': 1534940871,
    '2018-08-22-0.html': 1534934370,
    '2018-08-21.html': 1534870136
  }

  if (legacyLinks[req.params.slug]) {
    return res.redirect(301, `/notes/${legacyLinks[req.params.slug]}`)
  }

  const note = await db.get('SELECT * FROM notes WHERE slug = ?', req.params.slug)
  if (!note) {
    return res.status(404).send('Not found')
  }
  note.timestamp = relativeDate(note.timetamp * 1000)
  const photo = await db.get('SELECT * FROM photos WHERE slug = ?', req.params.slug)
  return res.render('note', {note, photo})
})

export default app
