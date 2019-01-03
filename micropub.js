const fetch = require('node-fetch')
const sqlite = require('sqlite')
const express = require('express')
const bodyParser = require('body-parser')
const Twit = require('twit')
const FileReader = require('filereader')

const getDB = require('./data')

const T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

function tweetNote(note, noteLink) {
  if ((note.length + noteLink.length + 3) > 280) {
    const howManyCharsToTake = 280 - (noteLink.length + 3)
    note = note.substring(0, howManyCharsToTake) + '..'
  }

  T.post(
    'statuses/update',
    { status: `${note} - ${noteLink}` },
    function(err, data, response) {
      console.log(err)
    }
  )
}

const app = express()
app.use(bodyParser.json())

app.get('/', async (req, res) => {
  if (req.query['q'] === 'config') {
    return res.json({
      "media-endpoint": "https://img.koddsson.com/upload"
    })
  }
  return res.status(404).send('Not found')
})

app.post('/', async (req, res) => {
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

  const db = await getDB()

  // Don't remove this. It's good to know what requests look like in the logs
  console.log(req.body)

  if (req.body['like-of']) {
    // TODO: Try and get metadata and add to the table.
    const timestamp = Math.floor(new Date() / 1000)
    await db.run(
      "INSERT INTO favorites VALUES (?, DateTime('now'), ?)",
      req.body['like-of'],
      timestamp
    );
    // TODO: Set this header more correctly
    res.header('Location', 'https://koddsson.com/favorites')
    return res.status(201).send('Favorited')
  } else if (req.body['h'] === 'entry') {
    const timestamp = Math.floor(new Date() / 1000)
    const note = req.body['content']
    await db.run(
      "INSERT INTO notes VALUES (?, ?, ?)",
      timestamp,
      note,
      req.body['location']
    );

    const noteLink = `https://koddsson.com/notes/${timestamp}`
    tweetNote(note, noteLink)

    // TODO: Set this header more correctly
    res.header('Location', noteLink)
    return res.status(201).send('Note posted')
  } else if (req.body['type'] && req.body['type'].includes('h-entry')) {
    const timestamp = Math.floor(new Date() / 1000)
    const properties = req.body.properties
    const photo = properties.photo && properties.photo[0]
    const content = properties.content[0]

    if (photo) {
      await db.run(
        "INSERT INTO photos VALUES (?, ?, ?)",
        timestamp,
        photo.value,
        photo.alt 
      );

      // Since the image went to the media endpoint and not to the micropub endpoint we need to fetch
      // the image again if we want to upload it to twitter 🙄

      // Fetch the image
      const response  = await fetch(photo.value)
      const blob = await response.blob()

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        base64content = reader.result;

        // Post the media to Twitter
        T.post('media/upload', { media_data: b64content }, function (err, data, response) {
          // now we can assign alt text to the media, for use by screen readers and
          // other text-based presentations and interpreters
          const mediaIdStr = data.media_id_string
          const meta_params = { media_id: mediaIdStr, alt_text: { text: photo.alt } }

          T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
              // now we can reference the media and post a tweet (media will attach to the tweet)
              const params = { status: content, media_ids: [mediaIdStr] }

              T.post('statuses/update', params, function (err, data, response) {
                console.log(data)
              })
            }
          })
        })
      }
    }

    await db.run(
      "INSERT INTO notes VALUES (?, ?, ?)",
      timestamp,
      content,
      null
    );
    // TODO: Set this header more correctly
    res.header('Location', `https://koddsson.com/notes/${timestamp}`)
    return res.status(201).send('Note posted')
  }

  return res.status(404).send('Not found')
})

module.exports = app
