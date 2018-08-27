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
