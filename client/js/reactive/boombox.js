///////////////////////////////////////////////////////////////////////////////
// Boombox object, a reactive data source
//
// Note: Because the user can interact with the player outside of the controls
//       in the website, it is necessary to have a 'playing' variable, while
//       simultaneously having SEPARATE 'play' and 'pause' functionality.
//       This separation also allows the continuous play between media of
//       different sources.
//
// Global variable used here:
// - ReactiveData function


(function() {

  var Boombox = function () {

    var playing = false;
    var shuffle = false;
    var loop = false;
    var volume = 80;
    var curTime = 0;
    var totalTime = 0;
    var player = {};
    var curPlayer = false;
    this.pauseUpdates = false;
    var $timeslider, $volumeslider, $phoneVol;
    var that = this;


      //////////////////////////////////////////////////////////////////////////
      // playback settings


      this.isPlaying = function() {
        this.readingData(Meteor.deps.Context.current, 'playing');
        return playing;
      };

      // Needed when non-current player is started
      this.setPlaying = function(newState) {
        if (playing === newState) return;
        playing = newState;
        this.changedData('playing');
      };

      this.togglePlaying = function() {
        if (! curPlayer) return;

        if (playing) {
          curPlayer.pause();
        } else {
          curPlayer.play();
        }

        playing = ! playing;
        this.changedData('playing');
      };


      this.onShuffle = function() {
        this.readingData(Meteor.deps.Context.current, 'shuffle');
        return shuffle;
      };

      this.toggleShuffle = function() {
        shuffle = ! shuffle;
        this.changedData('shuffle');
      };


      this.onLoop = function() {
        this.readingData(Meteor.deps.Context.current, 'loop');
        return loop;
      };

      this.toggleLoop = function() {
        loop = ! loop;
        this.changedData('loop');
      };


      //////////////////////////////////////////////////////////////////////////
      // playlist navigation


      this.prev = function() {
        if (! curPlayer) return;

        var curItem = Items.findOne({"_id" : curPlayer.id});
        var prevItem = Items.findOne({seqNo: {$lt: curItem.seqNo}}, 
                                     {sort: {seqNo: -1}});
        if (prevItem) {
          this.setCurPlayer(prevItem._id);
        } else {
          prevItem = Items.findOne({}, {sort: {seqNo: -1}});
          this.setCurPlayer(prevItem._id);
        }
      };


      this.next = function() {
        if (! curPlayer) return;

        var curItem = Items.findOne({"_id" : curPlayer.id});
        var nextItem = Items.findOne({seqNo: {$gt: curItem.seqNo}}, 
                                     {sort: {seqNo: 1}});
    
        if (nextItem) {
          this.setCurPlayer(nextItem._id);
        } else {
          nextItem = Items.findOne({}, {sort: {seqNo: 1}});
          this.setCurPlayer(nextItem._id);
        }
      };



      //////////////////////////////////////////////////////////////////////////
      // curPlayer functions


      this.curPlayerID = function() {
        this.readingData(Meteor.deps.Context.current, 'curPlayer');
        if (! curPlayer) return false;
        return curPlayer.id;
      };

      this.setCurPlayer = function(newID) {
        if ((curPlayer) && (curPlayer.id === newID)) return;

        // if currently playing, pause until we switch the player
        var continuePlaying = playing;
        if (continuePlaying) curPlayer.pause();

        // set new curPlayer
        player[newID].setVolume(volume);
        curPlayer = player[newID];
        this.changedData('curPlayer');

        scrollToCurPlayer();

        curPlayer.updateDuration();
        if (continuePlaying) curPlayer.play();  // may not work on mobile devices
      };

      function scrollToCurPlayer()  {
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curPlayer.id).parent().offset().top - firstPOffset;
        $('html, body').animate({scrollTop: newOffset}, 400);  
      };


      //////////////////////////////////////////////////////////////////////////
      // playlist functions 


      this.hasPlayer = function(IDtoCheck) {
        if (! player[IDtoCheck]) return false;
        return true;
      };

      this.addPlayer = function(newPlayer) {
        player[newPlayer.id] = newPlayer;
        if (! (curPlayer) ) this.setCurPlayer(newPlayer.id);
      };


      this.removePlayer = function(playerID) {
        if (curPlayer === player[playerID]) {
          if (Items.find({}).count() > 1) {
            this.next();
            //note: going to the next track will auto-pause the current one
          } else {
            curPlayer.pause();
          }
        }

        delete player[playerID];

        Items.remove(playerID, function (error) {
          if (error !== undefined) alert(error);
        });
      };


      //////////////////////////////////////////////////////////////////////////
      // control initialization and update

      this.initiateControls = function() {
        // Set the volume controls
        $phoneVol = $("#phoneVol");
        this.phoneVolTracking();

        $volumeslider = $('#volumeslider');
        initiateVolumeSlider();

        // Set the time slider control
        $timeslider = $('#timeslider');
        initiateTimeSlider();
        
        // Initiate live updates on curPlayer time & volume
        this.updatePlayerInfo();
      };


      this.updatePlayerInfo = function () {
        if (!that.pauseUpdates && curPlayer) {
          curPlayer.updateVolume();
          curPlayer.updateCurrentTime();
          curPlayer.updateDuration();
        }
        setTimeout(that.updatePlayerInfo, 500);
      }


      //////////////////////////////////////////////////////////////////////////
      // time slider  and time functions

      function initiateTimeSlider () {
        $timeslider.slider({
          range: "min", 
          animate: true,
          start: function() { that.pauseUpdates = true; },
          slide: function(event, ui) { that.setCurTime(ui.value), 'sliding' },
          stop: function(event, ui) {
            that.setCurTime(ui.value, 'slider');
          }
        });
      }

      this.getCurTime = function() {
        this.readingData(Meteor.deps.Context.current, 'curTime');
        return curTime;
      };

      this.setCurTime = function(newTime, source) {
        if ((source === 'player') && (curTime === newTime)) return;

        if ((source === 'slider') && curPlayer) {
          curPlayer.setNewTime(newTime);
        }

        if (source === 'player') {
          $timeslider.slider('value', newTime);
        }

        curTime = newTime;
        this.changedData('curTime');

        if (source === 'slider') {
          setTimeout(function () {
            that.pauseUpdates = false;
          }, 2000);
        }
      };


      this.getTotalTime = function() {
        this.readingData(Meteor.deps.Context.current, 'totalTime');
        return totalTime;
      };

      this.setTotalTime = function(newTime) {
        if (totalTime === newTime) return;
        totalTime = newTime;
        this.changedData('totalTime');
        $timeslider.slider("option", "max", this.getTotalTime());
      };


      //////////////////////////////////////////////////////////////////////////
      // volume controls

      function initiateVolumeSlider () {
        $volumeslider.slider({
          range: 'min',
          animate: true,
          'value': '80',
          start: function() { that.pauseUpdates = true },
          slide: function(event, ui) { that.setVolume(ui.value, 'sliding') },
          stop: function(event, ui) {  that.setVolume(ui.value, 'slider') }
        });
      }


      this.getVolume = function() {
        this.readingData(Meteor.deps.Context.current, 'volume');
        return volume;
      };


      this.phoneVolTracking = function () {
        Meteor.autorun(function () {
          $phoneVol.tooltip('destroy');
          $phoneVol.tooltip({
            title: (Math.round( that.getVolume() )).toString(),
            delay: 250 //,
            // trigger: 'hover click'
          });
          $phoneVol.tooltip('show');
        });
      };


      this.setVolume = function(newVolume, source) {
        if ((source === 'player') && (volume === newVolume)) return;

        if (source !== 'player') {
          this.pauseUpdates = true;
          if (curPlayer) curPlayer.setVolume(newVolume);
        }

        if (source !== 'slider') {
          $volumeslider.slider('value', newVolume);
        }



        volume = newVolume;
        this.changedData('volume');

        if ((source !== 'player') && (source !== 'sliding')) {
          setTimeout(function () {
            that.pauseUpdates = false;
            that.phoneVolTracking();   // some bug requires this
          }, 1000);          
        }
      };

  };


  Boombox.prototype = new ReactiveData();


  Boombox.prototype.constructor = Boombox;


  boombox = new Boombox();

})();