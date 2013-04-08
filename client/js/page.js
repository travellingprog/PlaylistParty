///////////////////////////////////////////////////////////////////////////////
// page Template
//
// Global varibles used here:
// - Session.keys.showCreatePlaylist
// - Session.keys.showPhoneSearch
// - Session.keys.playlistSet
// - Session.keys.showMoreInfo


(function () {

  var template = Template.page;

  template.playlistSet = function() {
    return Session.get("playlistSet");
  };

  template.playlistName = function() {
    var thisList = Playlist.findOne();

    // if there's no Playlist, then there's likely been an update
    // just installed, and the playlistSet variable is only "true"
    // because it was retrieved from the cache, so reload the
    // page from the server
    if (! thisList) document.location.reload(true);
    
    return thisList.name;
  };

  template.showCreatePlaylist = function () {
    return Session.get("showCreatePlaylist");
  };

  template.showPhoneSearch = function() {
    return Session.get("showPhoneSearch");
  };

  template.showMoreInfo = function() {
    return Session.get("showMoreInfo");
  };

  template.showExitWarning = function() {
    return Session.get("showExitWarning");
  };

  template.showRemoveAllWarning = function() {
    return Session.get("showRemoveAllWarning");
  };

  template.showNewPlaylistAlert = function() {
    return Session.get("showNewPlaylistAlert");
  };

  template.showNotAllowedByAnon = function() {
    return Session.get("showNotAllowedByAnon");
  };

  template.showUserPlaylists = function() {
    return Session.get("showUserPlaylists");
  };

})();

