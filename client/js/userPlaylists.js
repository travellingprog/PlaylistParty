////////////////////////////////////////////////////////////////////////////////
// userPlaylists


(function() {


  Template.userPlaylists.list = [];

  Template.userPlaylists.host = window.location.host;

  Template.userPlaylists.events({
    'click .cancel': function() {
      Template.userPlaylists.list = [];      
      Session.set("showUserPlaylists", false);
    }
  });


})();