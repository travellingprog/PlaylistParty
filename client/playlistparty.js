///////////////////////////////////////////////////////////////////////////////
// Meteor Collection subscription

var testList = "c3dfdf09-a554-4f25-a100-4283bfe81fea";

Meteor.subscribe("playlist", testList);
Meteor.subscribe("items", testList); 


///////////////////////////////////////////////////////////////////////////////
// Player Object

var player = {};
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

  scrollToCurPlayer();

  curPlayer.updateDuration();
  if (continuePlaying) curPlayer.play();  // may not work on mobile devices
};


var scrollToCurPlayer = function() {
  var firstPOffset = $('.player :first').offset().top;
  var newOffset = $('#' + curPlayer.id).parent().offset().top - firstPOffset;
  $('html, body').animate({scrollTop: newOffset}, 400);  
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
  'click a.tabLink' : function(e) {
    // disable this link, open the corresponding tab
    $(e.target.parentElement).addClass('disabled')
                             .siblings().removeClass('disabled');
    $('#phoneMenuDD').dropdown('toggle');  // menu stays open without this
    $('#deskMenu .btn[data-target="' + e.target.dataset.target + '"]').click();
    return false;
  },

  'click .shuffle' : function() {
    Session.set("shuffle", ! Session.get("shuffle"));
    return false;
  },


  'click .loop' : function() {
    Session.set("loop", ! Session.get("loop"));
    return false;
  },

  'click button[data-toggle="tab"]' : function(e) {
    // disable corresponding link in phone menu
    $('a.tabLink[data-target="' + e.target.dataset.target + '"]')
      .parent().addClass('disabled')
      .siblings().removeClass('disabled');
  },

  'keypress #normSearchField' : function(event) {
    if (event.which == 13) {
      normSearch();
      return false;
    }
  },

  'click #normSearchBtn' : function() {
    normSearch();
  },

  'click #phoneSearchBtn' : function() {
    Session.set("showPhoneSearch", true);
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
  var phoneVol = $("#phoneVol");
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
  }

});


///////////////////////////////////////////////////////////////////////////////
// Search template
Session.set("query", "");
Session.set("ytSearchIndex", 0);
Session.set("scSearchIndex", 0);
Session.set("selection", new Array());
var ytResult = new Array();
var scResult = new Array();
var ytSearchError, scSearchError;
var logoPos = 0;

var normSearch = function() {
  $('#normSearchBtn').tab('show');
  mediaSearch($('#normSearchField').val());
  $('#normSearchField').val("");
};


var mediaSearch = function (query) {
  Session.set("query", query);
  Session.set("ytSearchComplete", false);
  Session.set("scSearchComplete", false);
  Session.set("ytSearchIndex", 0);
  Session.set("scSearchIndex", 0);
  Session.set("selection", new Array());
  ytResult = new Array();
  scResult = new Array();
  ytSearchError = null;
  scSearchError = null;
  logoPos = 0;
  Session.set("searching", true);
  ytSearch(query);  // Youtube
  scSearch(query);  // SoundCloud
  window.scrollTo(0,0);
};


var ytSearch = function (query) {
  var searchURL = "https://www.googleapis.com/youtube/v3/search";
  var param = {};
  param["q"] = '"' + query + '"';
  param["type"] = "video";
  param["key"] = "AIzaSyC9NItPbDx4SdF3DQJn-5dT2fL1qtNACKI";
  param["videoEmbeddable"] = true;
  param["maxResults"] = 50;
  param["part"] = "id, snippet";
  param["fields"] =  "items(id/videoId, ";
  param["fields"] += "snippet(title, thumbnails/default/url))";

  Meteor.http.get(searchURL, {params: param}, function (error, result)  {
    
    Session.set("ytSearchComplete", true);
    if (error) {
      ytSearchError = result.data.error.message;
      return;
    }

    var resp = result.data;
    var ytCount = resp.items.length;
    var item, title, titleIndex, artist;

    for (var i=0; i < ytCount; i++) {
      item = resp.items[i];
      title = item.snippet.title;
      titleIndex = title.indexOf(" - ");
      if (titleIndex !== -1) {
        artist = title.substring(0, titleIndex);
        title = title.substring(titleIndex + 3);
      } else {
        artist = "";
      }

      ytResult[i] = {
        "artist": artist,
        "title": title,
        "pic": item.snippet.thumbnails.default.url,
        "streamID": item.id.videoId,
        "type": "YouTube",
        "selected": ""
      };
    }
  });
};


var scSearch = function (query) {
  var param = {};
  param["q"] = query;
  param["order"] = "hotness";
  param["filter"] = "public, streamable";

  SC.get('/tracks', param, function(resp, error) {
    
    Session.set("scSearchComplete", true);
    if (error) {
      scSearchError = error;
      return;
    }

    var scCount = resp.length;
    var item;

    for (var i=0; i < scCount; i++) {
      item = resp[i];
      scResult[i] = {
        "artist" : item.user.username,
        "title" : item.title,
        "duration" : showTime(Math.floor(item.duration / 1000)),
        "pic" : (item.artwork_url) ? item.artwork_url : item.waveform_url,
        "streamID": item.permalink_url,
        "type": "SoundCloud",
        "selected": ""
      };
    }
  });
};


Template.search.searching = function() {
  return Session.get("searching");
};

Template.search.query = function () {
  return Session.get("query");
}

Template.search.ytSearchComplete = function() {
  return Session.get("ytSearchComplete");
};

Template.search.noYtSearchError = function () {
  return (! ytSearchError);
};

Template.search.ytResults = function () {
  if (ytResult.length === 0) return;
  var startIndex = Session.get("ytSearchIndex");
  var endIndex = startIndex + 5;
  if (ytResult.length < endIndex) endIndex = ytResult.length;
  return ytResult.slice(startIndex, endIndex);
};

Template.search.ytErrorMsg = function() {
  return ytSearchError;
};

Template.search.disableYtPrev = function () {
  if (Session.get("ytSearchIndex") === 0) return "disabled";
  return "";
};

Template.search.disableYtNext = function () {
  if ((Session.get("ytSearchIndex") + 5) >= ytResult.length) return "disabled";
  return "";
};

Template.search.scSearchComplete = function() {
  return Session.get("scSearchComplete");
};

Template.search.noScSearchError = function () {
  return (! scSearchError);
};

Template.search.scResults = function () {
  if (scResult.length === 0) return;
  var startIndex = Session.get("scSearchIndex");
  var endIndex = startIndex + 5;
  if (scResult.length < endIndex) endIndex = ytResult.length;
  return scResult.slice(startIndex, endIndex);
};

Template.search.scErrorMsg = function() {
  return scSearchError.message;
};

Template.search.disableScPrev = function () {
  if (Session.get("scSearchIndex") === 0) return "disabled";
  return "";
};

Template.search.disableScNext = function () {
  if ((Session.get("scSearchIndex") + 5) >= scResult.length) return "disabled";
  return "";
};

Template.search.SelectOrUnselect = function() {
  if (this.selected === "") return "Select";
  return "Unselect";
};

Template.search.hideAdd = function () {
  if (Session.get("selection").length !== 0) return "hidden";
  return "";
};

Template.search.hideMultSel = function () {
  if (Session.get("selection").length === 0) return "hidden";
  return "";
};

Template.search.selNum = function() {
  return Session.get("selection").length;
};


Template.search.events({
  'click #ytPrev' : function(e) {
    if (Session.get("ytSearchIndex") === 0) return;
    Session.set("ytSearchIndex", Session.get("ytSearchIndex") - 5);
    logoPos = $(e.target).closest('.btn-toolbar').siblings('.APIlogo')
                  .offset().top;
    logoPos -= $('#searchTop').offset().top;
    $('html, body').scrollTop(logoPos);
  },

  'click #ytNext' : function(e) {
    if ((Session.get("ytSearchIndex") + 5) >= ytResult.length) return;
    Session.set("ytSearchIndex", Session.get("ytSearchIndex") + 5);
    logoPos = $(e.target).closest('.btn-toolbar').siblings('.APIlogo')
                  .offset().top;
    logoPos -= $('#searchTop').offset().top;
    $('html, body').scrollTop(logoPos);
  },

  'click #scPrev' : function(e) {
    if (Session.get("scSearchIndex") === 0) return;
    Session.set("scSearchIndex", Session.get("scSearchIndex") - 5);
    logoPos = $(e.target).closest('.btn-toolbar').siblings('.APIlogo')
                  .offset().top;
    logoPos -= $('#searchTop').offset().top;
    $('html, body').scrollTop(logoPos);
  },

  'click #scNext' : function(e) {
    if ((Session.get("scSearchIndex") + 5) >= scResult.length) return;
    Session.set("scSearchIndex", Session.get("scSearchIndex") + 5);
    logoPos = $(e.target).closest('.btn-toolbar').siblings('.APIlogo')
                  .offset().top;
    logoPos -= $('#searchTop').offset().top;
    $('html, body').scrollTop(logoPos);
  },

  'click .addItem' : function() {

    var newSeqNo;
    if (! Items.findOne({})) {
      newSeqNo = 1;
    } else {
      newSeqNo = parseInt(Items.findOne({},{sort: {seqNo: -1}}).seqNo) + 1;
    }

    Items.insert({
      "playlistID" : testList, 
      "type" : this.type, 
      "streamID" : this.streamID,
      "artist": this.artist,
      "title": this.title,
      "seqNo" : parseFloat(newSeqNo + "." + (new Date()).getTime()), 
      "addedBy" : "user1"
    });

    $('#deskMenu .active').tab("show");
    Session.set("searching", false);
    Session.set("query", "");
    Session.set("ytSearchComplete", false);
    Session.set("scSearchComplete", false);
    Session.set("ytSearchIndex", 0);
    Session.set("scSearchIndex", 0);
    Session.set("selection", new Array());
    ytResult = new Array();
    scResult = new Array();
    ytSearchError = null;
    scSearchError = null;
    logoPos = 0;
  },

  'click .selectItem' : function(e) {
    var selection = Session.get("selection");

    if (this.selected === "") 
    {
      this.selected = "selected";  
      selection.push(this);
      $(e.target.parentElement).addClass("selected");
      $(e.target).text("Unselect");
    } 
    else 
    {
      for (i=0, l=selection.length; i < l; i++) {
        if (selection[i].streamID === this.streamID) {
          selection.splice(i, 1);
          break;
        }
      }      
      this.selected = "";      
      $(e.target.parentElement).removeClass("selected");
      $(e.target).text("Select");
    }

    Session.set("selection", selection);
  },

  'click .addSelection' : function() {
    var selection = Session.get("selection");
    var selLength = selection.length;

    var newSeqNo;
    if (! Items.findOne({})) {
      newSeqNo = 1;
    } else {
      newSeqNo = parseInt(Items.findOne({},{sort: {seqNo: -1}}).seqNo) + 1;
    }
    
    for (i = 0; i < selLength; i++){
      
      Items.insert({
        "playlistID" : testList, 
        "type" : selection[i].type, 
        "streamID" : selection[i].streamID,
        "artist": selection[i].artist,
        "title": selection[i].title,
        "seqNo" : parseFloat(newSeqNo + "." + (new Date()).getTime()), 
        "addedBy" : "user1"
      });
      newSeqNo++;
    }

    $('#deskMenu .active').tab("show");
    Session.set("searching", false);
    Session.set("query", "");
    Session.set("ytSearchComplete", false);
    Session.set("scSearchComplete", false);
    Session.set("ytSearchIndex", 0);
    Session.set("scSearchIndex", 0);
    Session.set("selection", new Array());
    ytResult = new Array();
    scResult = new Array();
    ytSearchError = null;
    scSearchError = null;
    logoPos = 0;
  },

  'click .cancel': function() {
    $('#deskMenu .active').tab("show");
    Session.set("searching", false);
    Session.set("query", "");
    Session.set("ytSearchComplete", false);
    Session.set("scSearchComplete", false);
    Session.set("ytSearchIndex", 0);
    Session.set("scSearchIndex", 0);
    Session.set("selection", new Array());
    ytResult = new Array();
    scResult = new Array();
    ytSearchError = null;
    scSearchError = null;
    logoPos = 0;
  }
});


///////////////////////////////////////////////////////////////////////////////
// phoneSearch template

Template.page.showPhoneSearch = function() {
  return Session.get("showPhoneSearch");
};

var phoneSearch = function() {
  Session.set("showPhoneSearch", false);
  $('#normSearchBtn').tab('show');
  mediaSearch($('#phoneSearchField').val());
  $('#phoneSearchField').val("");
};

Template.phoneSearch.events({
  'keypress #phoneSearchField' : function(event) {
    if (event.which == 13) {
      phoneSearch();
    }
  },

  'click #phoneSearchBtn2' : function() {
    phoneSearch();
  },

  'click .cancel' : function() {
    Session.set("showPhoneSearch", false);
  }
});

Template.phoneSearch.rendered = function() {
  $('#phoneSearchField').focus();
};



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
    delay: 500,
  });

  // tab behaviour
  // $('body').on('shown', '#deskMenu button[data-toggle="tab"]', function(e) {
  //   alert(e.target.dataset.target);
  // });

  // Flash detection
  // if (swfobject.hasFlashPlayerVersion("10.0.22")) {
  //   Session.set("hasFlash", true);
  // }
  // else {
  //   Session.set("hasFlash", false);
  // }

});