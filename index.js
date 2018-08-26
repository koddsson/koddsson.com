const express = require('express')
const morgan = require('morgan')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')

const app = express()
app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.json())

app.post('/micropub', async (req, res) => {
  const response = await fetch('https://tokens.indieauth.com/token', {
    Accept: 'application/json',
    Authorization: request.header('Authorization')
  })
  const json = await reponse.json()

  console.log(req.body)
  console.log(json)

  res.status(404)
})

app.listen(3000, () => console.log('Listening on port 3000!'))
