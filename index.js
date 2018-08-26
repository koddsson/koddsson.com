const express = require('express')
const morgan = require('morgan')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')

const app = express()
app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.post('/micropub', async (req, res) => {
  const response = await fetch('https://tokens.indieauth.com/token', {
    headers: {
      Accept: 'application/json',
      Authorization: req.header('Authorization')
    }
  })
  const json = await response.json()

  console.log(req.body)
  console.log(json)

  if (json.me !== 'https://koddsson.com') {
    return res.status(404).send('Not found')
  }

  res.status(404).send('Not found')
})

app.listen(3000, () => console.log('Listening on port 3000!'))
