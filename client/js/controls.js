///////////////////////////////////////////////////////////////////////////////
// Controls template

(function() {

  // Global variables used here:
  // - boombox
  // - Session.keys.controlsHidden
  
  var boombox = PlaylistParty.boombox;

  var template = Template.controls;

  var $timeslider, $volumeslider, $phoneVol;
  var tComp1, tComp2, vComp;


  //////////////////////////////////////////////////////////////////////////
  // volume and time controls


  var initialFlag = false;
  template.rendered = function() {
    // Initialization
    if (! initialFlag) {
      initiateControls();
    }
    initialFlag = true;
  };

  
  function initiateControls () {
    // Set the volume controls
    $phoneVol = $("#phoneVol");
    phoneVolTracking();

    $volumeslider = $('#volumeslider');
    initiateVolumeSlider();

    // Set the time slider control
    $timeslider = $('#timeslider');
    initiateTimeSlider();
  };

  function phoneVolTracking () {
    Deps.autorun(function () {
      $phoneVol.tooltip('destroy');
      $phoneVol.tooltip({
        title: (Math.round(boombox.getVolume()) ).toString(),
        delay: 250 //,
        // trigger: 'hover click'
      });
      $phoneVol.tooltip('show');
    });
  }

  function initiateVolumeSlider () {
    $volumeslider.slider({
      range: 'min',
      animate: true,
      'value': (Math.round(boombox.getVolume()) ).toString(),
      start: function() { 
        boombox.pauseUpdates = true;
        vComp.stop();
      },
      slide: function(event, ui) { 
        boombox.setVolume(ui.value) 
      },
      stop: function(event, ui) {  
        boombox.setVolume(ui.value);
        setTimeout(function () {
            boombox.pauseUpdates = false;
            startVolTracking();
        }, 1000);
      }
    });
    startVolTracking();
  }

  function startVolTracking () {
    vComp = Deps.autorun(function() {
      $volumeslider.slider('value', boombox.getVolume());
    });    
  }

  function initiateTimeSlider () {
    $timeslider.slider({
      range: 'min',
      max: 0, 
      animate: true,
      start: function() { 
        boombox.pauseUpdates = true;
        stopTimeTracking(); 
      },
      slide: function(event, ui) { 
        boombox.setCurTimeLabel(ui.value) 
      },
      stop: function(event, ui) {
        boombox.setCurTime(ui.value);
        setTimeout(function () {
            startTimeTracking();
            boombox.pauseUpdates = false;
        }, 1000);
      }
    });
    startTimeTracking();
  }

  function startTimeTracking () {
    tComp1 = Deps.autorun(function() {
      $timeslider.slider('value', boombox.getCurTimeLabel());
    });
    tComp2 = Deps.autorun(function() {
      $timeslider.slider('option', 'max', boombox.getTotalTime());
    });
  }

  function stopTimeTracking () {
    tComp1.stop();
    tComp2.stop();
  }


  //////////////////////////////////////////////////////////////////////////
  // template helpers


  template.isHidden = function() {
    return Session.get("controlsHidden") ? "hidden" : "";
  };


  template.showMinimize = function() {
    return Session.get("controlsHidden") ? "" : "hidden";
  };


  template.curTime = function() {
    return showTime(boombox.getCurTimeLabel());
  };


  template.totalTime = function() {
    return showTime(boombox.getTotalTime());
  };


  template.curTrack = function() {
    var curID = boombox.curPlayerID();
    if (! curID ) return 0;
    return (_.pluck(Playlist.findOne().items, 'id')).indexOf(curID) + 1;
  };


  template.numTracks = function() {
    var playlist = Playlist.find().fetch();
    return (playlist.length > 0) ? playlist[0].items.length : 0;
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


    'click #prev' : function() {
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

