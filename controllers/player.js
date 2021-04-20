var express = require('express');
var fs = require('fs');
var path = require('path');
//var request = require('request')
//var debug = require('request-debug')
const url = require('url');
const { exec } = require("child_process");
const spawn = require("child_process").spawn;

const download_path = 'downloads'
const download_cmd = '../m3u8/build/m3u8'

if (!fs.existsSync(download_path)){
  fs.mkdirSync(download_path);
}

var router = express.Router();

//function check_contains_m3u8_req(log_reqs){
//  for(idx in log_reqs){
//    log_req = log_reqs[idx]
//    if(log_req.uri && log_req.uri.endsWith('.m3u8'))
//      return log_req.uri
//  }
//  return null
//}
//
//function get_m3u8_from_url(req_url){
//  if(req_url.endsWith('.m3u8'))
//    return req_url
//  var log_reqs = []
//  debug(request, function(type, data, r) {
//    if(type=='request')
//      log_reqs.push(data)
//  })
//  request(req_url)
//  var actual_url = check_contains_m3u8_req(log_reqs)
//  while(!actual_url){
//    actual_url = check_contains_m3u8_req(log_reqs)
//  }
//  return actual_url
//
//}

/*  Wait for the existence of some file*/
function waitFileExists(filepath, filename, timeout=2000) {
  var currentTime = +new Date();
  var fileExists = false;
  var actualFileName = '';
  //const intervalObj = setInterval(function() {
  //  files = fs.readdirSync(path);
  //  files.forEach(function(file) {
  //    if(file.startsWith(path.basename(filename)) && file.endsWith('.m3u8') && fs.statSync(path+"/"+file).birthtimeMs >= currentTime){
  //      fileExists=true
  //      actualFileName=file
  //    }
  //  });

  //  if (fileExists) {
  //      clearInterval(intervalObj);
  //  }
  //}, timeout);
  while(!fileExists){
    files = fs.readdirSync(filepath);
    files.forEach(function(file) {
      if(file.startsWith(path.parse(filename).name) &&
          file.endsWith('.m3u8') &&
          !file.endsWith('_org.m3u8') &&
          fs.statSync(filepath+"/"+file).birthtimeMs >= currentTime){
        actualFileName=file
        //#EXT-X-ENDLIST
        lines = fs.readFileSync(filepath+"/"+actualFileName, encoding='utf8');
        lines = lines.split(/\r\n|\r|\n/)
        lines = lines.filter(Boolean)
        lastline = lines[lines.length-1]
        if(lastline == '#EXT-X-ENDLIST')
          fileExists=true
      }
    });
  }
  return actualFileName
};

/*  Wait for the existence of some file*/
function waitOneFileExists(filepath, timeout=2000) {
  var fileExists = false
  //const intervalObj = setInterval(function() {
  //  const file = path;
  //  const fileExists = fs.existsSync(file);

  //  if (fileExists) {
  //      clearInterval(intervalObj);
  //  }
  //}, timeout);
  while(!fileExists){
    if(fs.existsSync(filepath)){
      //#EXT-X-ENDLIST
      lines = fs.readFileSync(filepath, encoding='utf8');
      lines = lines.split(/\r\n|\r|\n/)
      lines = lines.filter(Boolean)
      lastline = lines[lines.length-1]
      if(lastline == '#EXT-X-ENDLIST')
        fileExists=true
    }
  }
};

/*  Start of Router */
router.get('/', (req, res) => {
  //req.query.uri = get_m3u8_from_url(req.query.uri)
  var cache_file = path.join(download_path, 'url_file_cache')
  var lines = []
  if (!fs.existsSync(cache_file)){
    lines = []
  }
  else{
    lines = fs.readFileSync(cache_file, encoding='utf8');
    lines = lines.split(/\r\n|\r|\n/)
    lines = lines.filter(Boolean)
  }
  var url_file_map = new Map();
  lines.forEach(line => url_file_map.set(line.split(' ')[0], line.split(' ')[1]));

  if(url_file_map.has(req.query.uri)){
    res.render('player', {'uri': url_file_map.get(req.query.uri)})
  }
  else{
    var m3u8_name = path.basename(req.query.uri);
    if(!m3u8_name.endsWith('.m3u8')){
      res.render('player', {'uri': ''})
      return
    }
    //exec(`${download_cmd} -u ${req.query.uri} -o ${download_path} -c 16`, (error, stdout, stderr) => {
    //    if (error) {
    //        console.log(`error: ${error.message}`);
    //        return;
    //    }
    //    if (stderr) {
    //        console.log(`stderr: ${stderr}`);
    //        return;
    //    }
    //    console.log(`stdout: ${stdout}`);
    //});
    var dl_th = spawn(`${download_cmd}`, ['-u', `${req.query.uri}`, '-o', `${download_path}`, '-c', '16'])
    dl_th.stdout.on('data', function (data) {
      if (data.toString().includes('[failed]'))
        return
      console.log('stdout: ' + data);
    });
    dl_th.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    


    var actualFileName = waitFileExists(download_path, m3u8_name)
    var m3u8_org_file = `${path.parse(actualFileName).name}_org${path.parse(actualFileName).ext}`

    var reqURL = new URL(req.query.uri);
    var reqMain = `${reqURL.protocol}//${reqURL.host}`
    var m3u8_org_path = path.join(download_path, m3u8_org_file)
    waitOneFileExists(m3u8_org_path)
    lines = fs.readFileSync(m3u8_org_path, encoding='utf8');
    lines = lines.split(/\r\n|\r|\n/)
    lines = lines.filter(Boolean)
    // only for a single user
    var ts_url_map = new Map();
    var line = ''
    for(idx in lines){
      line=lines[idx]
      if(line.endsWith('.ts')){
        ts_url_map.set(`${path.basename(line)}`, `${reqMain}${line}`)
      }
    }

    var m3u8_org_parse = path.parse(m3u8_org_path)
    var data = JSON.stringify(Object.fromEntries(ts_url_map));
    fs.writeFileSync(`${m3u8_org_parse.dir}/${m3u8_org_parse.name}.json`, data);
    if (req.query.rf!=undefined)
      fs.appendFileSync(cache_file, `${req.query.uri} ${actualFileName} ${req.query.rf}\n`, 'utf-8');
    else
      fs.appendFileSync(cache_file, `${req.query.uri} ${actualFileName}\n`, 'utf-8');
    res.render('player', {'uri': actualFileName})
  }
});

var ocr_flag=false
var ocr_res=''

router.get('/ocr', (req, res) => {
    ocr_flag=false;
    var currentTime = parseFloat(req.query.currentTime)
    var uri = req.query.uri // m3u8 file path

    var m3u8_path = path.join(download_path, uri)
    fs.readFile(m3u8_path, encoding='utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      //console.log(data);
      lines = data.split(/\r\n|\r|\n/)
      lines = lines.filter(Boolean)
      // only for a single user
      var line = ''
      var dur = 0;

      var idx = 0;
      var len = lines.length;
      for (; idx < len; ) {
        line=lines[idx]
        if(line.startsWith('#EXTINF:')){
          dur = parseFloat(line.slice(8, -1))
          idx++;
          line=lines[idx]
          if(line.endsWith('.ts')){
            if(currentTime<=dur){
              console.log(`ffmpeg -y -i ${download_path}/${line} -ss ${currentTime} -vframes 1 ${download_path}/extracted.jpg`)
              //var extract_th = spawn('ffmpeg', ['-y', '-i', `${download_path}/${line}`, '-ss', `${currentTime}`, '-vframes', '1', `${download_path}/extracted.jpg`])
              //extract_th.stdout.on('data', function (data) {
              //  console.log('stdout: ' + data);
              //  var ocr_th = spawn('python', ['../google-api/google-ocr/ocr.py', `${download_path}/extracted.jpg`])
              exec(`ffmpeg -y -i ${download_path}/${line} -ss ${currentTime} -vframes 1 ${download_path}/extracted.jpg`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    //return;
                }
                console.log(`stdout: ${stdout}`);
                exec(`python ../google-api/google-ocr/ocr.py ${download_path}/extracted.jpg ${download_path}/optimized.png`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    ocr_res=stdout
                    ocr_flag=true
                });
              });

              break
            }
          }
          currentTime-=dur
        }
        idx++;
      }
    });
    res.send('');
});

router.get('/ocrCheck', (req, res) => {
    res.json(ocr_flag?{'imgURL': 'optimized.png', 'text': ocr_res}:{});
});

module.exports = router