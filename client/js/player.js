///////////////////////////////////////////////////////////////////////////////
// Player 
//
// Global variables used:
// - boombox
// - Items collection


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
      $('#' + this.data._id).replaceWith('<div id="' + this.data._id + '"></div>');
      $('#' + this.data._id).html('<a class="pic" href="/"><img src="' + this.data.pic +'" width="232px"></a>');
      boombox.itemAdded(this.data);
      this.newItem = false;
    }
  };

  template.isCurrentFrame = function () {
    return (this._id === boombox.curFrameID()) ? 'current' : '';
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

    'click a.pic' : function(e) {
      e.preventDefault();
      boombox.clickedPicture(this);
    }
  });


})();