///////////////////////////////////////////////////////////////////////////////
// SoundCloud Player object


(function() {

  var ScPlayer = function(id, streamID, pic, boombox) {

    this.id = id;
    this.pic = pic;
    this.scplayer = null;
    this.isReady = false;
    this.boombox = boombox;
    var self = this;

    $('#' + this.id).replaceWith('<div id="' + this.id + '"></div>');
    SC.oEmbed(streamID, {maxwidth: '232px', maxheight: '200px', show_comments: false}, function(oEmbed) {

      var embedHTML = (oEmbed.html).replace('<iframe', '<iframe id="' + id + '"');
      $("#" + id).replaceWith(embedHTML);

      self.scplayer = SC.Widget(id.toString());
      self.scplayer.bind (SC.Widget.Events.READY, function () {

        self.isReady = true;
        self.scplayer.setVolume(self.boombox.getVolume());
        if (self.id === self.boombox.curPlayerID()) {
          self.updateDuration();
          if (self.boombox.isPlaying()) {
            self.play();
          }
        }


        self.scplayer.bind(SC.Widget.Events.PLAY, function () {
          if (self.boombox.curPlayerID() !== self.id) {
            self.boombox.clickedPlayer(self.id);
          } 
          self.boombox.setPlaying(true, "fromPlayer");
        });


        self.scplayer.bind(SC.Widget.Events.PAUSE, function () {
          if (id === self.boombox.curPlayerID()) self.boombox.setPlaying(false, "fromPlayer");
        });


        self.scplayer.bind(SC.Widget.Events.FINISH, function () {
          if (id === self.boombox.curPlayerID()) self.boombox.next();
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
    var self = this;
    this.scplayer.getPosition(function (position) {
      self.boombox.setCurTime(Math.round(position / 1000), 'player');
    });
  };

  ScPlayer.prototype.updateDuration = function() {
    if (! this.isReady) return;
    var self = this;
    this.scplayer.getDuration(function (duration) {
      self.boombox.setTotalTime(Math.round(duration / 1000));
    });
  };



  PlaylistParty.createScPlayer = function(id, streamID, pic, boombox) {
    return new ScPlayer(id, streamID, pic, boombox);
  };

})();

  