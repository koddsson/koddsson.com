const express = require('express')
const morgan = require('morgan')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const relativeDate = require('relative-date')
const hbs = require('hbs');
const markdown = require('helper-markdown');

const micropub = require('./micropub')
const notes = require('./notes')
const getDB = require('./data')

const app = express()

app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}))
app.use(bodyParser.json())

app.set('view engine', 'hbs')

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('markdown', markdown({linkify: true}));
  

app.get('/', async (req, res) => {
  const db = await getDB()
  const feedItems = await db.all(`
    SELECT url as content, timestamp as slug, 'favorite' as type from favorites
    UNION ALL
    SELECT content, slug, 'note' as type FROM notes
    ORDER BY slug DESC
    LIMIT 5
  `)
  const feedItemsWithTimestamps = await Promise.all(feedItems.map(async item => {
    item.timestamp = relativeDate(item.slug * 1000)
    item.isNote = item.type === 'note'
    item.isFavorite = item.type === 'favorite'
    /* istanbul ignore else */
    if (item.isNote) {
      item.photo = await db.get('SELECT * FROM photos where slug = ?', item.slug)
    }
    return item;
  }))
  return res.render('index', {feedItems: feedItemsWithTimestamps})
})

app.use('/micropub', micropub)
app.use('/notes', notes)

app.get('/favorites', async (req, res) => {
  const db = await getDB()
  const favorites = await db.all('SELECT * FROM favorites ORDER BY timestamp DESC')
  return res.render('favorites', {favorites})
})

module.exports = app
