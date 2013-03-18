////////////////////////////////////////////////////////////////////////////////
// removeAllWarning
//
// MUST CHANGE THIS WHEN USER ACCOUNTS ARE ADDED, TO USE A CALL METHOD INSTEAD


(function() {


  Template.removeAllWarning.events({

    'click .btn-primary': function() {
      var itemsToRemove = Items.find({addedBy: 'user1'}).fetch();
      for (var i = itemsToRemove.length - 1; i >= 0; i--) {
        PlaylistParty.boombox.removeItem(itemsToRemove[i]);
      };
      Session.set("showRemoveAllWarning", false);
    },

    'click .cancel' : function() {
      Session.set("showRemoveAllWarning", false);
    }

  });


})();