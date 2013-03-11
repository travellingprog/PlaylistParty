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
  

})();


// tab behaviour
// $('body').on('shown', '#deskMenu button[data-toggle="tab"]', function(e) {
//   alert(e.target.dataset.target);
// });