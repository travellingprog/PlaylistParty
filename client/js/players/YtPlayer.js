///////////////////////////////////////////////////////////////////////////////
// YouTube API loading
//
// Global variables defined here:
// - loadYTplayerAPI function
// - onYouTubeIframeAPIReady function
// - onPlayerReady function
// - onPlayerStateChange function
// - YtPlayer object
// 
// Global variables used:
// - player array
// - curPlayer
// - boombox
// - setCurPlayer function
// - goToNextPlayer function



// load the YouTube IFrame Player API code
var loadYTplayerAPI = function () {

  var ytPlayerScript = 
                  '<script src="https://www.youtube.com/iframe_api"></script>';

  // place the Player API <script> as the first script on the page
  var oldfirstScript = $('script :first');
  if (oldfirstScript.length) {
    oldfirstScript.before(ytPlayerScript);
  } else {
    $('head').append(ytPlayerScript);
  }
};


// Signal when the Youtube API is ready, to load the YouTube player
var onYouTubeIframeAPIReady = function () {
  Session.set("YtAPIready", true);
}; 



///////////////////////////////////////////////////////////////////////////////
// YouTube Player object


var YtPlayer = function(id, streamID) {

  this.ytplayer = new YT.Player(id, {
    height: '200',
    width: '232',
    videoId: streamID,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
};


YtPlayer.prototype.play = function () {
  this.ytplayer.playVideo();
};
 

YtPlayer.prototype.pause = function () {
  this.ytplayer.pauseVideo();
};


YtPlayer.prototype.setVolume = function (newVolume) {
  if (this.ytplayer.setVolume) {
    this.ytplayer.setVolume(newVolume);  
  }
};


YtPlayer.prototype.updateVolume = function () {
  if (this.ytplayer.getVolume) {
    var newVolume = this.ytplayer.getVolume();
    if (newVolume != boombox.getVolume()) {
      boombox.setVolume(newVolume);
    }
  }
};


YtPlayer.prototype.setNewTime = function (newTime) {
  this.ytplayer.seekTo(newTime, true);
};


YtPlayer.prototype.updateCurrentTime = function() {
  if (this.ytplayer.getCurrentTime) {
    boombox.setCurTime( Math.ceil(this.ytplayer.getCurrentTime()) );  
  }
};


YtPlayer.prototype.updateDuration = function() {
  if (this.ytplayer.getDuration) {
    boombox.setTotalTime( Math.floor(this.ytplayer.getDuration()) );  
  }
};


// Called by any Youtube player when it is ready
var onPlayerReady = function(event) {
  // cue video
  var id = event.target.getIframe().getAttribute("id");
  player[id].setVolume(boombox.getVolume());
};


// Called by any Youtube player when it changes state
var onPlayerStateChange = function(event) {
  var newState = event.data;
  var state = YT.PlayerState;
  var id = event.target.getIframe().getAttribute("id");

  if (newState === state.PLAYING) {
    if (curPlayer !== player[id]) setCurPlayer(id);
    boombox.setPlaying(true);
    return;
  }

  if (curPlayer !== player[id]) return;

  if (newState === state.PAUSED) {
    boombox.setPlaying(false);
  }

  if (newState === state.ENDED) {
    // because Pause state is called right before Ended...
    boombox.setPlaying(true);
    // ... then ...
    goToNextPlayer();
  }
};



///////////////////////////////////////////////////////////////////////////////
// YouTube utility functions


var getYoutubeID = function(vidURL) {
  var idRegex = /(v=)([\w-]*)/;
  var idMatch = vidURL.match(idRegex);
  return idMatch ? idMatch[2] : "";
};
