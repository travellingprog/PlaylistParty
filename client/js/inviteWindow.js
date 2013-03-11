////////////////////////////////////////////////////////////////////////////////
// inviteWindow
//
// Global variables used:
// - Session.keys.showInvite


(function() {

  var template = Template.inviteWindow;

  template.hideinvite = function() {
    return Session.get("showInvite") ? "" : "hidden";
  };


  template.rendered = function() {
    var addThisScript = '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=xa-513d68e701f9a004"></script>';

    var oldfirstScript = $('script :first');
    if (oldfirstScript.length) {
      oldfirstScript.before(addThisScript);
    } else {
      $('head').append(addThisScript);
    }
    template.addthisConfig();
  };

  template.addthisConfig = function() {
    if (addthis_share) {
      addthis_share["title"] = "Playlist Party: " + Playlist.findOne().name;
      addthis_share["description"] = "Join in on this playlist!";
    } else {
      setTimeout(Template.inviteWindow.addthisConfig, 1000);
    }
  };


  template.url = function() {
    return 'http://' + window.location.host + '/' + PlaylistParty.playlistID;
  };
  
  Template.inviteWindow.events({

    'keydown #inviteURL': function(e) {
      $('#inviteURL').val(template.url());
    },

    'click .cancel' : function() {
      Session.set("showInvite", false);
    }

  });

})();