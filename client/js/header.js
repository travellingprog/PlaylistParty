///////////////////////////////////////////////////////////////////////////////
// Header template

(function() {

  Template.header.playlistName = function() {
    var thisList = Playlist.findOne(testList);
    if (! thisList) return "Welcome";
    return thisList.name;
  };

})();

