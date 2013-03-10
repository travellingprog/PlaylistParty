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

})();

