Playlist = new Meteor.Collection("playlist");

Items = new Meteor.Collection("items");

Items.allow({
  insert: function (userId, item) {
    return true;
  },
  remove: function (userId, item) {
    return true;
  }
});