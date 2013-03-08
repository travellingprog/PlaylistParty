///////////////////////////////////////////////////////////////////////////////
// Controls template

(function() {

  // Global variables used here:
  // - boombox
  // - Session.keys.controlsHidden
  // - Items collection
  

  var template = Template.controls;
  var initialFlag = false;

  template.rendered = function() {
    // Initialization
    if (! initialFlag) boombox.initiateControls();
    initialFlag = true;
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
    if (! boombox.curPlayerID() ) return 0;
    var curItem = Items.findOne(boombox.curPlayerID());
    return Items.find({seqNo: {$lte: curItem.seqNo}}).count();
  };


  template.numTracks = function() {
    return Items.find({}).count();
  };


  template.shufflePic = function () {
    return boombox.onShuffle() ? "/Shuffle.png" : "/ShuffleDisabled.png";
  }


  template.loopPic = function () {
    return boombox.onLoop() ? "/Loop.png" : "/LoopDisabled.png";
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
      boombox.prev();
    },


    'click #play' : function () {
      boombox.togglePlaying();
    },


    'click #next' : function() {
      boombox.next();
    },


    'click #minVolume' : function () {
      boombox.setVolume(0);
    },

    'click #maxVolume' : function () {
      boombox.setVolume(100);
    },

    'click #volumeDown' : function() {
      var volume = boombox.getVolume() - 10;
      if (volume < 0) volume = 0;
      boombox.setVolume(volume);
    },

    'click #volumeUp' : function() {
      var volume = boombox.getVolume() + 10;
      if (volume > 100) volume = 100;
      boombox.setVolume(volume);
    }

  });


})();

