////////////////////////////////////////////////////////////////////////////////
// server

(function() {

  Playlist = new Meteor.Collection("playlist");


  //////////////////////////////////////////////////////////////////////////////
  // playlist creation/modification

  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 
               'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 
               'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  var playlistTypes = ['anonymous', 'publicUsers'];


  // function from JavaScript Garden
  function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  }


  Meteor.methods({
    createPlaylist: function (userDate, name) {
      if (! (is('Date', userDate)  &&  is('String', name) )) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      if ((name.length > 25) || (name.length === 0)) {
        throw new Meteor.Error(400, 'Invalid playlist name.');
      }

      var newURL;
    
      var urlA = '';
      var day = userDate.getDate();
      if (day < 10) urlA += '0';
      urlA += day;
      urlA += months[userDate.getMonth()];
      var year = '' + userDate.getFullYear();
      urlA += year.substr(year.length - 2);
      urlA += '/';
      
      var uniqueURL = false;
      var urlB = '';

      do {
        urlB = addChars(6);
        newURL = urlA + urlB;
        if (Playlist.find({'url': newURL}).count() === 0){
          uniqueURL = true;
        }
      } while (! uniqueURL);

      var playlist_id = Playlist.insert({
        'name': name,
        'url': newURL,
        'password': false,
        'type': 'anonymous',
        'owner': [],
        'users': [],
        'items': []
      });

      if (this.userId) {
        Playlist.update(playlist_id, {$push: {'owner': this.userId }});
        Playlist.update(playlist_id, {$push: {'users': this.userId }});

        // Set this playlist as the first one in the user's profile
        var userPlaylists = Meteor.users.findOne(this.userId).profile.playlists;
        userPlaylists.splice(0,0,playlist_id);
        userPlaylists = _.first(userPlaylists, 20);
        Meteor.users.update(this.userId, 
                            {$set: {'profile.playlists': userPlaylists}});
      }

      return newURL;
    },


    addOwner: function(playlistID, userID) {
      if (! (is('String', playlistID)  &&  is('String', userID) )) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      if ((playlistID.length === 0)  ||  (userID.length === 0)) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      var playlist = Playlist.findOne(playlistID);
      var newOwner = Meteor.users.findOne(userID);

      if ((! playlist) || (! newOwner)) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      // TO DO: if the playlist has users, check that this new owner is
      // part of those users.

      // TO DO: check that this call is coming from a current owner
      // of the playlist

      Playlist.update(playlistID, {$addToSet: {'owner': userID }});
      Playlist.update(playlistID, {$addToSet: {'users': userID }});
    },


    setPlaylistType: function(playlistID, newType) {
      
      if (! (is('String', playlistID)  &&  is('String', newType) )) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      if (playlistTypes.indexOf(newType) < 0) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      var playlist = Playlist.findOne(playlistID);

      if (! playlist) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      if (! this.userId) {
        throw new Meteor.Error(403, 'No access allowed.');  
      }

      if (playlist.owner.indexOf(this.userId) < 0) {
        throw new Meteor.Error(403, 'No access allowed.');
      }

      Playlist.update(playlistID, {$set: {"type": newType}});
    },


    addUserToPlaylist: function(playlistID, userID) {
      if (! (is('String', playlistID)  &&  is('String', userID) )) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      // check if user exists
      if (! Meteor.users.findOne(userID)) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      // check if playlist exists and has an item added by this user
      var playlist = Playlist.findOne({
        '_id': playlistID, 
        'items.addedBy': userID
      });

      if (! playlist) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      Playlist.update(playlistID, {$addToSet: {'users': userID }});      
    }
  });


  function addChars(numChars) {
    var seed = Math.floor(Math.random() * Math.pow(36, numChars));
    var retValue = '';

    for (var i = numChars - 1; i >= 0; i--){
      retValue += chars[Math.floor(seed / Math.pow(36, i))];
      seed = seed % Math.pow(36, i);
    }

    return retValue;
  }



  //////////////////////////////////////////////////////////////////////////////
  // User creation and personal list of playlists


  // Make the profile only have a playlists array
  Accounts.onCreateUser(function(options, user) {
    user.profile = {playlists: []};
    return user;
  });

  Meteor.methods({
    'getMyPlaylistsInfo': function() {
      if (! this.userId) {
        throw new Meteor.Error(400, 'Invalid data provided.');
      }

      var result = [];
      var playlistIDs = Meteor.users.findOne(this.userId).profile.playlists;

      for (var i = 0, l = playlistIDs.length; i < l; i++) {
        var playlist = Playlist.findOne(playlistIDs[i]);
        result.push({'name': playlist.name, 'url': playlist.url});
      }

      return result;
    }
  });



  //////////////////////////////////////////////////////////////////////////////
  // Publishing functions

  
  Meteor.publish("playlist", function (playlistID) {
    if (! is('String', playlistID)){
      this.error(new Meteor.Error(400, 'Invalid data provided.'));
    }

    var playlist = Playlist.find({'url': playlistID});
    if (playlist.count() === 0){
      this.error(new Meteor.Error(404, 'Unable to find any playlist with that ID.'));
    }
    return playlist;
  });


  Meteor.publish("allUserData", function(users) {
    return Meteor.users.find({'_id': {$in: users}}, {fields: {'username': 1}});
  });


})();


