////////////////////////////////////////////////////////////////////////////////
// moreInfo
//
// Global variables used:
// - Session.keys.showMoreInfo


(function() {

  Template.moreInfo.events({

    'click .cancel': function() {
      Session.set("showMoreInfo", false);
    }

  });


})();