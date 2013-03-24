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
    var frames;
    var curFrame;
    var timeoutID;
    var scroll;
    var self = this;

    initialize();


    function initialize () {
      curPlayer = null;
      nextPlayer = null;
      prevPlayer = null;
      livePlayers = [];
      shuffle = false;
      shuffleSequence = [];
      frames = [];
      curFrame = null;
      timeoutID = null;
      scroll = true;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Follow the addition and removal of frames
    
    this.remove = function(id) {
      if (frames.indexOf(id) < 0) return;

      // if we are removing the curPlayer, be ready to go to the next frame.
      if (curFrame === id) {
        boombox.setCurPlayer('curPlayerRemoved');  
        var nextFrame = getNextFrame();
      }

      // remove this from our list of frames
      frames = _.without(frames, id);

      // check if we have any frames left, act accordingly
      if (frames.length > 0) 
      {
        if (shuffle) removeFromShuffle(id);
        removeFromLivePlayers(id);
        if (nextFrame) {
          self.setCurFrame(nextFrame);
        }
        else {
          scroll = false;
          self.setNextPlayer();    
        }          
         
      }
      else 
      {
        if (timeoutID) clearTimeout(timeoutID);
        initialize();
        boombox.setCurPlayer('none');
      }        
    };


    this.add = function(id) {
      scroll = false;
      frames.push(id);
      if (shuffle) addToShuffle(id);
      if (! curFrame) {
        this.setCurFrame(id);
      } else {
        this.setNextPlayer();
      }
    };


    ////////////////////////////////////////////////////////////////////////////
    // the "set new current player" process
    //
    // It has been split into various functions, with timeouts in between,
    // to make it possible to halt the process if the player quickly
    // moves to another player (e.g. by quickly pressing the Next/Prev buttons)


    // Sets the current frame, which will get blue highlight and be scrolled to.
    this.setCurFrame = function (id) {
      curFrame = id;
      boombox.setCurFrameID(curFrame);

      // cancel any current execution of this process
      if (timeoutID) clearTimeout(timeoutID);

      // scroll to current frame
      if (activeTab === '#tracks') {
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curFrame).parent().offset().top - firstPOffset;
        $('html, body').animate({scrollTop: newOffset}, 400);
      }

      timeoutID = setTimeout( function() {
        self.setCurPlayer();
      }, 1000);
    };


    // Creates the media player for the current frame
    this.setCurPlayer = function () {
      curPlayer = createPlayer(curFrame);
      curPlayer.setVolume(boombox.getVolume());
      boombox.setCurPlayer(curPlayer);
      timeoutID = setTimeout( function() {
        self.setNextPlayer();
      }, 250); 
    };


    // Creates the media player for the track that plays next
    this.setNextPlayer = function () {
      nextPlayer = createPlayer(getNextFrame());
      timeoutID = setTimeout( function() {
        self.setPrevPlayer();
      }, 250);  
    };


    // Creates the media player for the previous track
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
    };


    // Scrolls to the current media item, because rendering the 
    // adjacent players may have shifted things around.
    this.scrollToCurPlayer = function() {
      if (! curPlayer) return;

      // make sure the adjacent players are rendered before 
      // scrolling to the current player
      if (prevPlayer.isReady && nextPlayer.isReady) 
      {
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curPlayer.id).parent().offset().top - firstPOffset;
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


    // replace any live player we don't need with a picture
    this.setPictures = function() {
      if (! curPlayer) return;

      var keep;
      for (var i = livePlayers.length - 1; i >= 0; i--) {
        keep = false;
        if (livePlayers[i].id === curPlayer.id) keep = true;
        if (livePlayers[i].id === nextPlayer.id) keep = true;
        if (livePlayers[i].id === prevPlayer.id) keep = true;
        
        if (! keep) {
          setToPicture (livePlayers[i]);
          livePlayers.splice(i, 1);
        }
      }
    };


    ////////////////////////////////////////////////////////////////////////////
    // These functions set the frames with either a player or a picture, and 
    // livePlayers is an array with the all currently existing players.


    function createPlayer (id) {
      if (! id) return null;

      // check that we haven't already built this player
      if ($('#' + id + ' img').length) 
      {
        var info = _.find(PlaylistParty.items(), function(item) {
          return item.id === id;
        });

        var newPlayer;
        if (info.type === 'YouTube') {
          newPlayer = createYtPlayer(info.id, info.streamID, info.pic, boombox);
        } else if (info.type === 'SoundCloud') {
          newPlayer = createScPlayer(info.id, info.streamID, info.pic, boombox);
        }
        livePlayers.push(newPlayer);
        return newPlayer;
      }
      else 
      {
        return _.find(livePlayers, function(player) {
          return id === player.id;
        });
      }
    }
    

    function setToPicture(player) {
      // don't load pic if it's already there
      if ($('#' + player.id + ' img').length) return;

      $('#' + player.id).replaceWith('<div id="' + player.id + '"></div>');
      $('#' + player.id).html('<a class="pic" href="/"><img src="' + 
                                   player.pic +'" width="232px"></a>');
    }


    function removeFromLivePlayers (id) {
      for (var i = livePlayers.length - 1; i >= 0; i--) {
        if (livePlayers[i].id === id) {
          livePlayers.splice(i, 1);
          break;
        }
      }
    }


    ////////////////////////////////////////////////////////////////////////////
    // Navigation functions


    this.next = function() {
      this.setCurFrame(getNextFrame());
    };


    this.prev = function() {
      this.setCurFrame(getPrevFrame());
    };


    function getNextFrame() {
      if (! curFrame) return null;

      if (!shuffle) {
        var i = frames.indexOf(curFrame) + 1;
        if (i === frames.length) i = 0;
        var nextFrame = frames[i];
      }
      else {
        i = shuffleSequence.indexOf(curFrame) + 1;
        if (i === shuffleSequence.length) i = 0;
        nextFrame = shuffleSequence[i];
      }
      return nextFrame;
    }


    function getPrevFrame() {
      if (! curFrame) return null;

      if (!shuffle) {
        var i = frames.indexOf(curFrame) - 1;
        if (i === -1) i = frames.length - 1;
        var prevFrame = frames[i];
      }
      else {
        i = shuffleSequence.indexOf(curFrame) - 1;
        if (i === -1) i = shuffleSequence.length - 1;
        prevFrame = shuffleSequence[i];
      }
      return prevFrame;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Shuffle functions    


    this.setShuffle = function(s) {
      shuffle = s;
      
      if (shuffle) {
        // create shuffle sequence
        shuffleSequence = _.shuffle(frames);
      }

      // update live players
      if (frames.length > 0) {
        this.setNextPlayer();  
      }      
    };


    function addToShuffle (id) {
      var randNo = Math.floor(Math.random() * (shuffleSequence.length -1));
      shuffleSequence.splice(randNo, 0, id);
    }


    function removeFromShuffle (id) {
      shuffleSequence = _.without(shuffleSequence, id);
    }

  };


  PlaylistParty.createListManager = function(boombox) {
    return new ListManager(boombox);
  };


})();

