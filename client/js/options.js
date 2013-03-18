////////////////////////////////////////////////////////////////////////////////
// options


(function() {


  Template.options.events({
    'click #removeAll': function() {
      Session.set("showRemoveAllWarning", true);
    }
  })


})();