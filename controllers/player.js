var express = require('express');
var fs = require('fs');
var path = require('path');
const url = require('url');
const spawn = require("child_process").spawn;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const { User, Video } = require('../models/models');

const download_path = 'downloads'
const download_cmd = '../m3u8/build/m3u8'
const download_cmd2 = '../youtube-dl/download_ts.py'

if (!fs.existsSync(download_path)){
  fs.mkdirSync(download_path);
}

exports.download_url = function(url, video, thread=16){
  var dl_th;
  if(!url.endsWith('m3u8')){
    dl_th = spawn(`python`, [download_cmd2, '-u', `${url}`, '-o', `${download_path}`, '--m3u8', `False`])
  }
  else{
    dl_th = spawn(`${download_cmd}`, ['-u', `${url}`, '-o', `${download_path}`, '-c', `${thread}`])
  }
  video.completed = false;
  video.save()

  // monitoring
  dl_th.stdout.on('data', function (data) {
    if (data.toString().includes('stdout: Done!')){
      video.compelted = true;
      video.save()
    }
    if (data.toString().includes('[failed]'))
      return
    if (data.toString().includes('[FILEID]')){
      lines = data.toString().split('\n')
      for( var i = 0; i < lines.length; i++){
        if(lines[i].includes('[FILEID]')){
          var m3u8ID = lines[i].split(' ')[1]
          video.token = m3u8ID
          video.save()
        }
      }
      return
    }
    console.log('stdout: ' + data);
  });

  dl_th.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
}

/*  Start of Router */
exports.generateVideoUri = async (req) => {
  var uri;
  var video = await Video.findOne({ url: req.query.uri });
  if(video){
    m3u8ID = video.token;
    var fields = req.query.uri.split('.')
    var ext = fields[fields.length - 1]
    uri = m3u8ID == '' ? '' : `${m3u8ID}.${ext}`
    return uri;
  }
  else{
    var m3u8_name = path.basename(req.query.uri);
    // TODO: OKAY?
    // if(!m3u8_name.endsWith('.m3u8')){
    //   return '';
    // }
    var video = new Video({ url: req.query.uri, token: "", website:req.query.rf, completed: false});
    await video.save();
    var videoList = req.user.videoList;
    videoList.push(video._id);
    req.user.videoList = videoList;
    await req.user.save()
    exports.download_url(req.query.uri, video)
    return '';
  }

}
// keep pulling until token exists
exports.checkVideo = async (req, res) => {
  //req.query.uri = get_m3u8_from_url(req.query.uri)
  var uri = await exports.generateVideoUri(req);
  res.json({'uri': uri})
}

exports.playVideo = async (req, res) => {
  //req.query.uri = get_m3u8_from_url(req.query.uri)
  var uri = await exports.generateVideoUri(req);
  res.render('player', {'uri': uri})
}



var ocr_flag=false
var ocr_res=''

// TODO: make this async and await
exports.ocr = async (req, res) => {
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
}

exports.ocrCheck = async (req, res) => {
    res.json(ocr_flag?{'imgURL': 'optimized.png', 'text': ocr_res}:{});
}