var video = document.getElementById('video');
//var video

function playM3u8(url){
  if(Hls.isSupported()) {
      video.volume = 0.3;
      var hls = new Hls();
      var m3u8Url = decodeURIComponent(url)
      console.log(m3u8Url)
      hls.loadSource(m3u8Url);
      //hls.loadSource("index.m3u8");
      //hls.loadSource("https://b.mahua-kb.com/20200726/L2VwR3YM/index.m3u8")
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        //video.muted = true;
        //video.muted = false;
        //video.play();
      });
      document.title = url
    }
	else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = url;
		video.addEventListener('canplay',function() {
		  video.play();
		});
		video.volume = 0.3;
		document.title = url;
  	}
}

function playPause() {
    video.paused?video.play():video.pause();
}

function volumeUp() {
    if(video.volume <= 0.9) video.volume+=0.1;
}

function volumeDown() {
    if(video.volume >= 0.1) video.volume-=0.1;
}

function seekRight() {
    video.currentTime+=5;
}

function seekLeft() {
    video.currentTime-=5;
}

function vidFullscreen() {
    if (video.requestFullscreen) {
      video.requestFullscreen();
  } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
  } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
}

//playM3u8(window.location.href.split("#")[1])
playM3u8(document.getElementById('uri').innerHTML)

window.onkeydown = vidCtrl;
function vidCtrl(e) {
  const vid = video;
  const key = e.code;

  if (key === 'ArrowLeft') {
    e.preventDefault();
    e.stopImmediatePropagation();
    vid.currentTime -= 5;
    if (vid.currentTime < 0) {
      vid.pause();
      vid.currentTime = 0;
    }
  } else if (key === 'ArrowRight') {
    e.preventDefault();
    e.stopImmediatePropagation();
    vid.currentTime += 5;
    if (vid.currentTime > vid.duration) {
      vid.pause();
      vid.currentTime = 0;
    }
  } else if (key === 'Space') {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (vid.paused || vid.ended) {
      vid.play();
    } else {
      vid.pause();
    }
  }
}
$('#video').on('click', function(){
    //this.paused?this.play():this.pause();
    this.blur();
});
$('#video').on('seeking', function(){
    //this.paused?this.play():this.pause();
    this.blur();
});
$('#video').on('play', function(){
    //this.paused?this.play():this.pause();
    this.blur();
});
$('#video').on('pause', function(){
    //this.paused?this.play():this.pause();
    this.blur();
});

// Get the modal
var modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

$("#ocr").click(function(e) {
  var curtime = $('#video')[0].currentTime
  var uri = document.getElementById('uri').innerHTML
  const Http = new XMLHttpRequest();
  const url='player/ocr?currentTime='+curtime+'&uri='+uri
  Http.open("GET", url);
  Http.send();
  Http.onreadystatechange = (e) => {
    if(Http.readyState === XMLHttpRequest.DONE) {
      console.log(this.responseText)
      const checkUrl='player/ocrCheck'
      var checkReturned = true;
      const keepCheck=setInterval(function(){
        if(checkReturned){
          const Http = new XMLHttpRequest();
          Http.overrideMimeType("application/json");
          Http.open("GET", checkUrl);
          checkReturned = false;
          Http.send();
          Http.onreadystatechange = (e) => {
            if(Http.readyState === XMLHttpRequest.DONE) {
              checkReturned=true
              res=Http.responseText
              if(typeof(res)=='string' && jQuery.isEmptyObject(JSON.parse(res)))
                return
              if(res && !jQuery.isEmptyObject(res))
                res=JSON.parse(res)
                imgURL=res['imgURL']
                text=res['text']
                text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
                //$('#translated-img').prop("src", imgURL)
                $('#translated-img').prop("src", imgURL+"?t=" + new Date().getTime())
                $('#translated-text').html(text)
                modal.style.display = "block";
                clearInterval(keepCheck);
            }
          };
        }
      }, 500);
    }
  }
});

//$(window).on('load', function () {
//    //video = document.getElementById('video');
//    //playM3u8($('#uri')[0].text)
//    $('#video').on('click', function(){this.paused?this.play():this.pause();});
//    Mousetrap.bind('space', playPause);
//    Mousetrap.bind('up', volumeUp);
//    Mousetrap.bind('down', volumeDown);
//    Mousetrap.bind('right', seekRight);
//    Mousetrap.bind('left', seekLeft);
//    Mousetrap.bind('f', vidFullscreen);
//});
