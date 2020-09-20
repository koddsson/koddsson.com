import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import relativeDate from 'relative-date'
import hbs from 'hbs'
import markdown from 'helper-markdown'

import micropub from './micropub.js'
import notes from './notes.js'
import * as db from './database.js'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}))
app.use(bodyParser.json())

app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials')
hbs.registerHelper('markdown', markdown({linkify: true}))

app.get('/', async (req, res) => {
  // TODO: Do we need the array accessors here? Seems like this should just be a DB get request.
  const latestNote = (
    await db.all(`
    SELECT url as content, slug, 'favorite' as type, slug as timestamp from favorites
    UNION ALL
    SELECT content, slug, 'note' as type, timestamp FROM notes
    ORDER BY timestamp DESC
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
  const favorites = await db.all('SELECT * FROM favorites ORDER BY timestamp DESC')
  return res.render('favorites', {favorites})
})

export default app
