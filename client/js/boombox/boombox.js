////////////////////////////////////////////////////////////////////////////////
// Boombox is the controller for the controlbox. 
// It has many reactive properties.


(function() {


  var Boombox = function () {

    var playing, shuffle, loop;
    var curTime, curTimeLabel, totalTime;
    var volume;
    var curFrameID, curPlayer, oldCurPlayer;
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
        curFrameID = null;
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
        return curPlayer.id;     
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
        if (! curFrameID) return false;
        return curFrameID;
      };

      this.setCurFrameID = function (id) {
        curFrameID = id;
        BoomboxDeps['curFrame'].changed();
      };     


      //////////////////////////////////////////////////////////////////////////
      // playlist navigation


      this.prev = function() {
        if (Playlist.findOne().items.length === 0) return;
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
        if (Playlist.findOne().items.length === 0) return;
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

        if ((! fromPlayer) && curPlayer) curPlayer.setVolume(newVolume);
        volume = newVolume;
        BoomboxDeps['volume'].changed();
      };


      //////////////////////////////////////////////////////////////////////////
      // player and item functions

      this.playerAdded = function (id) {
        listManager.add(id);
      };

      this.playerDestroyed = function (id) {
        listManager.remove(id);
      };

      this.insertItem = function(item) {
        var userID = Meteor.userId();

        Playlist.update(
        PlaylistParty.listID,
        {
          $push: 
          { 
            'items':
            {
              "type" : item.type,
              "streamID" : item.streamID,
              "artist": item.artist,
              "title": item.title,
              "pic": item.pic,
              "addedBy": userID || '',
              "id": (new Meteor.Collection.ObjectID()).toHexString()
            }
          }
        },
        function (error) {
          if (error) alert(error);
          return;
        });

        if (userID) {
          // Set this playlist as the first one in the user's profile
          var myPlaylists = Meteor.user().profile.playlists;
          if (myPlaylists[0] !== PlaylistParty.listID) 
          {
            myPlaylists = _.without(myPlaylists, PlaylistParty.listID);
            myPlaylists.splice(0,0,PlaylistParty.listID);
            myPlaylists = _.first(myPlaylists, 20);
            Meteor.users.update(userID, 
                                {$set: {'profile.playlists': myPlaylists}});  
          }
          
          if (Playlist.findOne().owner.length === 0) 
          {
            // If this playlist has no owner, set this user as the owner
            Meteor.call('addOwner', PlaylistParty.listID, userID);
            // ... and ask if anonymous users should be allowed
            Template.newPlaylistAlert.setOwnerNotice();
            Session.set("showNewPlaylistAlert", true);
          }
          else if (Playlist.findOne().users.indexOf(userID) < 0)
          {
            // ..else, just make sure this user is in the playlist's Users array
            Meteor.call('addUserToPlaylist', PlaylistParty.listID, userID);  
          }
        }
      };

      this.removeItem = function (item) {
        // Must remove the '_id' key given to this item in the local
        // Items collection, or our Playlist will not recognize the item.
        item = _.omit(item, '_id');

        // remove this item from the Playlist.items array
        Playlist.update(
        PlaylistParty.listID, 
        {
          $pull: 
          { 
            'items': item
          }
        },
        function (error) {
          if (error) alert(error);
        });

        var userID = Meteor.userId();
        if (userID) {
          // Set this playlist as the first one in the user's profile
          var myPlaylists = Meteor.user().profile.playlists;
          if (myPlaylists[0] !== PlaylistParty.listID) 
          {
            myPlaylists = _.without(myPlaylists, PlaylistParty.listID);
            myPlaylists.splice(0,0,PlaylistParty.listID);
            myPlaylists = _.first(myPlaylists, 20);
            Meteor.users.update(userID, 
                                {$set: {'profile.playlists': myPlaylists}});  
          }
        }
      };


      this.clickedPicture = function(id) {
        if (playing) {
          oldCurPlayer = curPlayer;  // to pause later
        }
        // clicking pic should always auto-play
        this.setPlaying(true, "fromPicture");
        listManager.setCurFrame(id);
      };

      this.clickedPlayer = function(id) {
        if (playing) {
          oldCurPlayer = curPlayer;  // to pause later
        }
        reset = false;
        listManager.setCurFrame(id);
      };
      

  };


  PlaylistParty.boombox = new Boombox();

})();