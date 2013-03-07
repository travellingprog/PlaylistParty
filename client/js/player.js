///////////////////////////////////////////////////////////////////////////////
// Player 
//
// Global variabled defined here:
// - curPlayer
// - player array
// - createPlayer function
// - goToNextPlayer function
// - setCurPlayer function
//
// Global variables used:
// - Session.keys.current_player    <- because curPlayer is not reactive
// - Items collection


(function() {


  ///////////////////////////////////////////////////////////////////////////////
  // Player Object

  player = {};

  var Player = function(embedPlayer, userID, id) {

    this.id = id;

    this.addedBy = function(user){
      return (user === userID);
    };

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
    };

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


  ///////////////////////////////////////////////////////////////////////////////
  // curPlayer Object


  curPlayer = null;

  setCurPlayer = function(curPlayerID) {
    
    // if currently playing, pause until we switch the player
    var continuePlaying = boombox.isPlaying();
    if (continuePlaying) curPlayer.pause();

    // set new curPlayer
    player[curPlayerID].setVolume(boombox.getVolume());
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


  goToNextPlayer = function () {
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
// player template


  var template = Template.player;

  template.rendered = function() {
    if (! player[this.data._id]) createPlayer(this.data);
  };

  template.isCurrent = function () {
    return Session.equals('current_player', this._id) ? 'current' : '';
  };

  template.trackNo = function() {
    return Items.find({seqNo: {$lte: this.seqNo}}).count();
  };

  template.myItem = function () {
    return (this.addedBy === 'user1');
  };

  template.events({
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

      Items.remove(thisID, function (error) {
        if (error !== undefined) alert(error);
      });
    }
  });


})();