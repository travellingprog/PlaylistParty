////////////////////////////////////////////////////////////////////////////////
// stub functions


(function() {


  Meteor.methods({
    
    addOwner: function(playlistID, userID) {
      var playlist = Playlist.findOne({'url': playlistID});

      if (playlist.owner.indexOf(userID) < 0) {
        Playlist.update(playlist._id, {$push: {'owner': userID }});

        // add to playlist users, if necessary
        if (playlist.users.indexOf(userID) < 0) {
          Playlist.update(playlist._id, {$push: {'users': userID }});
        }
        return true;
      }
      else {
        return false;
      }
    },


    setPlaylistType: function(playlistID, newType) {
      var playlist = Playlist.findOne({'url': playlistID});

      Playlist.update(playlist._id, {$set: {"type": newType}});
    },


    addUserToPlaylist: function(playlistID, userID) {
      var playlist = Playlist.findOne({'url': playlistID});
      var newUser = Meteor.users.findOne(userID);

      // check the user has not already been added
      if (playlist.users.indexOf(userID) < 0) {
        Playlist.update(playlist._id, {$push: {'users': userID }});
      }
      
    }
  });


})();