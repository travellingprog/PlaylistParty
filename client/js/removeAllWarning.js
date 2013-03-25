////////////////////////////////////////////////////////////////////////////////
// removeAllWarning
//


(function() {

  Template.removeAllWarning.type = "myItems";


  Template.removeAllWarning.setType = function(type) {
    Template.removeAllWarning.type = type;
  };


  Template.removeAllWarning.message = function() {
    var message = 'Are you sure that you want to remove all ';
    if (Template.removeAllWarning.type === "myItems") {
      message += 'your';  
    }
    else if (Template.removeAllWarning.type === "anonItems") {
      message += 'anonymous';  
    }
    message += ' items from the playlist?'
    return message;
  };



  Template.removeAllWarning.events({

    'click .btn-primary': function() {
      if (Template.removeAllWarning.type === "myItems") {
        var itemsToRemove = _.where(Playlist.findOne().items, {addedBy: Meteor.userId()});  
      }
      else if (Template.removeAllWarning.type === "anonItems") {
        itemsToRemove = _.where(Playlist.findOne().items, {addedBy: ''});  
      }

      for (var i = itemsToRemove.length - 1; i >= 0; i--) {
        PlaylistParty.boombox.removeItem(itemsToRemove[i]);
      };

      // This is for a bug that causes the "Grid" button to become the active button
      // after tracks have been deleted.
      setTimeout(function() {
        $('#deskMenu .btn[data-target="#option"]').click()
      }, 500);
      
      Session.set("showRemoveAllWarning", false);
    },

    'click .cancel' : function() {
      Session.set("showRemoveAllWarning", false);
    }

  });


})();