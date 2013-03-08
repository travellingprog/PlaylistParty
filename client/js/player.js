///////////////////////////////////////////////////////////////////////////////
// Player 
//
// Global variables used:
// - boombox
// - Items collection


(function() {


  ///////////////////////////////////////////////////////////////////////////////
  // YouTube Player object


  var YtPlayer = function(id, streamID, addedBy) {

    this.id = id;
    this.addedBy = addedBy;
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
    this.ytplayer.playVideo();
  };
   

  YtPlayer.prototype.pause = function () {
    this.ytplayer.pauseVideo();
  };


  YtPlayer.prototype.setVolume = function (newVolume) {
    if (this.ytplayer.setVolume) {
      this.ytplayer.setVolume(newVolume);  
    }
  };


  YtPlayer.prototype.updateVolume = function () {
    if (this.ytplayer.getVolume) {
      var newVolume = this.ytplayer.getVolume();
      if (newVolume != boombox.getVolume()) {
        boombox.setVolume(newVolume, 'player');
      }
    }
  };


  YtPlayer.prototype.setNewTime = function (newTime) {
    this.ytplayer.seekTo(newTime, true);
  };


  YtPlayer.prototype.updateCurrentTime = function() {
    if (this.ytplayer.getCurrentTime) {
      boombox.setCurTime( 
        Math.ceil(this.ytplayer.getCurrentTime()), 'player' );
    }
  };


  YtPlayer.prototype.updateDuration = function() {
    if (this.ytplayer.getDuration) {
      boombox.setTotalTime( Math.floor(this.ytplayer.getDuration()) );  
    }
  };


  YtPlayer.onPlayerReady = function(event) {
    this.setVolume(boombox.getVolume());
  };


  YtPlayer.onPlayerStateChange = function(event) {

    var newState = event.data;
    var state = YT.PlayerState;

    if (newState === state.PLAYING) {
      boombox.setCurPlayer(this.id);
      boombox.setPlaying(true);
      return;
    }

    if (boombox.curPlayerID() !== this.id) return;

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

  var ScPlayer = function(id, streamID, addedBy) {

    this.id = id;
    this.addedBy = addedBy;
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

        that.scplayer.bind(SC.Widget.Events.PLAY, function () {
          boombox.setCurPlayer(id);
          boombox.setPlaying(true);
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


///////////////////////////////////////////////////////////////////////////////
// player template functions

  var createPlayer = function(item) {
    if (item.type === 'YouTube') {
      boombox.addPlayer(new YtPlayer(item._id, item.streamID, item.addedBy));
    } else if (item.type === 'SoundCloud') {
      boombox.addPlayer(new ScPlayer(item._id, item.streamID, item.addedBy))
    }
  };


  var template = Template.player;

  template.rendered = function() {
    if (! boombox.hasPlayer(this.data._id)) createPlayer(this.data);
  };

  template.isCurrent = function () {
    return (this._id === boombox.curPlayerID()) ? 'current' : '';
  };

  template.trackNo = function() {
    return Items.find({seqNo: {$lte: this.seqNo}}).count();
  };

  template.myItem = function () {
    return (this.addedBy === 'user1');
  };

  template.events({
    'click button.remItem' : function () {
      boombox.removePlayer(this._id);
    }
  });


})();