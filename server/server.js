// On server startup, create a playlist if the Collection is empty
Meteor.startup(function () {
  if (Playlists.find().count() === 0) {
    Playlists.insert({
      "listName" : "My Playlist!",
      "public" : true,
      "password" : "encPassword",
      "items" : [
        {
          "type" : "YouTube",
          "id" : "V_QyvLX4h2k",
          "seqNo": 1
        }
      ]  
    })
  }
});


// return only the playlist specified by the ID
Meteor.publish("playlists", function (playlistID) {
  return Playlists.find(playlistID);
});