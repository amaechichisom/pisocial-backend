const path = require('path');

const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config()

const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors')

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors())

const store = new MongoDBStore({
  uri: process.env.MONGODB_CONNECTION,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

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

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'mypisocialwhichissecret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://pisocial.netlify.app');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
   
  next();
});




app.use('/feed', feedRoutes);
app.use('/auth',authRoutes);

app.use(helmet());
app.use(compression())

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    process.env.MONGODB_CONNECTION
  )
  .then(result => {
    app.listen(8080);
    console.log("connected")
  })
  .catch(err => console.log(err));


