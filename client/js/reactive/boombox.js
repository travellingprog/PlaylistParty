///////////////////////////////////////////////////////////////////////////////
// Boombox object, a reactive data source

(function() {

  var Boombox = function () {
    this.playing = false;
    this.shuffle = false;
    this.loop = false;
    this.volume = 80;
    this.curTime = 0;
    this.totalTime = 0;
  };


  Boombox.prototype = new ReactiveData();

  
  Boombox.prototype.isPlaying = function() {
    this.readingData(Meteor.deps.Context.current, 'playing');
    return this.playing;
  };

  Boombox.prototype.togglePlaying = function() {
    this.playing = ! this.playing;
    this.changedData('playing');
  };

  // Needed when non-current player is started
  Boombox.prototype.setPlaying = function(newState) {
    if (this.playing === newState) return;
    this.playing = newState;
    this.changedData('playing');
  };


  Boombox.prototype.isShuffle = function() {
    this.readingData(Meteor.deps.Context.current, 'shuffle');
    return this.shuffle;
  };

  Boombox.prototype.toggleShuffle = function() {
    this.shuffle = ! this.shuffle;
    this.changedData('shuffle');
  };


  Boombox.prototype.isLoop = function() {
    this.readingData(Meteor.deps.Context.current, 'loop');
    return this.loop;
  };

  Boombox.prototype.toggleLoop = function() {
    this.loop = ! this.loop;
    this.changedData('loop');
  };  


  Boombox.prototype.getVolume = function() {
    this.readingData(Meteor.deps.Context.current, 'volume');
    return this.volume;
  };

  Boombox.prototype.setVolume = function(newVolume) {
    if (this.volume === newVolume) return;
    this.volume = newVolume;
    this.changedData('volume');
  };


  Boombox.prototype.getCurTime = function() {
    this.readingData(Meteor.deps.Context.current, 'curTime');
    return this.curTime;
  };

  Boombox.prototype.setCurTime = function(newTime) {
    if (this.curTime === newTime) return;
    this.curTime = newTime;
    this.changedData('curTime');
  };


  Boombox.prototype.getTotalTime = function() {
    this.readingData(Meteor.deps.Context.current, 'totalTime');
    return this.totalTime;
  };

  Boombox.prototype.setTotalTime = function(newTime) {
    if (this.totalTime === newTime) return;
    this.totalTime = newTime;
    this.changedData('totalTime');
  };

  Boombox.prototype.constructor = Boombox;


  boombox = new Boombox();

})();