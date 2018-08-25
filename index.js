const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.static('public'))
app.use(morgan('combined'))

app.listen(3000, () => console.log('Listening on port 3000!'))
