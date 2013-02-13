///////////////////////////////////////////////////////////////////////////////
// Meteor Collection subscription

var testList = "7bd9497a-de64-4535-b63c-ae4c772491e1";


Meteor.subscribe("playlist", testList, function() {
  Session.set("listName", Playlist.findOne({}).name);
});


Session.set("itemsLoaded", false);
Meteor.subscribe("items", testList, function() {
    Session.set("itemsLoaded", true);
});


///////////////////////////////////////////////////////////////////////////////
// Player Object

var player = Object();
var curPlayer;

var Player = function(embedPlayer, userID) {

  this.addedBy = function(user){
    return (user === userID);
  }

  this.play = function () { 
    embedPlayer.play(); 
  };
  
  this.pause = function () { 
    embedPlayer.pause(); 
  };
  
  this.setVolume = function (newVolume) { 
    embedPlayer.setVolume(newVolume); 
  };

  this.getVolume = function () { 
    return embedPlayer.getVolume(); 
  };

  this.mute = function () {
    embedPlayer.mute();
  }

  this.unMute = function () {
    embedPlayer.unMute();
  }
  
  this.setNewTime = function (newTime) {
    embedPlayer.setNewTime(newTime);
  }

  this.getCurrentTime = function() {
    return embedPlayer.getCurrentTime();
  };

  this.getDuration = function() {
    return embedPlayer.getDuration();
  };
};


var createPlayer = function(item) {

  if (item.type === "YouTube") {
    player[item._id] = new Player(new YtPlayer(item._id, item.streamID), 
                                  item.addedBy);
  }

  if ((! curPlayer) && (item.seqNo === 1)) curPlayer = player[item._id];
};


// set items observation
var items, itemHandle;
var itemsObservation = function(handle) {
  // Don't observe items until the YouTube API is ready
  if (! Session.equals("YtAPIready", true)) return;
  if (! Session.equals("itemsLoaded", true)) return;

  // disable Meteor.autorun() if you get here
  handle.stop();  

  items = Items.find({},{sort: {seqNo: 1}});
  itemHandle = items.observe({
    added: createPlayer
  });
};

Meteor.autorun(itemsObservation);


// set periodic updates
var updatePlayerInfo = function() {
  if(curPlayer) {
    Session.set("volume", curPlayer.getVolume() );
    Session.set("curTime", curPlayer.getCurrentTime());
    Session.set("totalTime", curPlayer.getDuration());
  }  
};

setInterval(updatePlayerInfo, 250);


///////////////////////////////////////////////////////////////////////////////
// YouTube API code

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
// Header template


Template.header.playlistName = function() {
  return Session.get("listName");
};


///////////////////////////////////////////////////////////////////////////////
// Tracks template

Template.tracks.itemsLoaded = function() {
  return Session.get("itemsLoaded");
};


Template.tracks.items = function() {
  return Items.find({},{sort: {seqNo: 1}});
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
  return Math.round(Session.get("volume"));
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
    if ( curPlayer && Session.get("playing") ) {
      curPlayer.pause();
      Session.set("playing", false);
    } else if (curPlayer) {
      curPlayer.play();
      Session.set("playing", true);
    }
  },


  'click input.decVolume' : function() {
    var volume = Session.get("volume") - 5;
    if (volume < 0) volume = 0;
    Session.set("volume", volume);
    if (curPlayer) curPlayer.setVolume(volume);
  },


  'click input.incVolume' : function() {
    var volume = Session.get("volume") + 5;
    if (volume > 100) volume = 100;
    Session.set("volume", volume);
    if (curPlayer) curPlayer.setVolume(volume);
  },


  'click input.muteCtrl' : function() {
    if ( curPlayer && Session.get("mute") ) {
      curPlayer.unMute();
      Session.set("mute", false);
    } else if (curPlayer) {
      curPlayer.mute();
      Session.set("mute", true);
    }
  },


  'click input.decTime' : function() {
    var step = Math.ceil(Session.get("totalTime") / 10);  // <- Set as variable?
    var newTime = Session.get("curTime") - step;
    if (newTime < 0) newTime = 0;
    // Session.set("curTime", newTime);   <- FUTURE USE, maybe
    curPlayer.setNewTime(newTime);
  },


  'click input.incTime' : function() {
    totalTime = Session.get("totalTime")
    var step = Math.ceil(totalTime / 10);
    var newTime = Session.get("curTime") + step;
    if (newTime > totalTime) newTime = totalTime;
    // Session.set("curTime", newTime);   <- FUTURE USE, maybe
    curPlayer.setNewTime(newTime);
  }
});


///////////////////////////////////////////////////////////////////////////////
// Code to run on the client as soon as the DOM is ready


Meteor.startup(function () {
  
  // load the YouTube IFrame Player API code asynchronously
  Session.set("YtAPIready", false);
  loadYTplayerAPI();


  // Flash detection
  if (swfobject.hasFlashPlayerVersion("10.0.22")) {
    Session.set("hasFlash", true);
  }
  else {
    Session.set("hasFlash", false);
  }

});

