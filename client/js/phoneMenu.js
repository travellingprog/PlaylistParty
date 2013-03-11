///////////////////////////////////////////////////////////////////////////////
// phoneMenu
//
// Global variables used here:
// - boombox
// - Session.keys.showInvite



(function() {

  var template = Template.phoneMenu;

  template.disableLink = function(element) {
    $(element).addClass('disabled').siblings().removeClass('disabled');
  };

  template.shuffleStatus = function () {
    return boombox.onShuffle() ? "ON" : "off";
  };


  template.loopStatus = function () {
    return boombox.onLoop() ? "ON" : "off";
  };


  template.events({
    'click a.tabLink' : function(e) {
      // disable this link, open the corresponding tab
      template.disableLink(e.target.parentElement);
      

      $('#phoneMenuDD').dropdown('toggle');
      // ^ menu stays open without this

      $('#deskMenu .btn[data-target="' + e.target.dataset.target + '"]').click();
      return false;
    },

    'click a.invite' : function() {
      Session.set("showInvite", true);
      return false;
    },

    'click button.invite' : function() {
      Session.set("showInvite", true);
    },


    'click .shuffle' : function() {
      boombox.toggleShuffle();
      $('#phoneMenuDD').dropdown('toggle');
      return false;
    },


    'click .loop' : function() {
      boombox.toggleLoop();
      $('#phoneMenuDD').dropdown('toggle');
      return false;
    }
  });


})();

