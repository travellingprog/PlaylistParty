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
    },

    toggleLike: function(playlistID, itemID) {

      var itemIndex;
      var item = _.find(Playlist.findOne(playlistID).items, function(thisItem, index) {
        itemIndex = index;
        return thisItem.id === itemID;
      });
      
      if (_.contains(item.likes, this.userId)) {
        var modifier = {$pull: {}};
        modifier.$pull["items." + itemIndex + ".likes"] = this.userId;
      }
      else {
        var modifier = {$push: {}};
        modifier.$push["items." + itemIndex + ".likes"] = this.userId;
      }
      Playlist.update(playlistID, modifier);
    }
  });


})();