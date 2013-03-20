////////////////////////////////////////////////////////////////////////////////
// model


(function() {

  //////////////////////////////////////////////////////////////////////////////
  // Collection allowances and denials

  Items.allow({
    insert: function (userId, item) {
      return true;
    },
    remove: function (userId, item) {
      return true;
    }
  });

  Items.deny({update: function () { return true; }});

  Playlist.deny({
    insert: function() { return true; },
    update: function() { return true; },
    remove: function() { return true; }
  });

  Meteor.users.deny({update: function () { return true; }});


})();


