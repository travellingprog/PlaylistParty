////////////////////////////////////////////////////////////////////////////////
// createPlaylist


(function() {

  var createPlaylist = function(name) {
    Meteor.call('createPlaylist', new Date(), name, function(error, newID) {
      if (! error) {
        window.History.pushState(null, null, newID + '/');
        PlaylistParty.subscribe(newID);
      } else {
        Template.initialPage.errorMessage(error.reason);
        Session.set("showCreatePlaylist", false);
      }
    });
  };

  var checkName = function (name) {
     if ((! name) || (name.length > 25) || (name.length === 0)) return;
     $('#createPlaylistBtn').text("Creating...");
     createPlaylist(name);
  };


  var template = Template.createPlaylist;

  template.rendered = function() {
    $('#playlistNameField').focus();
  };
  
  template.events({
    'keypress #playlistNameField' : function(event) {
      if (event.which == 13) {
        checkName($('#playlistNameField').val());
      }
    },
  
    'click #createPlaylistBtn' : function() {
      checkName($('#playlistNameField').val());
    },
  
    'click .cancel' : function() {
      Session.set("showCreatePlaylist", false);
    }
  });


})();