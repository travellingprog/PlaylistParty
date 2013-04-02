///////////////////////////////////////////////////////////////////////////////
// YouTube Player object


(function() {


  var YtPlayer = function(id, streamID, pic, boombox) {

    this.id = id;
    this.pic = pic;
    this.streamID = streamID;
    this.isReady = false;
    this.boombox = boombox;
    var that = this;
    

    $('#' + this.id).replaceWith('<div id="' + this.id + '"></div>');
    this.ytplayer = new YT.Player(id, {
      height: '200',
      width: '232',
      videoId: streamID,
      playerVars: {
        iv_load_policy: 3,
        rel: 0
      },
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
      if (newVolume != this.boombox.getVolume()) {
        this.boombox.setVolume(newVolume, 'player');
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
      this.boombox.setCurTime( 
        Math.ceil(this.ytplayer.getCurrentTime()), 'player' );
    }
  };


  YtPlayer.prototype.updateDuration = function() {
    if (this.isReady) {
      this.boombox.setTotalTime( Math.floor(this.ytplayer.getDuration()) );  
    }
  };


  YtPlayer.onPlayerReady = function(event) {
    this.isReady = true;
    this.ytplayer.setPlaybackQuality('medium');
    this.setVolume(this.boombox.getVolume());
    if (this.id === this.boombox.curPlayerID()) {
      this.updateDuration();
      if (this.boombox.isPlaying()) {
        this.play();
      }      
    }
  };


  YtPlayer.onPlayerStateChange = function(event) {

    var newState = event.data;
    var state = YT.PlayerState;

    if (newState === state.PLAYING) {
      if (this.boombox.curPlayerID() !== this.id) {
        this.boombox.clickedPlayer(this.id);
      }
      this.boombox.setPlaying(true, "fromPlayer");
      this.updateDuration();
      return;
    }

    if (this.boombox.curPlayerID() !== this.id) return;

    if (newState === state.PAUSED) {
      this.boombox.setPlaying(false, "fromPlayer");
    }

    if (newState === state.ENDED) {
      // because Pause state is called right before Ended...
      this.boombox.setPlaying(true, "fromPlayer");
      // ... then ...
      this.boombox.next();
    }
  };


  PlaylistParty.createYtPlayer = function(id, streamID, pic, boombox) {
    return new YtPlayer(id, streamID, pic, boombox);
  };


})();