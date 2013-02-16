///////////////////////////////////////////////////////////////////////////////
// Meteor Collection subscription

var testList = "c3dfdf09-a554-4f25-a100-4283bfe81fea";

Meteor.subscribe("playlist", testList);

Session.set("itemsLoaded", false);
Meteor.subscribe("items", testList); 


///////////////////////////////////////////////////////////////////////////////
// Player Object

var player = Object();
var curPlayer;

var Player = function(embedPlayer, userID, id) {

  this.id = id;

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
                                  item.addedBy, item._id);
  }

  if (! curPlayer) setCurPlayer(item._id);
};


// set periodic updates
var updatePlayerInfo = function() {
  if (curPlayer) {
    Session.set("volume", curPlayer.getVolume());
    Session.set("curTime", curPlayer.getCurrentTime());
    Session.set("totalTime", curPlayer.getDuration());
  }  
};

setInterval(updatePlayerInfo, 250);


// set the current player
var setCurPlayer = function(curPlayerID) {
  
  // if currently playing, pause until we switch the player
  var continuePlaying = Session.get("playing");
  if (continuePlaying) curPlayer.pause();

  player[curPlayerID].setVolume(Session.get("volume"));
  curPlayer = player[curPlayerID];
  Session.set("current_player", curPlayerID);

  if (continuePlaying) curPlayer.play();  // may not work on mobile devices
};


var goToNextPlayer = function () {
  var curItem = Items.findOne({"_id" : curPlayer.id});
  var nextItem = Items.findOne({seqNo: {$gt: curItem.seqNo}}, 
                               {sort: {seqNo: 1}});

  if (nextItem) {
    setCurPlayer(nextItem._id);
  } else {
    nextItem = Items.findOne({}, {sort: {seqNo: 1}});
    setCurPlayer(nextItem._id);
  }
};


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
  var thisList = Playlist.findOne(testList);
  if (thisList === undefined) return "";
  return thisList.name;
};


///////////////////////////////////////////////////////////////////////////////
// Tracks template

Template.tracks.APIsReady = function () {
  if (! Session.get("YtAPIready")) return false;
  return true;
}


Template.tracks.items = function() {
  return Items.find({},{sort: {seqNo: 1}});
};


///////////////////////////////////////////////////////////////////////////////
// Player template

Template.player.isCurrent = function () {
  return Session.equals("current_player", this._id) ? "current" : '';
};

Template.player.myItem = function () {
  return (this.addedBy === "user1");
};

Template.player.rendered = function() {
  if (player[this.data._id] === undefined) createPlayer(this.data);
};

Template.player.events({
  'click input.remItem' : function () {
    var thisID = this._id;
    if (curPlayer === player[thisID]) {
      if (Items.find({}).count() > 1) {
        goToNextPlayer();
        //note: going to next track will auto-pause the current one
      } else {
        curPlayer.pause();
      }
    }

    delete player[thisID];

    Items.remove(this._id, function (error) {
      if (error !== undefined) alert(error);
    });
  }
});


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
  },


  'click input.prevTrack' : function() {
    var curItem = Items.findOne({"_id" : curPlayer.id});
    var prevItem = Items.findOne({seqNo: {$lt: curItem.seqNo}}, 
                                 {sort: {seqNo: -1}});
    if (prevItem) {
      setCurPlayer(prevItem._id);
    } else {
      prevItem = Items.findOne({}, {sort: {seqNo: -1}});
      setCurPlayer(prevItem._id);
    }
  },


  'click input.nextTrack' : function() {
    goToNextPlayer();
  },


  'click input.addURL' : function () {
    var url = $('#urlText').val();
    $('#urlText').val('');

    //if isYoutube(url) {
    var mediaID = getYoutubeID(url);

    Items.insert({
      "playlistID" : testList, 
      "type" : "YouTube", 
      "streamID" : mediaID, 
      "seqNo" : (Items.find({}).count() + 1) + "." + (new Date()).getTime(), 
      "addedBy" : "user1"
    });
    //}
  }
});


///////////////////////////////////////////////////////////////////////////////
// Code to run on the client as soon as the DOM is ready

Meteor.startup(function () {
  
  // past time: 1360973277020

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