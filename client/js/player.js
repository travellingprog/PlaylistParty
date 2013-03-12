///////////////////////////////////////////////////////////////////////////////
// Player 
//
// Global variables used:
// - boombox
// - Items collection


(function() {


///////////////////////////////////////////////////////////////////////////////
// player template functions


  var template = Template.player;

  template.created = function() {
    this.newItem = true;
  };

  template.rendered = function() {
    if (this.newItem) {
      boombox.itemAdded(this.data);
      this.newItem = false;
    }
  };

  template.isCurrent = function () {
    return (this._id === boombox.curPlayerID()) ? 'current' : '';
  };

  template.trackNo = function() {
    return Items.find({seqNo: {$lte: this.seqNo}}).count();
  };

  template.description = function() {
    var result = '';
    if (this.artist)   result += this.artist + '<br>';
    if (this.title)    result += '<strong>' + this.title + '</strong><br>';
    return result;
  };

  template.myItem = function () {
    return (this.addedBy === 'user1');
  };

  template.events({
    'click button.remItem' : function () {
      boombox.removeItem(this);
    },

    'click a.pic' : function() {
      boombox.clickedPicture(this);
      return false;
    }
  });


})();