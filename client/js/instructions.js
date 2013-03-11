////////////////////////////////////////////////////////////////////////////////
// instructions
//
// Global variables used:
// - Session.keys.showMoreInfo


(function() {

  Template.instructions.events({

    'click .moreInfoLink': function() {
      Session.set("showMoreInfo", true);
      return false;
    }

  });

})();