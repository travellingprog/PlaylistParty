var YtPlayer = function(id, streamID) {

  var ytplayer = new YT.Player(id, {
    height: '240',
    width: '320',
    videoId: streamID,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });

  this.play = function () {
    ytplayer.playVideo();
  }
  
  this.pause = function () {
    ytplayer.pauseVideo();
  }
  
  this.setVolume = function (newVolume) {
    if (typeof ytplayer.setvolume === 'function') {
      ytplayer.setVolume(newVolume);  
    }
  }

  this.getVolume = function () {
    return ytplayer.getVolume();
  }

  this.mute = function () {
    ytplayer.mute();
  }

  this.unMute = function () {
    ytplayer.unMute();
  }
  
  this.setNewTime = function (newTime) {
    ytplayer.seekTo(newTime, true);
  }

  this.getCurrentTime = function() {
    return Math.ceil(ytplayer.getCurrentTime());
  }

  this.getDuration = function() {
    return Math.floor(ytplayer.getDuration());
  }
};


// Called by any Youtube player when it is ready
var onPlayerReady = function(event) {
  // cue video
  var id = event.target.getIframe().getAttribute("id");
  var thisPlayer = player[id];
  thisPlayer.setVolume(Session.get("volume"));
};


// Called by any Youtube player when it changes state
var onPlayerStateChange = function(event) {
  var newState = event.data;
  var state = YT.PlayerState;
  var id = event.target.getIframe().getAttribute("id");

  if (newState === state.PLAYING) {
    if (curPlayer !== player[id]) setCurPlayer(id);
    Session.set("playing", true);
    return;
  }

  if (curPlayer !== player[id]) return;

  if (newState === state.PAUSED) {
    Session.set("playing", false);
  }

  if (newState === state.ENDED) {
    // because Pause state is called right before Ended...
    Session.set("playing", true);
    // ... then ...
    goToNextPlayer();
  }
};


var getYoutubeID = function(vidURL) {
  var idRegex = /(v=)([\w-]*)/;
  idMatch = vidURL.match(idRegex);
  return idMatch ? idMatch[2] : "";
};



  // function volumeToYT(volume) {
  //   // set a volume value on the YouTube player so that its volume slider 
  //   // control looks like our volume slider control

  //   var YTvolume;
  //   if (Session.get("hasFlash")) {
  //     YTvolume = Math.round( Math.pow((0.1029010817 * volume), 1.9802909245) );
  //     if (YTvolume > 100) YTvolume = 100;
  //   } else {
  //     YTvolume = volume;
  //   }
  //   return YTvolume;
  // }


  // function volFromYT(YTvolume) {
  //   // return a volume value that reflects the position of the volume slider 
  //   // control on the embedded YouTube video player.

  //   var volume;
  //   if (Session.get("hasFlash")) {
  //     volume = Math.round( 9.7245712923 * Math.pow(YTvolume, 0.5049763081) );
  //     if (volume > 100) volume = 100;
  //   } else {
  //     volume = Math.round(YTvolume);
  //   }
  //   return volume;
  // }