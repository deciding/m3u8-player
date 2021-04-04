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
        video.muted = true;
        video.muted = false;
        video.play();
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
$(window).on('load', function () {
    //video = document.getElementById('video');
    //playM3u8($('#uri')[0].text)
    $('#video').on('click', function(){this.paused?this.play():this.pause();});
    Mousetrap.bind('space', playPause);
    Mousetrap.bind('up', volumeUp);
    Mousetrap.bind('down', volumeDown);
    Mousetrap.bind('right', seekRight);
    Mousetrap.bind('left', seekLeft);
    Mousetrap.bind('f', vidFullscreen);
});
