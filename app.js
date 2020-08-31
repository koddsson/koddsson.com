const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const relativeDate = require('relative-date')
const hbs = require('hbs')
const markdown = require('helper-markdown')

const micropub = require('./micropub')
const notes = require('./notes')
const getDB = require('./data')

const app = express()

app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}))
app.use(bodyParser.json())

app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials')
hbs.registerHelper('markdown', markdown({linkify: true}))

app.get('/', async (req, res) => {
  const db = await getDB()
  const latestNote = (
    await db.all(`
    SELECT url as content, slug, 'favorite' as type, slug at timestamp from favorites
    UNION ALL
    SELECT content, slug, 'note' as type, timestamp FROM notes
    ORDER BY slug DESC
    LIMIT 1
  `)
  )[0]
  latestNote.timestamp = relativeDate(latestNote.timestamp * 1000)
  latestNote.isNote = latestNote.type === 'note'
  latestNote.isFavorite = latestNote.type === 'favorite'
  /* istanbul ignore else */
  if (latestNote.isNote) {
    latestNote.photo = await db.get('SELECT * FROM photos where slug = ?', latestNote.slug)
  }
  return res.render('index', {latestNote})
})

app.use('/micropub', micropub)
app.use('/notes', notes)

app.get('/favorites', async (req, res) => {
  const db = await getDB()
  const favorites = await db.all('SELECT * FROM favorites ORDER BY timestamp DESC')
  return res.render('favorites', {favorites})
})

module.exports = app
