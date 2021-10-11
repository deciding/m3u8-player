var fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { User, Video, Video18 } = require('../models/models');

// ====== user control ======
// ====== user video list ======

// Home page route.
exports.loadVideos = async (req, res) => {
  var page_size = 50; //HARDCODE
  var random = req.query.random
  var pageno = req.query.pageno || '1'
  pageno = parseInt(pageno) - 1;
  var page_start = pageno*page_size
  var search = req.query.search || ''
  search = search.trim()
  var videos;

  if(random){
    videos = []
    var rand;
    for(var i = 0; i < page_size; i++){
      rand= Math.floor(Math.random() * 10000)
      videos.push(await Video18.findOne().skip(rand))
    }
  }
  else if(search){
    const { stdout, stderr } = await exec(`python es_query.py ${search} 1000`); // HARDCODE
    query_indices = stdout.trim().split(' ')
    videos = await Video18.find({'index': query_indices}).sort({'index': "descending"}).skip(page_start).limit(page_size);
  }
  else{
    videos = await Video18.find().sort({'index': "descending"}).skip(page_start).limit(page_size);
  }

  // 传出去 random，page number，search string
  // 传进来 images，titles，links，pages，current page
  pageno+=1;
  var pages_left = pageno - 5;
  var pages_right = pageno + 5; // we now don't check the upper bound
  if(pages_left < 1){
    pages_left = 1
    pages_right = 11
  }
  // const range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
  // var page_range = range(pages_left, pages_right)
  var pages = []
  for (var i = pages_left;i<pages_right;i++){
    if(i == pageno){
      pages.push({'num': i, 'a': false})
    }
    else{
      pages.push({'num': i, 'a': true})
    }
  }
  meta = {'search': search, 'pages': pages, 'cur': pageno, 'infos':[]};
  for (var i = 0;i<videos.length;i++){
    images = videos[i].imgs
    images.unshift(videos[i].cover)
    meta['infos'].push({'title': `${videos[i].index}: ${videos[i].title}`, 'images': images, 'link': videos[i].player})
  }

  res.render('video18', meta)
}
