////////////////////////////////////////////////////////////////////////////////
// options


(function() {

  Template.options.anonStatus = function() {
    var playlist = Playlist.findOne();
    return (playlist && (playlist.type === 'anonymous')) ? "YES" : "NO";
  };


  Template.options.isOwner = function() {
    var playlist = Playlist.findOne();
    return (playlist && (playlist.owner.indexOf(Meteor.userId()) < 0)) ?  
      false : true;
  };  


  Template.options.events({
    'click .question': function(e) {
      e.preventDefault();
      var newOffset = $(e.currentTarget).offset().top - $('#options h2').offset().top;
      $(e.currentTarget).parent().next('.answer').toggle(400, function () {
        $('html, body').animate({scrollTop: newOffset}, 400);
      });
    },

    'click #changeAnonStatus': function() {
      if (Playlist.findOne().type === 'anonymous') 
      {
        Meteor.call('setPlaylistType', PlaylistParty.listID, 'publicUsers', function (error) {
          if (error) alert(error);
        });
      }
      else if (Playlist.findOne().type === 'publicUsers') 
      {
        Meteor.call('setPlaylistType', PlaylistParty.listID, 'anonymous', function (error) {
          if (error) alert(error);
        });
      }
    },

    'click .viewMyPlaylists': function() {
      Meteor.call('getMyPlaylistsInfo', function(error, result) {
        if (error) {
          alert(error);
        } 
        else {
          Template.userPlaylists.list = result;
          Session.set("showUserPlaylists", true);
        }
      });
    },

    'click #removeAllMine': function() {
      Template.removeAllWarning.setType("myItems");
      Session.set("showRemoveAllWarning", true);
    },

    'click #removeAllAnon': function() {
      Template.removeAllWarning.setType("anonItems");
      Session.set("showRemoveAllWarning", true);
    }
  })


})();