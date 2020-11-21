const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')

const sensitive = require('./sensitive')
const feedRoutes = require('./routes/feed');

const app = express()

app.use(bodyParser.json())

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)

app.use((err, req, res, next) => {
  console.log(err)
  const { statusCode, message } = err
  res.status(statusCode || 500).json({ message: message })
})

mongoose.connect(sensitive.MONGODB_URI)
  .then(result => {
    app.listen(8080)
  })
  .catch(err => console.log(err))