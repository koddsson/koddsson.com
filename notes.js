const fs = require('fs')
const sqlite = require('sqlite')
const express = require('express')
const bodyParser = require('body-parser')
const relativeDate = require('relative-date')
const hbs = require('hbs');
const markdown = require('helper-markdown');
const Entities = require('html-entities').XmlEntities;
const handlebars = require('handlebars')

const dbPromise = require('./data')
const entities = new Entities();

handlebars.registerHelper('markdown', markdown({linkify: true}));
const rssNoteTemplate = handlebars.compile(fs.readFileSync(__dirname + '/views/partials/rss-note.hbs', {encoding: 'utf8'}))

const app = express()
app.use(bodyParser.json())

app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('markdown', markdown({linkify: true}));

app.get('/', async (req, res) => {
  const db = await dbPromise
  const notes = await db.all('SELECT * FROM notes ORDER BY slug DESC')
  const notesWithTimestamps = await Promise.all(notes.map(async note => {
    note.timestamp = relativeDate(note.slug * 1000)
    note.photo = await db.get('SELECT * FROM photos where slug = ?', note.slug)
    return note;
  }))
  return res.status(200).render('notes', {notes: notesWithTimestamps})
})

app.get('/feed.xml', async (req, res) => {
  const db = await dbPromise
  const notes = await db.all('SELECT * FROM notes ORDER BY slug DESC')
  const notesWithTimestamps = await Promise.all(notes.map(async note => {
    note.timestamp = relativeDate(note.slug * 1000)
    note.photo = await db.get('SELECT * FROM photos where slug = ?', note.slug)
    return note;
  }))
  const items = notes.map(note => {
    return `
    <item>
      <title>${note.slug}</title>
      <description>${entities.encode(rssNoteTemplate(note))}</description>
      <pubDate>${new Date(note.slug * 1000).toUTCString()}</pubDate>
      <link>https://koddsson.com/notes/${note.slug}</link>
      <guid isPermaLink="true">https://koddsson.com/notes/${note.slug}</guid>
    </item>`
  })
  const xml = `
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>koddsson.com notes</title>
    <description>notes</description>
    <link>https://koddsson.com</link>
    <atom:link href="https://koddsson.com/notes/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date(notes[0].slug * 1000).toUTCString()}</lastBuildDate>
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
    '2018-08-21.html': 1534870136,
  }

  if (legacyLinks[req.params.slug]) {
    return res.redirect(301, `/notes/${legacyLinks[req.params.slug]}`)
  }

  const db = await dbPromise
  const note = await db.get(
    "SELECT * FROM notes WHERE slug = ?",
    req.params.slug
  );
  if (!note) {
    return res.status(404).send('Not found')
  }
  note.timestamp = relativeDate(note.slug * 1000)
  const photo = await db.get(
    "SELECT * FROM photos WHERE slug = ?",
    req.params.slug
  );
  return res.render('note', {note, photo})
})

module.exports = app
