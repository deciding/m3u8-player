// not web scale
module.exports = function(url, filepath) {
    return require('child_process')
      .execFileSync('curl', ['--silent', '-L', url, '-o', filepath], {encoding: 'utf8'});
  }