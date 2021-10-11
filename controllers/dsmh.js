var fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const { User, Video, Video18, Dsmh } = require('../models/models');

// ====== user control ======
// ====== user video list ======

// Home page route.
exports.loadComics = async (req, res) => {
  var page_size = 50; //HARDCODE
  var random = req.query.random
  var pageno = req.query.pageno || '1'
  pageno = parseInt(pageno) - 1;
  var page_start = pageno*page_size
  var search = req.query.search || ''
  search = search.trim()
  var comics;

  if(random){
    videos = []
    var rand;
    for(var i = 0; i < page_size; i++){
      rand= Math.floor(Math.random() * 10000)
      comics.push(await Dsmh.findOne().skip(rand))
    }
  }
  else if(search){
    const { stdout, stderr } = await exec(`python es_query_dsmh.py ${search} 1000`); // HARDCODE
    query_indices = stdout.trim().split(' ')
    comics = await Dsmh.find({'index': query_indices}).sort({'index': "descending"}).skip(page_start).limit(page_size);
  }
  else{
    comics = await Dsmh.find().sort({'index': "descending"}).skip(page_start).limit(page_size);
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
  for (var i = 0;i<comics.length;i++){
    meta['infos'].push({'title': `${comics[i].index}: ${comics[i].title}`, 'cover': comics[i].cover, 'index': comics[i].index})
  }

  res.render('dsmh', meta)
}

exports.loadComicChaps = async (req, res) => {
  var index = req.params['index']
  var comic = await Dsmh.findOne({'index': index});

  meta = {'title': comic.title, 'writer': comic.writer, 'update': comic.update, 'infos':[]};
  imgs = comic.imgs

  for (var i = 0;i<imgs.length;i++){
    meta['infos'].push({"index": index, "chap": imgs[i].chp})
  }

  res.render('dsmh1', meta)
}

exports.loadComicContents = async (req, res) => {
  var index_chp = req.params['index_chp']
  var index = index_chp.split('_')[0]
  var chp = parseInt(index_chp.split('_')[1])

  var comic = await Dsmh.findOne({'index': index});
  chp = Math.max(0, chp)
  chp = Math.min(chp, comic.imgs.length-1)
  var menu_link = `/dsmh1/${index}`
  var prev_link = `/dsmh2/${index}_${chp-1}`
  var next_link = `/dsmh2/${index}_${chp+1}`
  var contents = comic.imgs[chp].chp_imgs

  meta = {'menu_link': menu_link, 'prev_link': prev_link, 'next_link': next_link, 'contents': contents};

  res.render('dsmh2', meta)
}