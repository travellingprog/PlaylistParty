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


var ytplayer;
var onYouTubeIframeAPIReady = function () {
  ytplayer = new YT.Player('ytplayer', {
    height: '390',
    width: '640',
    videoId: '0IJoKuTlvuM',
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
};


var getYoutubeID = function(vidURL) {
  var idRegex = /(v=)(\w*)/;
  idMatch = vidURL.match(idRegex);
  return idMatch ? idMatch[2] : "";
};


var onPlayerStateChange = function(event) {
  
};


///////////////////////////////////////////////////////////////////////////////
// Page template

Session.set("playing", false);


Template.page.instructions = function () {
  return "Use the controls below.";
};


///////////////////////////////////////////////////////////////////////////////
// Controls template


Template.controls.playOrPause = function() {
  return Session.get("playing") ? "Pause" : "Play";
};


Template.controls.events({
  'click input.playback' : function () {
    if ( ytplayer && Session.get("playing") ) {
      ytplayer.pauseVideo();
      Session.set("playing", false);
    } else if (ytplayer) {
      ytplayer.playVideo();
      Session.set("playing", true);
    }
  }
});


///////////////////////////////////////////////////////////////////////////////
// Code to run on the client as soon as the DOM is ready


Meteor.startup(function () {
  
  // load the YouTube IFrame Player API code asynchronously
  loadYTplayerAPI();

});

