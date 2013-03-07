///////////////////////////////////////////////////////////////////////////////
// phoneMenu template

(function() {

  var template = Template.phoneMenu;

  template.disableLink = function(element) {
    $(element).addClass('disabled').siblings().removeClass('disabled');
  };

  template.shuffleStatus = function () {
    return Session.get("shuffle") ? "ON" : "off";     // maybe change
  };


  template.loopStatus = function () {
    return Session.get("loop") ? "ON" : "off";        // maybe change
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


    'click .shuffle' : function() {
      Session.set("shuffle", ! Session.get("shuffle")); // maybe change
      return false;
    },


    'click .loop' : function() {
      Session.set("loop", ! Session.get("loop")); // maybe change
      return false;
    }
  });


})();

