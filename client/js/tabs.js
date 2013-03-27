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

      // scroll to current player, if there is one
      var curPlayerID = PlaylistParty.boombox.curPlayerID();
      if (PlaylistParty.activeTab === '#tracks' && curPlayerID) {
        var firstPOffset = $('.player :first').offset().top;
        var newOffset = $('#' + curPlayerID).parent().offset().top - firstPOffset;
        $('html, body').scrollTop(newOffset);
      }
    });

    $('body').on('shown', '#normSearchBtn', function(e) {
      PlaylistParty.activeTab = '#search';
    });
  });
  

})();


