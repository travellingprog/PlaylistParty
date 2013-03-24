////////////////////////////////////////////////////////////////////////////////
// model


(function() {

  //////////////////////////////////////////////////////////////////////////////
  // Collection allowances and denials

  Playlist.allow({
    update: function() { return true; }
  });

  Playlist.deny({
    insert: function() { return true; },
    remove: function() { return true; }
  });

  Meteor.users.deny({update: function () { return true; }});


})();


