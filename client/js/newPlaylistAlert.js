////////////////////////////////////////////////////////////////////////////////
// newPlaylistAlert
//


(function() {

  Template.newPlaylistAlert.ownerNotice = '';

  Template.newPlaylistAlert.setOwnerNotice = function() {
    Template.newPlaylistAlert.ownerNotice = 'You are now the <strong>owner</strong> of this playlist! <br>';
  };


  Template.newPlaylistAlert.events({

    'click .blockAnonymous': function() {
      Meteor.call('setPlaylistType', PlaylistParty.listID, 'publicUsers', function (error) {
        if (error) alert(error);
      });
      Template.newPlaylistAlert.ownerNotice = '';
      Session.set("showNewPlaylistAlert", false);
    },

    'click .cancel' : function() {
      Template.newPlaylistAlert.ownerNotice = '';
      Session.set("showNewPlaylistAlert", false);
    }

  });


})();