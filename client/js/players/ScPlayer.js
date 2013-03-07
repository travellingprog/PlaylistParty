///////////////////////////////////////////////////////////////////////////////
// SoundCloud Player object
//
// Global variables defined here:
// - ScPlayer object
//
// Global variables used:
// - curPlayer
// - setCurPlayer function
// - boombox


var ScPlayer = function(id, streamID) {

  this.scplayer = null;
  this.isReady = false;
  var that = this;

  SC.oEmbed(streamID, {maxwidth: "232px", maxheight: "200px"}, function(oEmbed) {

    var embedHTML = (oEmbed.html).replace('<iframe', '<iframe id="' + id + '"');
    $("#" + id).replaceWith(embedHTML);

    that.scplayer = SC.Widget(id.toString());
    that.scplayer.bind (SC.Widget.Events.READY, function () {

      that.isReady = true;
      that.scplayer.setVolume(boombox.getVolume());

      that.scplayer.bind(SC.Widget.Events.PLAY, function () {
        if (curPlayer !== player[id]) setCurPlayer(id);
        boombox.setPlaying(true);
      });

      that.scplayer.bind(SC.Widget.Events.PAUSE, function () {
        if (curPlayer === player[id]) boombox.setPlaying(false);
      });

      that.scplayer.bind(SC.Widget.Events.FINISH, function () {
        if (curPlayer === player[id]) goToNextPlayer();
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
    boombox.setCurTime(Math.round(position / 1000));
  });
};

ScPlayer.prototype.updateDuration = function() {
  if (! this.isReady) return;
  this.scplayer.getDuration(function (duration) {
    boombox.setTotalTime(Math.round(duration / 1000));
  });
};