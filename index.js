const express = require('express');
const fs = require('fs');
const path = require('path')
const m3u8 = require('./controllers/m3u8.js');
const player= require('./controllers/player.js');
const download_url_sync = require('./tools/download_url_sync.js')
const hls = require('hls-server');

var mustacheExpress = require('mustache-express');
const { pathToFileURL } = require('url');
const app = express();
const port = 3000;

// Register '.html' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/views'); 

app.get('/', (req, res) => {
  res.send('Hello dude')
});
//app.get('/test', (req, res) => {
//  return res.status(200).sendFile(`${__dirname}/views/player.html`);
//});

// statics
//app.use(express.static('downloads/keys'));
app.use(express.static('views'));

// controllers for the route "m3u8"
app.use('/m3u8', m3u8);
app.use('/player', player);

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

function get_video_path(subpath) {
  return __dirname + '/downloads/' + subpath
}

new hls(server, {
  provider: {
      exists: (req, cb) => {
          const ext = req.url.split('.').pop();

          if (req.url.startsWith('/player\?') || ext !== 'm3u8' && ext !== 'ts') {
              return cb(null, true);
          }
          //if (!fs.existsSync(get_video_path(req.url))){
          //  var reqID = ''
          //  if (ext == 'm3u8'){
          //    reqID = req.url.split('.')[0]
          //  }
          //  else if (ext == 'ts'){
          //    reqID = req.url.split('/')[1]
          //  }
          //  var rawdata = fs.readFileSync(get_video_path(`${reqID}_org.json`));
          //  var ts_url_map = JSON.parse(rawdata);
          //  var ts_url = ts_url_map[path.basename(req.url)]
          //  download_url_sync(ts_url, get_video_path(req.url))
          //  //if (ext == 'ts' && !path.exists(get_video_path(req.url))){
          //  //  var ts_url = ts_url_map[path.basename(req.url)]
          //  //}
          //  console.log('File fetched individually');
          //}


          fs.access(get_video_path(req.url), fs.constants.F_OK, function (err) {
              if (err) {
                console.log('File not exist');
                while (!fs.existsSync(get_video_path(req.url))){
                }
                //return cb(null, false);
                return cb(null, true);
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