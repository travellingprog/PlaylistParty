///////////////////////////////////////////////////////////////////////////////
// Player 
//
// Global variables used:
// - boombox


(function() {


///////////////////////////////////////////////////////////////////////////////
// player template functions

  var boombox = PlaylistParty.boombox;

  var template = Template.player;

  template.created = function() {
    this.newItem = true;
  };

  template.rendered = function() {
    if (this.newItem) {
      $('#' + this.data.id).replaceWith('<div id="' + this.data.id + '"></div>');
      $('#' + this.data.id).html('<a class="pic" href="/"><img src="' + this.data.pic +'" width="232px"></a>');
      boombox.playerAdded(this.data.id);
      this.newItem = false;
    }
  };

  template.destroyed = function() {
    boombox.playerDestroyed(this.data.id);
  };

  template.isCurrentFrame = function () {
    return (this.id === boombox.curFrameID()) ? 'current' : '';
  };

  template.trackNo = function() {
    var items = Playlist.find().fetch()[0].items;
    return (_.pluck(items, 'id')).indexOf(this.id) + 1;
  };

  template.description = function() {
    var result = '';
    if (this.artist)   result += this.artist + '<br>';
    if (this.title)    result += '<strong>' + this.title + '</strong><br>';
    return result;
  };

  template.username = function() {
    var result = '';
    if (this.addedBy) {
      var user = Meteor.users.findOne(this.addedBy);
      if (user)  result += '<span class="userID">' + user.username + '</span>';
    }
    else {
      result += '<span class="anon">anonymous</span>';
    }
    return result;
  };

  template.myItem_Or_AnonymousItem = function () {
    return ((this.addedBy === Meteor.userId()) || (this.addedBy === ''));
  };

  template.unliked = function() {
    var item = _.find(PlaylistParty.items(), function (thisItem) {
      return thisItem.id === this.id;
    }, this);

    return item ?  (! _.contains(item.likes, Meteor.userId())) : false;
  };

  template.likesCount = function() {
    var item = _.find(PlaylistParty.items(), function (thisItem) {
      return thisItem.id === this.id;
    }, this);

    return item ? item.likes.length : 0;
  };

  template.events({
    'click button.remItem' : function () {
      boombox.removeItem(this);
    },

    'click a.pic' : function(e) {
      e.preventDefault();
      boombox.clickedPicture(this.id);
    },

    'click .toggleLike': function() {
      Meteor.call('toggleLike', PlaylistParty.listID, this.id, function (error) {
        if (error) alert(error.reason);
      });
      boombox.updateMyPlaylists();
    }
  });


})();