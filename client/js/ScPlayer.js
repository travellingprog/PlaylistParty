///////////////////////////////////////////////////////////////////////////////
// SoundCloud Player object


var ScPlayer = function(id, streamID) {

  var scplayer;
  var isReady = false;
  var oldVolume = 50;

  SC.oEmbed(streamID, {maxwidth: "232px", maxheight: "200px"}, function(oEmbed) {
    var embedHTML = (oEmbed.html).replace('<iframe', '<iframe id="' + id + '"');
    $("#" + id).replaceWith(embedHTML);

    scplayer = SC.Widget(id.toString());
    scplayer.bind (SC.Widget.Events.READY, function () {
      isReady = true;
      scplayer.setVolume(Session.get("volume"));

      scplayer.bind(SC.Widget.Events.PLAY, function () {
        if (curPlayer !== player[id]) setCurPlayer(id);
        Session.set("playing", true); 
      });

      scplayer.bind(SC.Widget.Events.PAUSE, function () {
        if (curPlayer === player[id]) Session.set("playing", false);
      });

      scplayer.bind(SC.Widget.Events.FINISH, function () {
        if (curPlayer === player[id]) goToNextPlayer();
      });
    });
  });


  this.play = function () {
    if (isReady) scplayer.play();
  }
  
  this.pause = function () {
    if (isReady) scplayer.pause();
  }
  
  this.setVolume = function (newVolume) {
    if (isReady) scplayer.setVolume(newVolume);
  }

  this.updateVolume = function () {
    // NOTE: The SoundCloud widget does not offer any volume control... yet
    return;
  }
  
  this.setNewTime = function (newTime) {
    scplayer.seekTo(newTime * 1000);
  }

  this.updateCurrentTime = function() {
    if (! isReady) return;
    scplayer.getPosition(function (position) {
      Session.set("curTime", Math.round(position / 1000));
    });
  }

  this.updateDuration = function() {
    if (! isReady) return;
    scplayer.getDuration(function (duration) {
      Session.set("totalTime", Math.round(duration / 1000));
    });
  }
}


    // if (! isReady) return;
    // scplayer.getVolume(function (volume) {
    //   Session.set("volume", volume);
    // });