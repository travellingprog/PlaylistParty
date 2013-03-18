////////////////////////////////////////////////////////////////////////////////
// tabs
//
// Global variables used:
// - Session.keys.playlistSet


(function() {

  var template = Template.tabs;

  template.playlistSet = function() {
    return Session.get("playlistSet");
  };


  Meteor.startup(function () {

    $('body').on('shown', '#deskMenu button[data-toggle="tab"]', function(e) {
      PlaylistParty.activeTab = e.target.dataset.target;
    });

    $('body').on('shown', '#normSearchBtn', function(e) {
      PlaylistParty.activeTab = '#search';
    });
  });
  

})();


