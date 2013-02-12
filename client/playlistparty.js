///////////////////////////////////////////////////////////////////////////////
// YouTube

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


// when the API is ready, load the YouTube player
var ytplayer;
var onYouTubeIframeAPIReady = function () {
  ytplayer = new YT.Player('ytplayer', {
    height: '390',
    width: '640',
    videoId: 'V_QyvLX4h2k',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
};


var onPlayerReady = function(event) {
  // cue video
  player = event.target;
  vidID = getYoutubeID(player.getVideoUrl());
  if (! vidID === "") player.cueVideoById(vidID);

  // set periodic updates
  setInterval(updatePlayerInfo, 250);
};


var getYoutubeID = function(vidURL) {
  var idRegex = /(v=)(\w*)/;
  idMatch = vidURL.match(idRegex);
  return idMatch ? idMatch[2] : "";
};


var updatePlayerInfo = function() {
  // if(ytplayer && ytplayer.getDuration) {
  //   updateHTML("videoDuration", ytplayer.getDuration());
  //   updateHTML("videoCurrentTime", ytplayer.getCurrentTime());
  //   updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
  //   updateHTML("startBytes", ytplayer.getVideoStartBytes());
  //   updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
  // }  
};


var onPlayerStateChange = function(event) {
  var newState = event.data;

  if (newState == YT.PlayerState.PLAYING) {
    // make sure video volume matches our control volume
    event.target.setVolume( volToYT(Session.get("volume")) );
  }
};


var volToYT = function(volume) {
  // set a volume value on the YouTube player so that its volume slider control
  // looks like our volume slider control

  var YTvolume;
  if (Session.get("hasFlash")) {
    YTvolume = Math.round( Math.pow((0.1029010817 * volume), 1.9802909245) );
    if (YTvolume > 100) YTvolume = 100;
  } else {
    YTvolume = volume;
  }
  return YTvolume;
};


var volFromYT = function(YTvolume) {
  // return a volume value that reflects the position of the volume slider 
  // control on the embedded YouTube video player.

  var volume;
  if (Session.get("hasFlash")) {
    volume = Math.round( 9.7180708287 * Math.pow(YTvolume, 0.5049763081) );
    if (volume > 100) volume = 100;
  } else {
    volume = Math.round(YTvolume);
  }
  return volume;
};


///////////////////////////////////////////////////////////////////////////////
// Page template


Template.page.instructions = function () {
  return "Use the controls below.";
};


///////////////////////////////////////////////////////////////////////////////
// Controls template

Session.set("playing", false);
Session.set("volume", 50);


Template.controls.playOrPause = function() {
  return Session.get("playing") ? "Pause" : "Play";
};


Template.controls.volValue = function() {
  return Session.get("volume");
};


Template.controls.events({
  // in the future, the events below will NOT directly trigger methods on
  // the Youtube player

  'click input.playback' : function () {
    if ( ytplayer && Session.get("playing") ) {
      ytplayer.pauseVideo();
      Session.set("playing", false);
    } else if (ytplayer) {
      ytplayer.playVideo();
      Session.set("playing", true);
    }
  },


  'click input.decVolume' : function() {
    var volume = Session.get("volume") - 5;
    if (volume < 0) volume = 0;
    Session.set("volume", volume);
    if (ytplayer) ytplayer.setVolume( volToYT(volume) );
  },


  'click input.incVolume' : function() {
    var volume = Session.get("volume") + 5;
    if (volume > 100) volume = 100;
    Session.set("volume", volume);
    if (ytplayer) ytplayer.setVolume( volToYT(volume) );
  }
});


///////////////////////////////////////////////////////////////////////////////
// Code to run on the client as soon as the DOM is ready


Meteor.startup(function () {
  
  // load the YouTube IFrame Player API code asynchronously
  loadYTplayerAPI();


  // Flash detection
  if (swfobject.hasFlashPlayerVersion("10.0.22")) {
    Session.set("hasFlash", true);
  }
  else {
    Session.set("hasFlash", false);
  }

});

