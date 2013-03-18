////////////////////////////////////////////////////////////////////////////////
// Boombox is the controller for the controlbox. 
// It has many reactive properties.


(function() {


  var Boombox = function () {

    var playing, shuffle, loop;
    var curTime, curTimeLabel, totalTime;
    var volume;
    var curFrame, curPlayer, oldCurPlayer;
    this.pauseUpdates = false;
    var reset;
    var listManager = PlaylistParty.createListManager(this);
    var BoomboxDeps = {};
    var that = this;
    
    initiate();
    startDependencies();


      function initiate () {
        playing = false;
        shuffle = false;
        loop = false;
        curTime = 0;
        curTimeLabel = 0;
        totalTime = 0;
        volume = 80;
        curFrame = null;
        curPlayer = null;
        reset = true;
        this.pauseUpdates = false;
      }

      function startDependencies () {
        var deps = ['playing', 'shuffle', 'loop', 'curTimeLabel', 'totalTime', 
                    'volume', 'curFrame', 'curPlayer'];
        for (var i = 0, l = deps.length; i < l; i ++) {
          BoomboxDeps[deps[i]] = new Deps.Dependency;
        }
      }

      this.updatePlayerInfo = function () {
        if (curPlayer && (! this.pauseUpdates)) {
          curPlayer.updateVolume();
          curPlayer.updateCurrentTime();
        }
        setTimeout(that.updatePlayerInfo, 500);
      };
      this.updatePlayerInfo();

      //////////////////////////////////////////////////////////////////////////
      // playback settings


      this.isPlaying = function() {
        Deps.depend(BoomboxDeps['playing']);
        return playing;
      };

      this.togglePlaying = function() {
        playing = ! playing;
        playing ? curPlayer.play() : curPlayer.pause();
        BoomboxDeps['playing'].changed();
      };

      this.setPlaying = function(newState, fromPlayer) {
        if ((! curPlayer) || (playing === newState)) return;
        playing = newState;
        if (! fromPlayer) {
          playing ? curPlayer.play() : curPlayer.pause();  
        }
        BoomboxDeps['playing'].changed();
      };


      this.onShuffle = function() {
        Deps.depend(BoomboxDeps['shuffle']);
        return shuffle;
      };

      this.toggleShuffle = function() {
        shuffle = ! shuffle;
        listManager.setShuffle(shuffle);
        BoomboxDeps['shuffle'].changed();
      };


      this.onLoop = function() {
        Deps.depend(BoomboxDeps['loop']);
        return loop;
      };

      this.toggleLoop = function() {
        loop = ! loop;
        BoomboxDeps['loop'].changed();
      };


      //////////////////////////////////////////////////////////////////////////
      // curPlayer and curFrame functions
      // These are separate, so the user can quickly navigate from one frame to
      // the next without having to wait for the player to load each time.


      this.curPlayerID = function() {
        Deps.depend(BoomboxDeps['curPlayer']);
        if (! curPlayer) return false;
        return curPlayer._id;     
      };

      this.setCurPlayer = function (player) {
        if (player === 'none') 
        {
          initiate();
          var deps = ['playing', 'shuffle', 'loop', 'curTimeLabel', 'totalTime', 
                    'volume', 'curFrame', 'curPlayer'];
          for (var i = 0, l = deps.length; i < l; i ++) {
            BoomboxDeps[deps[i]].changed();
          }
        }
        else if (player === 'curPlayerRemoved') 
        {
          curPlayer = null;
          BoomboxDeps['curPlayer'].changed();
        }
        else 
        {
          curPlayer = player;
          BoomboxDeps['curPlayer'].changed();
          if (oldCurPlayer) {
            oldCurPlayer.pause();
            oldCurPlayer = null;
          }
          if (playing && curPlayer.isReady) {
            curPlayer.play();
            if (reset) curPlayer.setNewTime(0);
            curPlayer.updateDuration();
            reset = true;
          }
        }
      };

      this.curFrameID = function () {
        Deps.depend(BoomboxDeps['curFrame']);
        if (! curFrame) return false;
        return curFrame._id;
      };

      this.setCurFrame = function (frame) {
        curFrame = frame;
        BoomboxDeps['curFrame'].changed();
      };     


      //////////////////////////////////////////////////////////////////////////
      // playlist navigation


      this.prev = function() {
        if (Items.find({}).count() === 0) return;
        if (! loop) {
          if (playing) {
            oldCurPlayer = curPlayer;
          }
          listManager.prev();
        }
        else {
          curPlayer.setNewTime(0);
          if (playing) curPlayer.play();  
        }        
      };

      this.next = function() {
        if (Items.find({}).count() === 0) return;
        if (! loop) {
          if (playing) {
            oldCurPlayer = curPlayer;
          }
          listManager.next();
        }
        else {
          curPlayer.setNewTime(0);
          if (playing) curPlayer.play();  
        }        
      };


      //////////////////////////////////////////////////////////////////////////
      // time properties
      
      this.getCurTimeLabel = function() {
        Deps.depend(BoomboxDeps['curTimeLabel']);
        return curTimeLabel;
      };

      this.setCurTimeLabel = function(newTime) {
        if (curTimeLabel === newTime) return;
        curTimeLabel = newTime;
        BoomboxDeps['curTimeLabel'].changed();
      };

      this.setCurTime = function(newTime, fromPlayer) {
        if (fromPlayer && this.pauseUpdates) return;
        curTime = newTime;
        if (! fromPlayer) curPlayer.setNewTime(newTime);
        this.setCurTimeLabel(newTime);
      };


      this.getTotalTime = function() {
        Deps.depend(BoomboxDeps['totalTime']);
        return totalTime;
      };

      this.setTotalTime = function(newTime) {
        if (totalTime === newTime) return;
        totalTime = newTime;
        BoomboxDeps['totalTime'].changed();
      };


      //////////////////////////////////////////////////////////////////////////
      // volume setting


      this.getVolume = function() {
        Deps.depend(BoomboxDeps['volume']);
        return volume;
      };

      this.setVolume = function(newVolume, fromPlayer) {
        if (volume === newVolume) return;
        if (fromPlayer && this.pauseUpdates) return;

        if (! fromPlayer) curPlayer.setVolume(newVolume);
        volume = newVolume;
        BoomboxDeps['volume'].changed();
      };


      //////////////////////////////////////////////////////////////////////////
      // playlist functions

      this.itemAdded = function (item) {
        listManager.add(item);
      };

      this.removeItem = function (item) {
        Items.remove(item._id, function (error) {
          if (error) alert(error);
        });
      };

      this.clickedPicture = function(frame) {
        if (playing) {
          oldCurPlayer = curPlayer;  // to pause later
        }
        // clicking pic should always auto-play
        this.setPlaying(true, "fromPicture");
        listManager.setCurFrame(frame);        
      };

      this.clickedPlayer = function(frame) {
        if (playing) {
          oldCurPlayer = curPlayer;  // to pause later
        }
        reset = false;
        listManager.setCurFrame(frame);
      };
      

  };


  PlaylistParty.boombox = new Boombox();

})();