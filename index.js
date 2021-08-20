const express = require('express');
const fs = require('fs');
const path = require('path')
const mongoose = require('mongoose')
var cookieParser = require('cookie-parser'); // req.cookies
const bodyParser = require('body-parser'); // req.body
//jwt and JWT.SECRET env for it
const jwt = require('jsonwebtoken');
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

// models
const { User } = require('./models/models')

// controllers and videos
const m3u8 = require('./controllers/m3u8.js');
const player= require('./controllers/player.js');
const user= require('./controllers/user.js');
const accesscontrol = require('./routes/accesscontrol.js');
const download_url_sync = require('./tools/download_url_sync.js')
const hls = require('hls-server');

// servers
var mustacheExpress = require('mustache-express');
const { pathToFileURL } = require('url');
const app = express();
//const port = 3000;
const port = 6006;
//const port = 5500;

// mongod --dbpath /var/lib/mongo --logpath /var/log/mongodb/mongod.log --fork
mongoose
 .connect('mongodb://localhost:27017/videometa')
 .then(() => {
  console.log('Connected to the Database successfully');
});

// Register '.html' extension with The Mustache Express
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views'); 

// statics
app.use(express.static('downloads'));
app.use(express.static('views'));

// controllers for the route "m3u8"
// app.use('/m3u8', m3u8);
// app.use('/player', player);
// app.use('/user', user);

app.use(cookieParser()) // req.cookies
app.use(bodyParser.urlencoded({ extended: true })) // req.body
app.use(express.json()); // req.body if it is json

app.use(async (req, res, next) => {
  if (req.cookies["x-access-token"]) {
   // const accessToken = req.headers["x-access-token"];
   const accessToken = req.cookies['x-access-token'];
   const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
   // Check if token has expired
   if (exp < Date.now().valueOf() / 1000) { 
    return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
   } 
   res.locals.loggedInUser = await User.findById(userId); next(); 
  } else { 
   next(); 
  } 
});

app.use('/', accesscontrol);

//const server = app.listen(port, () => {
//  console.log(`Example app listening on port ${port}!`)
//});
const server = app.listen(port, '0.0.0.0')

// HLS

function get_video_path(subpath) {
  return __dirname + '/downloads/' + subpath
}

new hls(server, {
  provider: {
      exists: (req, cb) => {
          const ext = req.url.split('.').pop();

          if (req.url.startsWith('/player') || ext !== 'mp4' && ext !== 'm3u8' && ext !== 'ts') {
              return cb(null, true);
          }

          fs.access(get_video_path(req.url), fs.constants.F_OK, function (err) {
              if (err) {
                console.log('File not exist');
                //while (!fs.existsSync(get_video_path(req.url))){
                //}
                return cb(null, false);
                //return cb(null, true);
              }
              cb(null, true);
          });
      },
      getManifestStream: (req, cb) => {
          const stream = fs.createReadStream(get_video_path(req.url));
          cb(null, stream);
      },
      getSegmentStream: (req, cb) => {
          const stream = fs.createReadStream(get_video_path(req.url));
          cb(null, stream);
      }
  }
});
