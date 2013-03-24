////////////////////////////////////////////////////////////////////////////////
// stub functions


(function() {


  Meteor.methods({
    
    addOwner: function(playlistID, userID) {
      var playlist = Playlist.findOne({'url': playlistID});
      Playlist.update(playlist._id, {$addToSet: {'owner': userID }});
      Playlist.update(playlist._id, {$addToSet: {'users': userID }});
    },


    setPlaylistType: function(playlistID, newType) {
      var playlist = Playlist.findOne({'url': playlistID});
      Playlist.update(playlist._id, {$set: {"type": newType}});
    },


    addUserToPlaylist: function(playlistID, userID) {
      var playlist = Playlist.findOne({'url': playlistID});
      Playlist.update(playlist._id, {$addToSet: {'users': userID }});      
    }
  });


})();