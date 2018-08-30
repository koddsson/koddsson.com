const express = require('express')
const morgan = require('morgan')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const sqlite = require('sqlite')
const relativeDate = require('relative-date')

const dbPromise = sqlite.open('./publishing.db', {Promise})

const app = express()
app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.set('view engine', 'hbs')

app.get('/', async (req, res) => {
  const db = await dbPromise
  const notes = await db.all('SELECT * FROM notes ORDER BY slug DESC LIMIT 5')
  const notesWithTimestamps = notes.map(note => {
    note.timestamp = relativeDate(note.slug * 1000)
    return note;
  })
  return res.render('index', {notes: notesWithTimestamps})
})

app.get('/feed.xml', async (req, res) => {
  const db = await dbPromise
  const notes = await db.all('SELECT * FROM notes ORDER BY slug DESC')
  const items = notes.map(note => {
    return `
    <item>
      <description>${note.content}</description>
      <pubDate>${new Date(note.slug * 1000).toUTCString()}</pubDate>
      <link>https://koddsson.com/notes/${note.slug}</link>
      <guid isPermaLink="true">
        https://koddsson.com/notes/${note.slug}
      </guid>
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

app.get('/notes', async (req, res) => {
  const db = await dbPromise
  const notes = await db.all('SELECT * FROM notes ORDER BY slug DESC')
  const notesWithTimestamps = notes.map(note => {
    note.timestamp = relativeDate(note.slug * 1000)
    return note;
  })
  return res.render('notes', {notes: notesWithTimestamps})
})

app.post('/micropub', async (req, res) => {
  const response = await fetch('https://tokens.indieauth.com/token', {
    headers: {
      Accept: 'application/json',
      Authorization: req.header('Authorization')
    }
  })
  const json = await response.json()

  if (json.me !== 'https://koddsson.com/') {
    return res.status(401).send('Unauthorized')
  }

  const db = await dbPromise

  console.log(req.body)

  if (req.body['like-of']) {
		// TODO: Try and get metadata and add to the table.
    await db.run(
      "INSERT INTO favorites VALUES (?, DateTime('now'))",
      req.body['like-of']
    );
    // TODO: Set this header more correctly
    res.header('Location', 'https://koddsson.com/favorites')
    return res.status(201).send('Favorited')
  } else if (req.body['h'] === 'entry') {
    const timestamp = Math.floor(new Date() / 1000)
    await db.run(
      "INSERT INTO notes VALUES (?, ?)",
      timestamp,
      req.body['content']
    );
    // TODO: Set this header more correctly
    res.header('Location', `https://koddsson.com/notes/${timestamp}`)
    return res.status(201).send('Note posted')
  }

  return res.status(404).send('Not found')
})

app.get('/notes/:slug', async (req, res) => {
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
  return res.render('note', note)
})

app.get('/favorites', async (req, res) => {
	const db = await dbPromise
	const favorites = await db.all('SELECT * FROM favorites ORDER BY timestamp DESC')
  return res.render('favorites', {favorites})
})

app.listen(3000, () => console.log('Listening on port 3000!'))
