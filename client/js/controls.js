///////////////////////////////////////////////////////////////////////////////
// Controls template

(function() {

  // Global variables used here:
  // - Session.keys.controlsHidden
  // - Session.keys.current_player   <- only exists because curPlayer is not reactive
  // - curPlayer
  // - boombox
  // - Items collection
  // - setCurPlayer function
  // - goToNextPlayer function

  var template = Template.controls;
  
  var $timeslider, $volumeslider, $phoneVol;
  var pauseUpdates = false;

  template.rendered = function() {
    // Initialization
    if (! $timeslider) {

      // Set the phoneVol tooltip
      $phoneVol = $("#phoneVol");
      $phoneVol.tooltip({
        title: (boombox.getVolume()).toString(), 
        delay: 500,
      });

      $volumeslider = $('#volumeslider');
      initiateVolumeSlider();


      // Set the slider controls
      $timeslider = $('#timeslider');
      initiateTimeSlider();
      

      // Initiate live updates on curPlayer
      updatePlayerInfo();
    }
  };


  var updatePlayerInfo = function() {
    if (curPlayer && !pauseUpdates) {
      curPlayer.updateVolume();
      curPlayer.updateCurrentTime();
      curPlayer.updateDuration();
    }
    setTimeout(updatePlayerInfo, 500);
  };


  var initiateTimeSlider = function () {
    $timeslider.slider({
      range: "min", 
      animate: true,
      create: timeTracking,
      start: function() { pauseUpdates = true; },
      slide: function(event, ui) { boombox.setCurTime(ui.value); },
      stop: function(event, ui) {
        boombox.setCurTime(ui.value);
        if (curPlayer) curPlayer.setNewTime(ui.value);
        setTimeout(function () {
          pauseUpdates = false;
          timeTracking();
        }, 1000);
      }
    });
  };

  var timeTracking = function () {
    Meteor.autorun(function () {
      if (pauseUpdates) return;
      $timeslider.slider("value", boombox.getCurTime());
    });

    Meteor.autorun(function () {
      $timeslider.slider("option", "max", boombox.getTotalTime());
    });
  };

  var initiateVolumeSlider = function () {
    $volumeslider.slider({
      range: "min", 
      animate: true,
      "value": "80",
      create: volumeTracking,
      start: function() { pauseUpdates = true },
      slide: function(event, ui) { if (curPlayer) curPlayer.setVolume(ui.value) },
      stop: function(event, ui) { setNewVolume(ui.value) }
    });
  };

  var volumeTracking = function () {
    Meteor.autorun(function () {
      if (pauseUpdates) return;
      $volumeslider.slider("value", boombox.getVolume());
      updateVolTooltip(boombox.getVolume());
    });
  };

  var setNewVolume = function (volume) {
    pauseUpdates = true;
    boombox.setVolume(volume);
    if (curPlayer) curPlayer.setVolume(volume);
    updateVolTooltip(volume);
    setTimeout(function () {
      pauseUpdates = false;
      volumeTracking();
    }, 500);  
  };

  var updateVolTooltip = function (volume) {
    $phoneVol.tooltip('destroy');
    $phoneVol.tooltip({title: (Math.round(volume)).toString() });
    $phoneVol.tooltip('show');
  };


  template.isHidden = function() {
    return Session.get("controlsHidden") ? "hidden" : "";
  };


  template.showMinimize = function() {
    return Session.get("controlsHidden") ? "" : "hidden";
  };


  template.curTime = function() {
    return showTime(boombox.getCurTime());
  };


  template.totalTime = function() {
    return showTime(boombox.getTotalTime());
  };


  template.curTrack = function() {
    if (! curPlayer) return 0;
    var curItem = Items.findOne(Session.get("current_player"));
    return Items.find({seqNo: {$lte: curItem.seqNo}}).count();
  };


  template.numTracks = function() {
    return Items.find({}).count();
  };


  template.shufflePic = function () {
    return boombox.isShuffle() ? "/Shuffle.png" : "/ShuffleDisabled.png";
  }


  template.loopPic = function () {
    return boombox.isLoop() ? "/Loop.png" : "/LoopDisabled.png";
  }


  template.playOrPause = function() {
    return boombox.isPlaying() ? "/Pause.png" : "/Play.png";
  };


  template.events({

    'click #minControls': function () {
      Session.set("controlsHidden", true)
    },


    'click #openControls': function () {
      Session.set("controlsHidden", false)
    },


    'click .shuffle' : function() {
      boombox.toggleShuffle();
    },


    'click .loop' : function() {
      boombox.toggleLoop();
    },


    'click #prev' : function() {        // maybe change later so it can restart song
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

      if (boombox.isPlaying()) {
        curPlayer.pause();
      } else {
        curPlayer.play();
      }
      boombox.togglePlaying();
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
      var volume = boombox.getVolume() - 10;
      if (volume < 0) volume = 0;
      setNewVolume(volume);
    },

    'click #volumeUp' : function() {
      var volume = boombox.getVolume() + 10;
      if (volume > 100) volume = 100;
      setNewVolume(volume);
    }

  });


})();

