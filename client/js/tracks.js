///////////////////////////////////////////////////////////////////////////////
// Tracks template
//
// Global variables used:
// - Session.key.YtAPIready
// - Session.key.ScAPIready

(function() {

  var template = Template.tracks;

  template.noItems = function() {
    var playlist = Playlist.find().fetch();
    return ((playlist.length > 0) && (playlist[0].items.length)) ? false : true;
  };
  

  template.APIsReady = function () {
    if (! Session.get("YtAPIready")) return false;
    if (! Session.get("ScAPIready")) return false;
    return true;
  };


  template.items = function() {
    return Items.find();
  };

})();

