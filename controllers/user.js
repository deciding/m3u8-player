var express = require('express');
const { exec } = require("child_process")
var fs = require('fs');
var path = require('path');
var glob = require("glob");
var router = express.Router();

// name, link, completed or not, delete button, preview video

var download_path = 'downloads'
// Home page route.
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
    var name_src_completed_preview = []
    lines.forEach(line => {
        var fields=line.split(' ')
        if(fields.length==3){
          var vidName = fields[2]
          var srcUrl = "player?uri="+encodeURIComponent(fields[0])+"&rf="+encodeURIComponent(vidName)
        }
        else{
          var urlComp = fields[0].split('/')
          if (urlComp.length<2)
            var vidName=urlComp[0].split('.')[0]
          else
            var vidName=urlComp.slice(urlComp.length-2, urlComp.length).join('_').split('.')[0]
          var srcUrl = "player?uri="+encodeURIComponent(fields[0])
        }
          var m3u8ID = path.parse(fields[1]).name
          var cfilepath = path.join(download_path, m3u8ID, 'completed')
          var completed = fs.existsSync(cfilepath);
          var m3u8path = path.join(download_path, m3u8ID+'.m3u8')
          var tslines = fs.readFileSync(m3u8path, encoding='utf8');
          tslines = tslines.split(/\r\n|\r|\n/)
          tslines = tslines.filter(tsl => tsl.endsWith('.ts') && fs.existsSync(path.join(download_path, tsl)))
          previews = tslines.sort(function() {return 0.5 - Math.random()}).slice(0, 3).map(tsl => path.join(download_path, tsl)).join(' ')

          if(previews.length>=3){
            preview_ts = path.join(download_path, m3u8ID, 'preview.ts');
            var previewVid = path.join(download_path, m3u8ID, 'preview.mp4')
            var previewUrl = path.join(m3u8ID, 'preview.mp4')
            var preview_creation_cmd = `ffmpeg -i ${preview_ts} -strict -2 -vcodec copy ${previewVid}`
            exec(`cat ${previews} > ${preview_ts}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                if (fs.existsSync(previewVid))
                  return;
                exec(preview_creation_cmd, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            });
          }

          name_src_completed_preview.push({'name': vidName, 'url': srcUrl, 'completed': completed?'Completed':'Not finished', 'src': previewUrl, 'iid': m3u8ID})
    });
  
    res.render('user', {'meta': name_src_completed_preview})
});

router.get('/del', function (req, res) {
  var m3u8ID = req.query.iid
  var cache_file = path.join(download_path, 'url_file_cache')
  fs.readFile(cache_file, 'utf8', function(err, data)
  {
      if (err)
      {
          // check and handle err
          return
      }
      var lines = data.split('\n') //.slice(1).join('\n');
      var newlines = []
      for(idx in lines){
        line=lines[idx]
        if(!line.includes(m3u8ID)){
          newlines.push(line)
        }
      }
      fs.writeFile(cache_file, newlines.join('\n'), (err) => {
        if (err) throw err;
        console.log('Successfully updated the file!');
      });
  });

  // options is optional
  glob(`${download_path}/${m3u8ID}*`, function (er, files) {
      for (const file of files) {
          fs.rm(file, {recursive: true}, (err) =>{
            if (err) throw err;
          })
      }
  });
})

// About page route.
router.get('/about', function (req, res) {
  res.send('About this m3u8');
})

module.exports = router;