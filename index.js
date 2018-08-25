const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(express.static('public'))

app.listen(3000, () => console.log('Listening on port 3000!'))
