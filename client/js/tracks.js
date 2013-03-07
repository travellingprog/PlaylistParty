///////////////////////////////////////////////////////////////////////////////
// Tracks template
//
// Global variables used:
// - Session.key.YtAPIready
// - Session.key.ScAPIready
// - Items collection

(function() {

  Template.tracks.APIsReady = function () {
    if (! Session.get("YtAPIready")) return false;
    if (! Session.get("ScAPIready")) return false;
    return true;
  }


  Template.tracks.items = function() {
    return Items.find({},{sort: {seqNo: 1}});
  };

})();

