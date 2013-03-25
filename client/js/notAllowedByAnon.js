////////////////////////////////////////////////////////////////////////////////
// notAllowedByAnon
//


(function() {


  Template.notAllowedByAnon.events({

    'click .cancel' : function() {
      Session.set("showNotAllowedByAnon", false);
    }

  });


})();