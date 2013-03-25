////////////////////////////////////////////////////////////////////////////////
// options


(function() {


  Template.options.events({
    'click .question': function(e) {
      e.preventDefault();
      var newOffset = $(e.currentTarget).offset().top - $('#options h2').offset().top;
      $(e.currentTarget).parent().next('.answer').toggle(400, function () {
        $('html, body').animate({scrollTop: newOffset}, 400);
      });
    },

    'click #removeAllMine': function() {
      Template.removeAllWarning.setType("myItems");
      Session.set("showRemoveAllWarning", true);
    },

    'click #removeAllAnon': function() {
      Template.removeAllWarning.setType("anonItems");
      Session.set("showRemoveAllWarning", true);
    }
  })


})();