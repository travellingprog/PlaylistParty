///////////////////////////////////////////////////////////////////////////////
// Meteor Collection subscription

var testList = "c3dfdf09-a554-4f25-a100-4283bfe81fea";

Meteor.subscribe("playlist", testList);
Meteor.subscribe("items", testList); 


// Utility Functions

var showTime = function(total) {
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