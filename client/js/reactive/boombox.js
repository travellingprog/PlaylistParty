///////////////////////////////////////////////////////////////////////////////
// Boombox object, a reactive data source
//
// Note: Because the user can interact with the player outside of the controls
//       in the website, it is necessary to have a 'playing' variable, while
//       simultaneously having SEPARATE 'play' and 'pause' functionality.
//       This separation also allows the continuous play between media of
//       different sources.
//
// Global variable used here:
// - ReactiveData function


(function() {

  var Boombox = function () {

    var playing = false;
    var shuffle = false;
    var loop = false;
    var volume = 80;
    var curTime = 0;
    var totalTime = 0;
    var player = {};
    var curPlayer = false;
    var prevPlayer, nextPlayer;
    var livePlayers = [];
    this.pauseUpdates = false;
    var $timeslider, $volumeslider, $phoneVol;
    var that = this;


      //////////////////////////////////////////////////////////////////////////
      // playback settings


      this.isPlaying = function() {
        this.readingData(Meteor.deps.Context.current, 'playing');
        return playing;
      };

      // Needed when non-current player is started
      this.setPlaying = function(newState) {
        if (playing === newState) return;
        playing = newState;
        this.changedData('playing');
      };

      this.togglePlaying = function() {
        if (! curPlayer) return;

        if (playing) {
          curPlayer.pause();
        } else {
          curPlayer.play();
        }

        playing = ! playing;
        this.changedData('playing');
      };


      this.onShuffle = function() {
        this.readingData(Meteor.deps.Context.current, 'shuffle');
        return shuffle;
      };

      this.toggleShuffle = function() {
        shuffle = ! shuffle;
        this.changedData('shuffle');
      };


      this.onLoop = function() {
        this.readingData(Meteor.deps.Context.current, 'loop');
        return loop;
      };

      this.toggleLoop = function() {
        loop = ! loop;
        this.changedData('loop');
      };


      //////////////////////////////////////////////////////////////////////////
      // playlist navigation


      this.prev = function() {
        if (! curPlayer) return;
        this.setCurPlayer(prevPlayer);
        this.updateLivePlayers();
        scrollToCurPlayer();
      };


      this.next = function() {
        if (! curPlayer) return;
        this.setCurPlayer(nextPlayer);
        this.updateLivePlayers();
        scrollToCurPlayer();
      };



      //////////////////////////////////////////////////////////////////////////
      // curPlayer functions


      this.curPlayerID = function() {
        this.readingData(Meteor.deps.Context.current, 'curPlayer');
        if (! curPlayer) return false;
        return curPlayer._id;
      };

      this.setCurPlayer = function(item) {
        if ((curPlayer) && (curPlayer._id === item._id)) return;

        // if currently playing, pause until we switch the player
        var continuePlaying = playing;
        if (continuePlaying) curPlayer.pause();

        // set new curPlayer
        item.setVolume(volume);
        curPlayer = item;
        this.changedData('curPlayer');

        scrollToCurPlayer();
        curPlayer.updateDuration();

        if (continuePlaying) curPlayer.play();  // may not work on mobile devices
      };


      scrollToCurPlayer = function ()  { 
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curPlayer._id).parent().offset().top - firstPOffset;
        $('html, body').animate({scrollTop: newOffset}, 400);  
      };


      //////////////////////////////////////////////////////////////////////////
      // playlist functions 

      function createPlayer (item) {
        $('#' + item._id).replaceWith('<div id="' + item._id + '"></div>');

        if (item.type === 'YouTube') {
          return new YtPlayer(item._id, item.streamID, item.pic);
        } else if (item.type === 'SoundCloud') {
          return new ScPlayer(item._id, item.streamID, item.pic);
        }
      }

      function setPicture (item) {
        $('#' + item._id).replaceWith('<div id="' + item._id + '"></div>');
        $('#' + item._id).html('<a class="pic" href="/"><img src="' + item.pic +'" width="232px"></a>');
      }

      this.updateLivePlayers = function () {
        if (! curPlayer) {
          livePlayers = [];
          return;
        }

        var inLivePlayers;
        var i, l = livePlayers.length;

        var curItem = Items.findOne({"_id" : curPlayer._id});

        // set up nextPlayer
        var nextItem = Items.findOne({seqNo: {$gt: curItem.seqNo}}, 
                                     {sort: {seqNo: 1}});
        if (! nextItem) nextItem = Items.findOne({}, {sort: {seqNo: 1}});

        inLivePlayers = false;
        for (i = 0; i < l; i++) {
          if (livePlayers[i]._id === nextItem._id) {
            nextPlayer = livePlayers[i];
            inLivePlayers = true;
          }
        }

        if (! inLivePlayers) nextPlayer = createPlayer(nextItem);


        // set up prevPlayer
        var prevItem = Items.findOne({seqNo: {$lt: curItem.seqNo}}, 
                                     {sort: {seqNo: -1}});
        if (! prevItem) prevItem = Items.findOne({}, {sort: {seqNo: -1}});

        inLivePlayers = false;
        for (i = 0; i < l; i++) {
          if (livePlayers[i]._id === prevItem._id) {
            prevPlayer = livePlayers[i];
            inLivePlayers = true;
          }
        }        

        if (! inLivePlayers) prevPlayer = createPlayer(prevItem);

        
        // remove any live players that are no longer in the curPlayer zone
        var newLivePlayers = [prevPlayer, curPlayer, nextPlayer];
        var keep = false;

        for (i = 0; i < l; i++) {
          for (var j=0, m = newLivePlayers.length; j < m; j++) {
            if (livePlayers[i]._id === newLivePlayers[j]._id) {
              keep = true;
            }
          }
          if (! keep) setPicture(livePlayers[i]);
          keep = false;
        }        

        livePlayers = newLivePlayers;
      }


      this.itemAdded = function(newItem) {
        if (! curPlayer) {
          var newPlayer = createPlayer(newItem);
          this.setCurPlayer(newPlayer);
          livePlayers = [curPlayer];
        } else {
          setPicture(newItem);
        }

        // check that we're not waiting on other item containers to be rendered
        // before updating live players
        // (i.e. that this is the currently last item on the playlist)
        if (newItem._id === Items.findOne({}, {sort: {seqNo: -1}})._id) {
          this.updateLivePlayers();  
        }        
      };


      this.removeItem = function (item) {
        if (curPlayer._id === item._id) {
          if (Items.find({}).count() > 1) {
            var goToNext = true;
          } else {
            curPlayer.pause();
            curPlayer = false;
            this.setCurTime(0);
            this.setTotalTime(0);
            this.pauseUpdates = true;  
          }
        }

        Items.remove(item._id, function (error) {
          if (error !== undefined) alert(error);
        });

        if (goToNext) {
          boombox.next();
          return;
        }

        this.updateLivePlayers();
      };


      this.clickedPicture = function(item) {
        var newPlayer = createPlayer(item);
        this.setCurPlayer(newPlayer);
        this.setPlaying(true);
        this.updateLivePlayers();
      };


      //////////////////////////////////////////////////////////////////////////
      // control initialization and update

      this.initiateControls = function() {
        // Set the volume controls
        $phoneVol = $("#phoneVol");
        this.phoneVolTracking();

        $volumeslider = $('#volumeslider');
        initiateVolumeSlider();

        // Set the time slider control
        $timeslider = $('#timeslider');
        initiateTimeSlider();
        
        // Initiate live updates on curPlayer time & volume
        this.updatePlayerInfo();
      };


      this.updatePlayerInfo = function () {
        if (!that.pauseUpdates && curPlayer) {
          curPlayer.updateVolume();
          curPlayer.updateCurrentTime();
          curPlayer.updateDuration();
        }
        setTimeout(that.updatePlayerInfo, 500);
      };


      //////////////////////////////////////////////////////////////////////////
      // time slider  and time functions

      function initiateTimeSlider () {
        $timeslider.slider({
          range: "min",
          max: 0, 
          animate: true,
          start: function() { that.pauseUpdates = true; },
          slide: function(event, ui) { that.setCurTime(ui.value), 'sliding' },
          stop: function(event, ui) {
            that.setCurTime(ui.value, 'slider');
          }
        });
      }

      this.getCurTime = function() {
        this.readingData(Meteor.deps.Context.current, 'curTime');
        return curTime;
      };

      this.setCurTime = function(newTime, source) {
        if ((source === 'player') && (curTime === newTime)) return;

        if ((source === 'slider') && curPlayer) {
          curPlayer.setNewTime(newTime);
        }

        if (source === 'player') {
          $timeslider.slider('value', newTime);
        }

        curTime = newTime;
        this.changedData('curTime');

        if (source === 'slider') {
          setTimeout(function () {
            that.pauseUpdates = false;
          }, 2000);
        }
      };


      this.getTotalTime = function() {
        this.readingData(Meteor.deps.Context.current, 'totalTime');
        return totalTime;
      };

      this.setTotalTime = function(newTime) {
        if (totalTime === newTime) return;
        totalTime = newTime;
        this.changedData('totalTime');
        $timeslider.slider("option", "max", this.getTotalTime());
      };


      //////////////////////////////////////////////////////////////////////////
      // volume controls

      function initiateVolumeSlider () {
        $volumeslider.slider({
          range: 'min',
          animate: true,
          'value': '80',
          start: function() { that.pauseUpdates = true },
          slide: function(event, ui) { that.setVolume(ui.value, 'sliding') },
          stop: function(event, ui) {  that.setVolume(ui.value, 'slider') }
        });
      }


      this.getVolume = function() {
        this.readingData(Meteor.deps.Context.current, 'volume');
        return volume;
      };


      this.phoneVolTracking = function () {
        Meteor.autorun(function () {
          $phoneVol.tooltip('destroy');
          $phoneVol.tooltip({
            title: (Math.round( that.getVolume() )).toString(),
            delay: 250 //,
            // trigger: 'hover click'
          });
          $phoneVol.tooltip('show');
        });
      };


      this.setVolume = function(newVolume, source) {
        if ((source === 'player') && (volume === newVolume)) return;

        if (source !== 'player') {
          this.pauseUpdates = true;
          if (curPlayer) curPlayer.setVolume(newVolume);
        }

        if (source !== 'slider') {
          $volumeslider.slider('value', newVolume);
        }

        volume = newVolume;
        this.changedData('volume');

        if ((source !== 'player') && (source !== 'sliding')) {
          setTimeout(function () {
            that.pauseUpdates = false;
            that.phoneVolTracking();   // some bug requires this
          }, 1000);   
        }
      };

  };


  Boombox.prototype = new ReactiveData();


  Boombox.prototype.constructor = Boombox;


  boombox = new Boombox();


  ///////////////////////////////////////////////////////////////////////////////
  // YouTube Player object


  var YtPlayer = function(id, streamID, pic) {

    this._id = id;
    this.pic = pic;
    this.isReady = false;
    var that = this;


    this.ytplayer = new YT.Player(id, {
      height: '200',
      width: '232',
      videoId: streamID,
      events: {
        'onReady': function () { YtPlayer.onPlayerReady.call(that) },
        'onStateChange': function (e) {
          YtPlayer.onPlayerStateChange.call(that, e);
        }
      }
    });
  };


  YtPlayer.prototype.play = function () {
    if (this.isReady) {
      this.ytplayer.playVideo();  
    }
  };
   

  YtPlayer.prototype.pause = function () {
    if (this.isReady) {
      this.ytplayer.pauseVideo();  
    }
  };


  YtPlayer.prototype.setVolume = function (newVolume) {
    if (this.isReady) {
      this.ytplayer.setVolume(newVolume);  
    }
  };


  YtPlayer.prototype.updateVolume = function () {
    if (this.isReady) {
      var newVolume = this.ytplayer.getVolume();
      if (newVolume != boombox.getVolume()) {
        boombox.setVolume(newVolume, 'player');
      }
    }
  };


  YtPlayer.prototype.setNewTime = function (newTime) {
    if (this.isReady) {
      this.ytplayer.seekTo(newTime, true);
    }
  };


  YtPlayer.prototype.updateCurrentTime = function() {
    if (this.isReady) {
      boombox.setCurTime( 
        Math.ceil(this.ytplayer.getCurrentTime()), 'player' );
    }
  };


  YtPlayer.prototype.updateDuration = function() {
    if (this.isReady) {
      boombox.setTotalTime( Math.floor(this.ytplayer.getDuration()) );  
    }
  };


  YtPlayer.onPlayerReady = function(event) {
    this.isReady = true;
    this.setVolume(boombox.getVolume());
    if ((this._id === boombox.curPlayerID()) && boombox.isPlaying()) {
      this.play();
    }
  };


  YtPlayer.onPlayerStateChange = function(event) {

    var newState = event.data;
    var state = YT.PlayerState;

    if (newState === state.PLAYING) {
      boombox.setCurPlayer(this);
      boombox.setPlaying(true);
      boombox.updateLivePlayers();
      return;
    }

    if (boombox.curPlayerID() !== this._id) return;

    if (newState === state.PAUSED) {
      boombox.setPlaying(false);
    }

    if (newState === state.ENDED) {
      // because Pause state is called right before Ended...
      boombox.setPlaying(true);
      // ... then ...
      boombox.next();
    }
  };


  ///////////////////////////////////////////////////////////////////////////////
  // SoundCloud Player object

  var ScPlayer = function(id, streamID, pic) {

    this._id = id;
    this.pic = pic;
    this.scplayer = null;
    this.isReady = false;
    var that = this;

    SC.oEmbed(streamID, {maxwidth: '232px', maxheight: '200px'}, function(oEmbed) {

      var embedHTML = (oEmbed.html).replace('<iframe', '<iframe id="' + id + '"');
      $("#" + id).replaceWith(embedHTML);

      that.scplayer = SC.Widget(id.toString());
      that.scplayer.bind (SC.Widget.Events.READY, function () {

        that.isReady = true;
        that.scplayer.setVolume(boombox.getVolume());
        if ((this._id === boombox.curPlayerID()) && boombox.isPlaying()) {
          this.play();
        }

        that.scplayer.bind(SC.Widget.Events.PLAY, function () {
          boombox.setCurPlayer(that);
          boombox.setPlaying(true);
          boombox.updateLivePlayers();
        });

        that.scplayer.bind(SC.Widget.Events.PAUSE, function () {
          if (id === boombox.curPlayerID()) boombox.setPlaying(false);
        });

        that.scplayer.bind(SC.Widget.Events.FINISH, function () {
          if (id === boombox.curPlayerID()) boombox.next();
        });
      });

    });
  }


  ScPlayer.prototype.play = function () {
    if (this.isReady) this.scplayer.play();
  };

  ScPlayer.prototype.pause = function () {
    if (this.isReady) this.scplayer.pause();
  };

  ScPlayer.prototype.setVolume = function (newVolume) {
    if (this.isReady) this.scplayer.setVolume(newVolume);
  };

  ScPlayer.prototype.updateVolume = function () {
    // NOTE: The SoundCloud widget does not offer any volume control... yet
    return;
  };

  ScPlayer.prototype.setNewTime = function (newTime) {
    this.scplayer.seekTo(newTime * 1000);
  };

  ScPlayer.prototype.updateCurrentTime = function() {
    if (! this.isReady) return;
    this.scplayer.getPosition(function (position) {
      boombox.setCurTime(Math.round(position / 1000), 'player');
    });
  };

  ScPlayer.prototype.updateDuration = function() {
    if (! this.isReady) return;
    this.scplayer.getDuration(function (duration) {
      boombox.setTotalTime(Math.round(duration / 1000));
    });
  };

})();