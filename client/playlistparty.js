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
  
  this.setNewTime = function (newTime) {
    embedPlayer.setNewTime(newTime);
  }

  this.updateCurrentTime = function() {
    return embedPlayer.updateCurrentTime();
  };

  this.updateDuration = function() {
    return embedPlayer.updateDuration();
  };
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
  if (curPlayer && !pauseUpdates) {
    curPlayer.updateVolume();
    curPlayer.updateCurrentTime();
    curPlayer.updateDuration();
  }  
};

setInterval(updatePlayerInfo, 500);


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
  firstPOffset = $('.player :first').offset().top;
  newOffset = $('#' + curPlayerID).parent().offset().top - firstPOffset;
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

Template.header.shuffleStatus = function () {
  return Session.get("shuffle") ? "ON" : "off";
};

Template.header.loopStatus = function () {
  return Session.get("loop") ? "ON" : "off";
};

Template.header.events({
  'click .shuffle' : function() {
    Session.set("shuffle", ! Session.get("shuffle"));
    return false;
  },


  'click .loop' : function() {
    Session.set("loop", ! Session.get("loop"));
    return false;
  },

  'keypress #normSearchField' : function(event) {
    if (event.which == 13) {
      addURL(event.currentTarget.value);
      event.currentTarget.value = "";
      return false;
    }  
  },

  'click #normSearchBtn' : function() {
    addURL($('#normSearchField').val());
    $('#normSearchField').val("");
    return false;
  }
});


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

Template.player.trackNo = function() {
  return Items.find({seqNo: {$lte: this.seqNo}}).count();
};

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
  'click button.remItem' : function () {
    var thisID = this._id;
    if (curPlayer === player[thisID]) {
      if (Items.find({}).count() > 1) {
        goToNextPlayer();
        //note: going to the next track will auto-pause the current one
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
Session.set("volume", 80);
Session.set("mute", false);
Session.set("curTime", 0);
Session.set("totalTime", 0);
Session.set("shuffle", false);
Session.set("loop", false);
Session.set("controlsHidden", false);
var timeslider, volumeslider;
var pauseUpdates = false;


Template.controls.isHidden = function() {
  return Session.get("controlsHidden") ? "hidden" : "";
};


Template.controls.isHidden2 = function() {
  return Session.get("controlsHidden") ? "" : "hidden";
};


initiateTimeSlider = function () {
  timeslider.slider({
    range: "min", 
    animate: true,
    create: timeTracking,
    start: function() { pauseUpdates = true; },
    slide: function(event, ui) { Session.set("curTime", ui.value); },
    stop: function(event, ui) {
      Session.set("curTime", ui.value);
      if (curPlayer) curPlayer.setNewTime(ui.value);
      setTimeout(function () {
        pauseUpdates = false;
        timeTracking();
      }, 1000);
    }
  });
};

timeTracking = function () {
  Meteor.autorun(function () {
    if (pauseUpdates) return;
    timeslider.slider("value", Session.get("curTime"));
  });

  Meteor.autorun(function () {
    timeslider.slider("option", "max", Session.get("totalTime"));
  });
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


Template.controls.shufflePic = function () {
  return Session.get("shuffle") ? "/Shuffle.png" : "/ShuffleDisabled.png";
}


Template.controls.loopPic = function () {
  return Session.get("loop") ? "/Loop.png" : "/LoopDisabled.png";
}


Template.controls.playOrPause = function() {
  return Session.get("playing") ? "/Pause.png" : "/Play.png";
};


initiateVolumeSlider = function () {
  volumeslider.slider({
    range: "min", 
    animate: true,
    "value": "80",
    create: volumeTracking,
    start: function() { pauseUpdates = true },
    slide: function(event, ui) { if (curPlayer) curPlayer.setVolume(ui.value) },
    stop: function(event, ui) { setNewVolume(ui.value) }
  });
};

volumeTracking = function () {
  Meteor.autorun(function () {
    if (pauseUpdates) return;
    volumeslider.slider("value", Session.get("volume"));
    updateVolTooltip(Session.get("volume"));
  });
};

setNewVolume = function (volume) {
  pauseUpdates = true;
  Session.set("volume", volume);
  if (curPlayer) curPlayer.setVolume(volume);
  updateVolTooltip(volume);
  setTimeout(function () {
    pauseUpdates = false;
    volumeTracking();
  }, 500);  
};

updateVolTooltip = function (volume) {
  var phoneVol = $("#phoneVol")
  phoneVol.tooltip('destroy');
  phoneVol.tooltip({title: (Math.round(volume)).toString() });
  phoneVol.tooltip('show');
};


Template.controls.events({

  'click #minControls': function () {
    Session.set("controlsHidden", true)
  },


  'click #openControls': function () {
    Session.set("controlsHidden", false)
  },


  'click .shuffle' : function() {
    Session.set("shuffle", ! Session.get("shuffle"));
  },


  'click .loop' : function() {
    Session.set("loop", ! Session.get("loop"));
  },


  'click #prev' : function() {
    if (! curPlayer) return;

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


  'click #play' : function () {
    if (! curPlayer) return;

    if (Session.get("playing")) {
      curPlayer.pause();
      Session.set("playing", false);
    } else {
      curPlayer.play();
      Session.set("playing", true);
    }
  },


  'click #next' : function() {
    if (! curPlayer) return;
    goToNextPlayer();
  },


  'click #minVolume' : function () {
    setNewVolume(0);
  },

  'click #maxVolume' : function () {
    setNewVolume(100);
  },

  'click #volumeDown' : function() {
    var volume = Session.get("volume") - 10;
    if (volume < 0) volume = 0;
    setNewVolume(volume);
  },

  'click #volumeUp' : function() {
    var volume = Session.get("volume") + 10;
    if (volume > 100) volume = 100;
    setNewVolume(volume);
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
// Utility Functions

var showTime = function(total) {
  // format the time, received in number of seconds, to [HH:]MM:SS
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

var addURL = function(url) {
  if (url == "") return;
  var mediaID, type;

  if (url.search("youtube") !== -1) {
    mediaID = getYoutubeID(url);
    type = "YouTube";
  } else if (url.search("soundcloud") !== -1) {
    mediaID = url;
    type = "SoundCloud";
  } else {
    return;
  }

  var newSeqNo = Math.floor(Items.findOne({},{sort: {seqNo: -1}}).seqNo + 1);

  Items.insert({
    "playlistID" : testList, 
    "type" : type, 
    "streamID" : mediaID,
    "title": "Item title",
    "seqNo" : newSeqNo + "." + (new Date()).getTime(), 
    "addedBy" : "user1"
  });
};


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

  // sliders
  timeslider = $('#timeslider');
  volumeslider = $('#volumeslider');
  initiateTimeSlider();
  initiateVolumeSlider();

  // phoneVol tooltip
  $("#phoneVol").tooltip({
    title: (Session.get("volume")).toString(), 
    delay: 500
  });

  // Flash detection
  if (swfobject.hasFlashPlayerVersion("10.0.22")) {
    Session.set("hasFlash", true);
  }
  else {
    Session.set("hasFlash", false);
  }

});