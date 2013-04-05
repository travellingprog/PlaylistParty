///////////////////////////////////////////////////////////////////////////////
// Header template
//
// Global variables used here:
// - Playlist collection


(function() {

  Template.header.playlistName = function() {
    var thisList = Playlist.findOne();

    // if there's no Playlist, then there's likely been an update
    // just installed, and the playlistSet variable is only "true"
    // because it was retrieved from the cache, so reload the
    // page from the server
    if (! thisList) document.location.reload(true);
    
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

