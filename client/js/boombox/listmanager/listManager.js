////////////////////////////////////////////////////////////////////////////////
// listManager handles playlist duties.
// This includes setting curPlayer and the adjacent media players.


(function() {

  var activeTab = PlaylistParty.activeTab;
  var createYtPlayer = PlaylistParty.createYtPlayer;
  var createScPlayer = PlaylistParty.createScPlayer;



  var ListManager = function(boombox) {

    var curPlayer, prevPlayer, nextPlayer, livePlayers;
    var shuffle, shuffleSequence;
    var frames = new Meteor.Collection(null);
    var curFrame;
    var timeoutID;
    var scroll;
    var self = this;

    initialize();


    function initialize () {
      curPlayer = null;
      livePlayers = [];
      shuffle = false;
      shuffleSequence = [];
      curFrame = null;
      timeoutID = null;
      scroll = true;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Follow the addition and removal of frames


    Items.find().observeChanges({
      removed: function(id) {
        frames.remove(id);
        if (frames.find().count() > 0) 
        {
          if (shuffle) removeFromShuffle(id);
          removeFromLivePlayers(id);
          if (curPlayer._id === id) {
            boombox.setCurPlayer('curPlayerRemoved');  
            self.next()
          }
          else {
            scroll = false;
            self.setNextPlayer();    
          }          
           
        }
        else 
        {
          initialize();
          boombox.setCurPlayer('none');
        }        
      }
    });


    this.add = function(item) {
      scroll = false;
      frames.insert(item);
      if (shuffle) addToShuffle(item._id);
      if (! curFrame) {
        this.setCurFrame(item);
      } else {
        this.setNextPlayer();
      }
    };


    ////////////////////////////////////////////////////////////////////////////
    // the "set new current player" process
    //
    // It has been split into various functions, with timeouts in between,
    // to make it possible to cancel halt the process if the player quickly
    // moves to another player (e.g. by quickly pressing the Next/Prev buttons)


    this.setCurFrame = function (item) {
      curFrame = item;
      boombox.setCurFrame(curFrame);

      // cancel any current execution of this process
      if (timeoutID) clearTimeout(timeoutID);

      // scroll to current frame
      if (activeTab === '#tracks') {
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curFrame._id).parent().offset().top - firstPOffset;
        $('html, body').animate({scrollTop: newOffset}, 400);
      }

      timeoutID = setTimeout( function() {
        self.setCurPlayer();
      }, 1000);
    }


    this.setCurPlayer = function () {
      curPlayer = createPlayer(curFrame);
      curPlayer.setVolume(boombox.getVolume());
      boombox.setCurPlayer(curPlayer);
      timeoutID = setTimeout( function() {
        self.setNextPlayer();
      }, 250); 
    }


    this.setNextPlayer = function () {
      nextPlayer = createPlayer(getNextFrame());
      timeoutID = setTimeout( function() {
        self.setPrevPlayer();
      }, 250);  
    }


    this.setPrevPlayer = function () {
      prevPlayer = createPlayer(getPrevFrame());
      if (scroll && (activeTab === '#tracks'))
      {
        timeoutID = setTimeout( function() {
          self.scrollToCurPlayer();
        }, 250);  
      }
      else
      {
        scroll = true;
        timeoutID = setTimeout( function() {
          self.setPictures();
        }, 5000);
      }
      
    }


    this.scrollToCurPlayer = function() {
      // make sure the adjacent players are rendered before 
      // scrolling to the current player
      if (prevPlayer.isReady && nextPlayer.isReady) 
      {
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curPlayer._id).parent().offset().top - firstPOffset;
        $('html, body').animate({scrollTop: newOffset}, 400);
        timeoutID = setTimeout( function() {
          self.setPictures();
        }, 5000);
      }
      else 
      {
        timeoutID = setTimeout( function() {
          self.scrollToCurPlayer();
        }, 250);
      }
    };


    this.setPictures = function() {
      // any live player we don't need, replace it with a picture
      var keep;
      for (var i = livePlayers.length - 1; i >= 0; i--) {
        keep = false;
        if (livePlayers[i]._id === curPlayer._id) keep = true;
        if (livePlayers[i]._id === nextPlayer._id) keep = true;
        if (livePlayers[i]._id === prevPlayer._id) keep = true;
        
        if (! keep) {
          setToPicture (livePlayers[i]);
          livePlayers.splice(i, 1);
        }
      }
    };


    ////////////////////////////////////////////////////////////////////////////
    // These functions set the frames with either a player or a picture, and 
    // livePlayers is an array with the all currently existing players.


    function createPlayer (frame) {
      // check self we haven't already built this player
      if ($('#' + frame._id + ' img').length) 
      {
        var newPlayer;
        if (frame.type === 'YouTube') {
          newPlayer = createYtPlayer(frame._id, frame.streamID, frame.pic, boombox);
        } else if (frame.type === 'SoundCloud') {
          newPlayer = createScPlayer(frame._id, frame.streamID, frame.pic, boombox);
        }
        livePlayers.push(newPlayer);
        return newPlayer;
      }
      else 
      {
        for (var i = 0, l = livePlayers.length; i < l; i++) {
          if ((frame._id) === livePlayers[i]._id) {
            return livePlayers[i];
          }
        }
      }
    }
    

    function setToPicture(player) {
      // don't load pic if it's already there
      if ($('#' + player._id + ' img').length) return;

      $('#' + player._id).replaceWith('<div id="' + player._id + '"></div>');
      $('#' + player._id).html('<a class="pic" href="/"><img src="' + 
                                   player.pic +'" width="232px"></a>');
    }


    function removeFromLivePlayers (id) {
      for (var i = livePlayers.length - 1; i >= 0; i--) {
        if (livePlayers[i]._id === id) {
          livePlayers.splice(i, 1);
          break;
        }
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    // The current frame and player at this time
    // NOTE: a Deps.autorun within boombox did not seem to detect 
    // these dependencies



    // this.currentFrame = function() {
    //   Deps.Dependency(curFrameDeps);
    //   return curFrame;
    // };


    // this.currentPlayer = function() {
    //   Deps.Dependency(curPlayerDeps);
    //   return curPlayer;
    // };


    ////////////////////////////////////////////////////////////////////////////
    // Navigation functions


    this.next = function() {
      this.setCurFrame(getNextFrame());
    };


    this.prev = function() {
      this.setCurFrame(getPrevFrame());
    };


    function getNextFrame() {
      if (!shuffle) {
        var nextFrame = frames.findOne({seqNo: {$gt: curFrame.seqNo}}, 
                                     {sort: {seqNo: 1}});
        if (! nextFrame) nextFrame = frames.findOne({}, {sort: {seqNo: 1}}); 
      }
      else {
        var i = shuffleSequence.indexOf(curFrame._id) + 1;
        if (i === shuffleSequence.length) i = 0;
        nextFrame = frames.findOne({_id: shuffleSequence[i]});
      }
      return nextFrame;
    }


    function getPrevFrame() {
      if (!shuffle) {
        var prevFrame = frames.findOne({seqNo: {$lt: curFrame.seqNo}}, 
                                       {sort: {seqNo: -1}});
        if (! prevFrame) prevFrame = frames.findOne({}, {sort: {seqNo: -1}})
      }
      else {
        var i = shuffleSequence.indexOf(curFrame._id) - 1;
        if (i === -1) i = shuffleSequence.length - 1;
        prevFrame = frames.findOne({_id: shuffleSequence[i]});
      }
      return prevFrame;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Shuffle functions    


    this.setShuffle = function(s) {
      shuffle = s;
      shuffleSequence = [];
      
      if (shuffle) {
        // create shuffle sequence
        var framesArray = frames.find().fetch();
        var randNo, randFrame;

        for (i = framesArray.length - 1; i >= 0; i--) {
          randNo = Math.floor(Math.random() * i);
          randFrame = (framesArray.splice(randNo, 1))[0];
          shuffleSequence.push(randFrame._id);
        }
      }
      // update live players
      if (frames.find().count() > 0) {
        this.setNextPlayer();  
      }      
    };


    function addToShuffle (id) {
      var randNo = Math.floor(Math.random() * (shuffleSequence.length -1));
      shuffleSequence.splice(randNo, 0, id);
    }


    function removeFromShuffle (id) {
      shuffleSequence.splice(shuffleSequence.indexOf(id), 1);
    }

  };


  PlaylistParty.createListManager = function(boombox) {
    return new ListManager(boombox);
  };


})();

