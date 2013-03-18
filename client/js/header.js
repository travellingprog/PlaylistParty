///////////////////////////////////////////////////////////////////////////////
// Header template
//
// Global variables used here:
// - Playlist collection


(function() {

  Template.header.playlistName = function() {
    var thisList = Playlist.findOne();
    return thisList.name;
  };

  Template.header.playlistSet  = function() {
    return Session.get("playlistSet");
  };

  Template.header.events({
    'click .home': function(e) {
      e.preventDefault();
      if (! Session.get("playlistSet")) return;

      Session.set("showExitWarning", true);
    }
  })

})();

