var express = require('express');
var router = express.Router();

// Home page route.
router.get('/', function (req, res) {
  res.render('index')
})

// About page route.
router.get('/about', function (req, res) {
  res.send('About this m3u8');
})

module.exports = router;