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

  this.updateVolume = function () { 
    return embedPlayer.updateVolume(); 
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

  this.updateCurrentTime = function() {
    return embedPlayer.updateCurrentTime();
  };

  this.updateDuration = function() {
    return embedPlayer.updateDuration();
  };

  this.updateMuted = function () {
    return embedPlayer.updateMuted();
  }
};


var createPlayer = function(item) {
  if (item.type === "YouTube") {
    player[item._id] = new Player(new YtPlayer(item._id, item.streamID), 
                                  item.addedBy, item._id);
  } else if (item.type === "SoundCloud") {
    player[item._id] = new Player(new ScPlayer(item._id, item.streamID), 
                                  item.addedBy, item._id);
  }

  if (! curPlayer) setCurPlayer(item._id);
};


// set periodic updates
var updatePlayerInfo = function() {
  if (curPlayer) {
    curPlayer.updateVolume();
    curPlayer.updateCurrentTime();
    curPlayer.updateMuted();
  }  
};

setInterval(updatePlayerInfo, 250);


// set the current player
var setCurPlayer = function(curPlayerID) {
  
  // if currently playing, pause until we switch the player
  var continuePlaying = Session.get("playing");
  if (continuePlaying) curPlayer.pause();

  // set new curPlayer
  player[curPlayerID].setVolume(Session.get("volume"));
  curPlayer = player[curPlayerID];
  Session.set("current_player", curPlayerID);

  // scroll to new curPlayer
  firstPOffset = $('.playerItem :first').offset().top;
  newOffset = $('#' + curPlayerID).offset().top - firstPOffset;
  $('html, body').animate({scrollTop: newOffset}, 400);

  curPlayer.updateDuration();
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
// Header template

Template.header.playlistName = function() {
  var thisList = Playlist.findOne(testList);
  if (thisList === undefined) return "Welcome";
  return thisList.name;
};

Template.header.rendered = function() {
  // var newHeight = $('#header').css("height");
  // $('.headSection').css("height", newHeight);
  // var searchHeight = $('.form-search').css("height");
  // $('.form-search').css("margin-top", "" + newHeight - searchHeight);
};


///////////////////////////////////////////////////////////////////////////////
// Tracks template

Template.tracks.APIsReady = function () {
  if (! Session.get("YtAPIready")) return false;
  if (! Session.get("ScAPIready")) return false;
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


Template.controls.curTrack = function() {
  if (! curPlayer) return 0;
  var curItem = Items.findOne(Session.get("current_player"));
  return Items.find({seqNo: {$lte: curItem.seqNo}}).count();
};


Template.controls.numTracks = function() {
  return Items.find({}).count();
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
    var mediaID, type;

    if (url.search("youtube") !== -1) {
      mediaID = getYoutubeID(url);
      type = "YouTube";
    } else if (url.search("soundcloud") !== -1) {
      mediaID = url;
      type = "SoundCloud";
    }

    Items.insert({
      "playlistID" : testList, 
      "type" : type, 
      "streamID" : mediaID, 
      "seqNo" : (Items.find({}).count() + 1) + "." + (new Date()).getTime(), 
      "addedBy" : "user1"
    });
  },


  'click input.ytSearch' : function () {
    var searchURL = "https://www.googleapis.com/youtube/v3/search";
    var param = Object();
    param["q"] = "Eminem Kill You";
    param["type"] = "video";
    param["key"] = "AIzaSyC9NItPbDx4SdF3DQJn-5dT2fL1qtNACKI";
    param["videoEmbeddable"] = true;
    param["maxResults"] = 9;
    param["part"] = "id, snippet";
    param["fields"] =  "etag, nextPageToken, prevPageToken, items(id/videoId, ";
    param["fields"] += "snippet(title, thumbnails/default/url))";

    Meteor.http.get(searchURL, {params: param}, function (error, result)  {
      var vidResults = result.data;
      alert(vidResults.items[0].snippet.thumbnails.default.url);
    });
  },


  'click input.scSearch' : function () {
    var param = Object();
    param["q"] = "Mad Decent";
    param["order"] = "hotness";
    param["filter"] = "public, streamable";

    SC.get('/tracks', param, function(tracks) {
      var resString = "Number of results: " + tracks.length + "\n";
      resString += "\n";
      resString += "First track title: " + tracks[0].title + "\n";
      resString += "Posted by: " + tracks[0].user.username + "\n";
      resString += "artwork: " + tracks[0].artwork_url + "\n";
      resString += "url: " + tracks[0].permalink_url + "\n";

      alert(resString);
    });
  }
});



///////////////////////////////////////////////////////////////////////////////
// Code to run on the client as soon as the DOM is ready

Meteor.startup(function () {
  
  window.scrollTo(0,0);

  // load the YouTube IFrame Player API code asynchronously
  Session.set("YtAPIready", false);
  loadYTplayerAPI();

  // Register with the SoundCloud API
  SC.initialize({
    client_id: '46952284e7dd10b148d9868c4ad74cdc'
  });
  Session.set("ScAPIready", true);


  // Flash detection
  if (swfobject.hasFlashPlayerVersion("10.0.22")) {
    Session.set("hasFlash", true);
  }
  else {
    Session.set("hasFlash", false);
  }

});