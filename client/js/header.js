///////////////////////////////////////////////////////////////////////////////
// Header template
//
// Global variables used here:
// - Playlist collection


(function() {

  Template.header.playlistName = function() {
    var thisList = Playlist.findOne(testList);
    if (! thisList) return "Welcome";
    return thisList.name;
  };

})();

