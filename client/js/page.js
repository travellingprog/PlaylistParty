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

})();

