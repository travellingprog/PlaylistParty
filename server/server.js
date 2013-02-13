// On server startup, create a playlist if the Collection is empty
Meteor.startup(function () {
  if (Playlist.find().count() === 0) {
    var list = Playlist.insert({
      "name" : "My Playlist!",
      "public" : true,
      "password" : "encPassword",  
    });
    Items.insert({
      "playlistID" : list,
      "type" : "YouTube",
      "streamID" : "V_QyvLX4h2k",
      "seqNo": 1,
      "addedBy": "user1"      
    });
  }
});


// return only the playlist specified by the ID
Meteor.publish("playlist", function (playlistID) {
  return Playlist.find(playlistID);
});


// return only the items for the playlist specified, sorted by sequence number
Meteor.publish("items", function(playlistID) {
  return Items.find({"playlistID" : playlistID}, {sort: {seqNo: 1}});
});