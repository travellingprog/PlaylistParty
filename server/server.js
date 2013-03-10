////////////////////////////////////////////////////////////////////////////////
// server

(function() {



  //////////////////////////////////////////////////////////////////////////////
  // playlist creation

  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 
               'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 
               'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];


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

      Playlist.insert({
        'name': name,
        'url': newURL,
        'password': false,
        'public': true
      });

      return newURL;
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
  // Publishing functoins

  
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


  Meteor.publish("items", function(playlistID) {
    if (! is('String', playlistID)){
      this.error(new Meteor.Error(400, 'Invalid data provided.'));
    }
    return Items.find({"playlistID" : playlistID});
  });


})();


