////////////////////////////////////////////////////////////////////////////////
// stub functions


(function() {


  Meteor.methods({
    
    addOwner: function(playlistID, userID) {
      Playlist.update(playlistID, {$addToSet: {'owner': userID }});
      Playlist.update(playlistID, {$addToSet: {'users': userID }});
    },


    setPlaylistType: function(playlistID, newType) {
      Playlist.update(playlistID, {$set: {"type": newType}});
    },


    addUserToPlaylist: function(playlistID, userID) {
      Playlist.update(playlistID, {$addToSet: {'users': userID }});      
    }
  });


})();