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

  template.showCreatePlaylist = function () {
    return Session.get("showCreatePlaylist");
  };

  template.showPhoneSearch = function() {
    return Session.get("showPhoneSearch");
  };

  template.playlistSet = function() {
    return Session.get("playlistSet");
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

})();

