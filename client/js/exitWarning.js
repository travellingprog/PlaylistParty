////////////////////////////////////////////////////////////////////////////////
// exitWarning


(function() {


  Template.exitWarning.url = function() {
    return 'http://' + window.location.host + '/' + PlaylistParty.playlistID;
  };
  
  Template.exitWarning.events({

    'keydown #playlistURL': function(e) {
      $('#playlistURL').val(Template.exitWarning.url());
    },

    'click .cancel' : function() {
      Session.set("showExitWarning", false);
    }

  });


})();