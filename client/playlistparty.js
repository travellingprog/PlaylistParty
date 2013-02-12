///////////////////////////////////////////////////////////////////////////////
// Meteor Collection subscription

var testList = "fdfb45a8-f87c-460b-bdee-7933fdd75ecc";
var list;
Meteor.subscribe("playlists", testList, function() {
  list = Playlists.findOne({});
});  

// ^ ...maybe place after API is loaded?


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

  Session.set("totalTime", player.getDuration() );

  // set periodic updates
  setInterval(updatePlayerInfo, 250);
};


var getYoutubeID = function(vidURL) {
  var idRegex = /(v=)(\w*)/;
  idMatch = vidURL.match(idRegex);
  return idMatch ? idMatch[2] : "";
};


var updatePlayerInfo = function() {
  if(ytplayer) {
    Session.set( "volume", volFromYT(ytplayer.getVolume()) );
    Session.set( "curTime", Math.ceil(ytplayer.getCurrentTime()) );
  //   updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
  //   updateHTML("startBytes", ytplayer.getVideoStartBytes());
  //   updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
  }  
};


var onPlayerStateChange = function(event) {
  var newState = event.data;
  var player = event.target;
  var state = YT.PlayerState;

  if (newState === state.PLAYING) {
    // make sure video volume matches our control volume
    player.setVolume( volToYT(Session.get("volume")) );
    Session.set("playing", true);
  } else if ((newState === state.PAUSED) || (newState === state.ENDED)) {
    Session.set("playing", false);
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
Session.set("mute", false);
Session.set("curTime", 0);
Session.set("totalTime", 0);


Template.controls.playOrPause = function() {
  return Session.get("playing") ? "Pause" : "Play";
};


Template.controls.volValue = function() {
  return Session.get("volume");
};


Template.controls.muteOrUnmute = function() {
  return Session.get("mute") ? "Unmute" : "Mute";
};


Template.controls.curTime = function() {
  return showTime(Session.get("curTime"));
};


Template.controls.totalTime = function() {
  return showTime(Session.get("totalTime"));
};


var showTime = function(total) {
  // format the time, received in number of seconds
  var hour, min, sec;
  
  if (total >= 3600) {
    hour = Math.floor(total / 3600);
    total = total % 3600;
    if (hour < 10) hour = '0' + hour;
    hour = hour + ':';
  } else {
    hour = '';
  }

  if (total >= 60) {
    min = Math.floor(total / 60);
    total = total % 60;
    if (min < 10) min = '0' + min;
    min = min + ':';
  } else {
    min = '00:';
  }

  sec = Math.round(total);
  // sec = total;
  if (sec < 10) sec = '0' + sec;
  return hour + min + sec;
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
  },


  'click input.muteCtrl' : function() {
    if ( ytplayer && Session.get("mute") ) {
      ytplayer.unMute();
      Session.set("mute", false);
    } else if (ytplayer) {
      ytplayer.mute();
      Session.set("mute", true);
    }
  },


  'click input.decTime' : function() {
    var step = Math.ceil(Session.get("totalTime") / 10);  // <- Set as variable?
    var newTime = Session.get("curTime") - step;
    if (newTime < 0) newTime = 0;
    // Session.set("curTime", newTime);   <- FUTURE USE, maybe
    ytplayer.seekTo(newTime, true);
  },


  'click input.incTime' : function() {
    totalTime = Session.get("totalTime")
    var step = Math.ceil(totalTime / 10);
    var newTime = Session.get("curTime") + step;
    if (newTime > totalTime) newTime = totalTime;
    // Session.set("curTime", newTime);   <- FUTURE USE, maybe
    ytplayer.seekTo(newTime, true);
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

