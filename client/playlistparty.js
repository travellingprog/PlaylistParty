///////////////////////////////////////////////////////////////////////////////
// PLAYLIST PARTY
// 
// This section registers the third-party APIs when the page is loaded.
// Also, there are some global variables set here, including the collection
// subscription.
//
// Global variables defined here:
// - testList
// - showTime function
// - onYouTubeIframeAPIReady function
// - Items collection
// - Playlist collection
//
// Global variables used here:
// - Session.keys.YtAPIready
// - Session.keys.ScAPIready



(function () {


  ///////////////////////////////////////////////////////////////////////////////
  // Meteor Collection subscription

  testList = "c3dfdf09-a554-4f25-a100-4283bfe81fea";

  Meteor.subscribe("playlist", testList);
  Meteor.subscribe("items", testList); 


  ///////////////////////////////////////////////////////////////////////////////
  // General utility Functions

  showTime = function(total) {
    // format the time, received in number of seconds, to [HH:]MM:SS
    var hour, min, sec;
    
    if (total >= 3600) {
      hour = Math.floor(total / 3600);
      total = total % 3600;
      if (hour < 10) hour = '0' + hour;
      hour = hour + ':';
    } else {
      hour = '';
    }

    if (total >= 60) {
      min = Math.floor(total / 60);
      total = total % 60;
      if (min < 10) min = '0' + min;
      min = min + ':';
    } else {
      min = '00:';
    }

    sec = Math.round(total);
    // sec = total;
    if (sec < 10) sec = '0' + sec;
    return hour + min + sec;
  };


  ///////////////////////////////////////////////////////////////////////////////
  // YouTube utility functions


  // load the YouTube IFrame Player API code
  var loadYTplayerAPI = function () {

    var ytPlayerScript = 
                    '<script src="https://www.youtube.com/iframe_api"></script>';

    // place the Player API <script> as the first script on the page
    var oldfirstScript = $('script :first');
    if (oldfirstScript.length) {
      oldfirstScript.before(ytPlayerScript);
    } else {
      $('head').append(ytPlayerScript);
    }
  };


  // Signal when the Youtube API is ready, to load the YouTube player
  onYouTubeIframeAPIReady = function () {
    Session.set("YtAPIready", true);
  }; 


  var getYoutubeID = function(vidURL) {
    var idRegex = /(v=)([\w-]*)/;
    var idMatch = vidURL.match(idRegex);
    return idMatch ? idMatch[2] : "";
  };



  ///////////////////////////////////////////////////////////////////////////////
  // Code to run on the client as soon as the DOM is ready

  Meteor.startup(function () {
    
    window.scrollTo(0,0);

    // load the YouTube IFrame Player API code asynchronously
    Session.set("YtAPIready", false);
    loadYTplayerAPI();

    // Register with the SoundCloud API
    SC.initialize({
      client_id: '46952284e7dd10b148d9868c4ad74cdc'
    });
    Session.set("ScAPIready", true);
  });

  
})();

