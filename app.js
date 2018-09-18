const express = require('express')
const morgan = require('morgan')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const sqlite = require('sqlite')
const relativeDate = require('relative-date')
const hbs = require('hbs');
const markdown = require('helper-markdown');

const micropub = require('./micropub')
const notes = require('./notes')

const dbPromise = sqlite.open('./publishing.db', {Promise})
const app = express()

app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}))
app.use(bodyParser.json())

app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('markdown', markdown({linkify: true}));
  

app.get('/', async (req, res) => {
  const db = await dbPromise
  const notes = await db.all('SELECT * FROM notes ORDER BY slug DESC LIMIT 5')
  const notesWithTimestamps = await Promise.all(notes.map(async note => {
    note.timestamp = relativeDate(note.slug * 1000)
    note.photo = await db.get('SELECT * FROM photos where slug = ?', note.slug)
    return note;
  }))
  return res.render('index', {notes: notesWithTimestamps})
})

app.use('/micropub', micropub)
app.use('/notes', notes)

app.get('/favorites', async (req, res) => {
  const db = await dbPromise
  const favorites = await db.all('SELECT * FROM favorites ORDER BY timestamp DESC')
  return res.render('favorites', {favorites})
})

module.exports = app
