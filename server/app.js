const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')
const multer = require('multer');
const uuidv4 = require('uuid')

const sensitive = require('./sensitive')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express()

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json())
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((err, req, res, next) => {
  console.log(err)
  const { statusCode, message, data } = err
  res.status(statusCode || 500).json({ message: message, data: data })
})

mongoose.connect(sensitive.MONGODB_URI)
  .then(result => {
    const server = app.listen(8080)
    const io = require('socket.io')(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT"]
      }
    })
    io.on('connection', socket => {
      console.log('CLient connected ')
    })
  })
  .catch(err => console.log(err))