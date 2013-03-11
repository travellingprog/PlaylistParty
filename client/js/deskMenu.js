///////////////////////////////////////////////////////////////////////////////
// deskMenu template
//
// Global variables used:
// - Session.keys.showInvite
  
(function() {

  Template.deskMenu.events({

    'click button[data-toggle="tab"]' : function(e) {
      // disable corresponding link in phone menu
      var target = e.target.dataset.target;
      Template.phoneMenu.disableLink(
        $('a.tabLink[data-target="' + target + '"]').parent()
      );
    },

    'click .invite': function() {
      Session.set("showInvite", true);
    }
  });

})();

  