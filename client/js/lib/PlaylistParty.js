///////////////////////////////////////////////////////////////////////////////
// PlaylistParty global variable and Meteor Collection subscription


(function() {

  Playlist = new Meteor.Collection("playlist");

  Items = new Meteor.Collection("items");


  PlaylistParty = {};

  PlaylistParty.activeTab = '#tracks';

  PlaylistParty.subscribe = function (playlistID) {


    PlaylistParty.playlistHandle = Meteor.subscribe("playlist", playlistID, {
      
      'onReady': function() {
        PlaylistParty.itemsHandle = Meteor.subscribe("items", playlistID, function() {
          PlaylistParty.playlistID = playlistID;
          Session.set("playlistSet", true);
          Session.set("showCreatePlaylist", false);          
        });
      },

      'onError': function(error) {
        PlaylistParty.playlistHandle.stop();
        Template.initialPage.errorMessage(error.reason);
        Session.set('checkedURL', true);
      }
    });
  };



})();

  