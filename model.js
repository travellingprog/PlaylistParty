////////////////////////////////////////////////////////////////////////////////
// model


(function() {

  //////////////////////////////////////////////////////////////////////////////
  // Collection allowances and denials

  // allow correct insertion of items
  Playlist.allow({
    update: function(userID, doc, fieldNames, modifier) {

      // check that this is only an array addition
      if (_.size(modifier) !== 1) return false;
      if (! _.has(modifier, '$push')) return false;
      
      // check that it's a single addition to items
      var mod = modifier['$push'];      
      if (_.size(mod) !== 1) return false;
      if (! _.has(mod, 'items')) return false;

      // check that the type makes sense
      mod = mod.items;
      if (! _.contains(['YouTube', 'SoundCloud'], mod.type)) return false;

      // check that this user is allowed to add to this playlist
      if ((! userID) && (doc.type !== 'anonymous')) return false;

      // check that the addedBy field matches the userID
      if ((! userID) && (mod.addedBy !== '')) return false;
      if ((userID) && (mod.addedBy !== userID)) return false;

      // if it all checks out, return true
      return true;
    },

    fetch: ['type']
  });


  // allow correct deletion of items
  Playlist.allow({
    update: function(userID, doc, fieldNames, modifier) {

      // check that this is only an array deletion
      if (_.size(modifier) !== 1) return false;
      if (! _.has(modifier, '$pull')) return false;
      
      // check that it's a single deletion to items
      var mod = modifier['$pull'];      
      if (_.size(mod) !== 1) return false;
      if (! _.has(mod, 'items')) return false;

      // if this user is a playlist owner, allow deletion now
      if (_.contains(doc.owner, userID)) return true;

      // if not, check if this item is anononymous 
      // or belongs to this user
      mod = mod.items;
      if (mod.addedBy === '') return true;
      if (mod.addedBy === userID) return true;

      // else, disallow item deletion
      return false;
    }
  });


  // deny any insertion or removal of playlist documents from the client-side
  Playlist.deny({
    insert: function() { return true; },
    remove: function() { return true; }
  });

  // Meteor.users.deny({update: function () { return true; }});


})();


