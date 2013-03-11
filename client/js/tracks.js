///////////////////////////////////////////////////////////////////////////////
// Tracks template
//
// Global variables used:
// - Session.key.YtAPIready
// - Session.key.ScAPIready
// - Items collection

(function() {

  var template = Template.tracks;

  template.noItems = function() {
    return (Items.find({}).count() === 0);
  };
  

  template.APIsReady = function () {
    if (! Session.get("YtAPIready")) return false;
    if (! Session.get("ScAPIready")) return false;
    return true;
  }


  template.items = function() {
    return Items.find({},{sort: {seqNo: 1}});
  };

})();

