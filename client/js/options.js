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


  var changeUsername = function() {
    var name = $('#changeUsernameText').val();
    if (name.length < 3) {
      $('#changeUsernameError').text('3 characters minimum');
      $('#changeUsernameText').focus();
      return;
    }

    Meteor.call('changeUsername', name, function(error) {
      if (! error) {
        $('#editingName').hide();
        $('#changeUsernameBtn').show();
        $('#changeUsernameError').text('');
      }
      else {
        $('#changeUsernameError').text(error.reason);
        $('#changeUsernameText').focus();
      }
    });
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
          if (error) alert(error.reason);
        });
      }
      else if (Playlist.findOne().type === 'publicUsers') 
      {
        Meteor.call('setPlaylistType', PlaylistParty.listID, 'anonymous', function (error) {
          if (error) alert(error.reason);
        });
      }
    },

    'click .viewMyPlaylists': function() {
      Meteor.call('getMyPlaylistsInfo', function(error, result) {
        if (error) {
          alert(error.reason);
        } 
        else {
          Template.userPlaylists.list = result;
          Session.set("showUserPlaylists", true);
        }
      });
    },

    'click #changeUsernameBtn': function() {
      var textbox = $('#changeUsernameText');
      textbox.val(Meteor.user().username);
      $('#changeUsernameBtn').hide();
      $('#editingName').show();
      textbox.focus().select();
    },

    'keypress #changeUsernameText': function(event) {
      if (event.which == 13) {
        event.preventDefault();
        changeUsername();
      }
    },

    'click #changeUsernameCancel': function(e) {
      e.preventDefault();
      $('#changeUsernameError').text('');
      $('#editingName').hide();
      $('#changeUsernameBtn').show();
    },

    'click #changeUsernameUpdate': function(e) {
      e.preventDefault();
      changeUsername();
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