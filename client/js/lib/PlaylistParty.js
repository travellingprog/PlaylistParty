///////////////////////////////////////////////////////////////////////////////
// PlaylistParty global variable and Meteor Collection subscription


(function() {

  // This synchronized collection will contain our single playlist document
  Playlist = new Meteor.Collection("playlist");
  
  // This local collection will have our playlist.items array. Necessary to
  // have a collection version of that array so that tracks.html does smart
  // DOM adding and removal when it uses {{#each items}}.
  //
  // Also, an Items collection was not created in the server database because,
  // according to MongoDB documentation, it is much better for server performance
  // to embed one collection inside another, when you have a one-to-many relationship
  // between documents.
  Items = new Meteor.Collection(null);

  
  // The PlaylistParty global variable. This variable will contain global settings
  // and functions for that our app needs
  PlaylistParty = {};
  PlaylistParty.activeTab = '#tracks';


  // This reactive data source will contain the playlist.items array
  var items = [];
  var itemsDeps = new Deps.Dependency;


  // Collection subscription, that occurs either when someone visits a URL, or when
  // they create a new playlist
  PlaylistParty.subscribe = function (playlistURL) {


    PlaylistParty.playlistHandle = Meteor.subscribe("playlist", playlistURL, {
      
      'onReady': function() {
        trackUsernames(playlistURL);
        PlaylistParty.playlistURL = playlistURL;
        PlaylistParty.listID = Playlist.findOne()._id;
        trackItems();
        Session.set("playlistSet", true);
        window.parent.document.title = "Playlist Party - " + Playlist.findOne().name;
        if (Session.get("showCreatePlaylist")) {
          Session.set("showCreatePlaylist", false);
          Session.set("showNewPlaylistAlert", true);  
        }
      },

      'onError': function(error) {
        PlaylistParty.playlistHandle.stop();
        Template.initialPage.errorMessage(error.reason);
        Session.set('checkedURL', true);
      }
    });
  };


  // This function makes Meteor.Users keep the ID and username of all the users 
  // registered to the current playlist. 
  function trackUsernames (playlistURL) {
    Deps.autorun(function () {
      var playlist = Playlist.find({'url': playlistURL}).fetch();
      Meteor.subscribe("allUserData", playlist[0].users);
    });
  }


  // This keeps track of the changes in Playlist.items and makes the reactive "items"
  // array, and the local Items collection, reflect these changes.
  function trackItems () {  
    Playlist.find(PlaylistParty.listID).observeChanges({

      'added': function(id, fields) {
        items = fields.items;
        for (var i = 0, l = items.length; i < l; i++) {
          Items.insert(items[i]);
        }
        itemsDeps.changed();
      },
      
      'changed': function(id, fields) {
        if (_.has(fields, 'items')) {
          var newItemsID = _.pluck(fields.items, 'id');
          var itemsID = _.pluck(items, 'id');
          items = fields.items;

          // find items added, insert in Items collection
          var newID = _.difference(newItemsID, itemsID);
          for (var i = 0, l = newID.length; i < l; i++) {
            Items.insert( _.find(items, function(item) {
              return item.id === newID[i];
            }));
          }

          // find items removed, remove from Items collection
          var removedID = _.difference(itemsID, newItemsID);
          for (var i = removedID.length - 1; i >=0; i--) {
            Items.remove({'id': removedID[i]});
          }

          itemsDeps.changed();
        }
      }

    });
  }

  PlaylistParty.items = function() {
    Deps.depend(itemsDeps);
    return items;
  };


  // This configures the {{loginButtons}} (in the Page template)
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
  });


})();

  