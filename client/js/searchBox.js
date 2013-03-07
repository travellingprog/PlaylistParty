///////////////////////////////////////////////////////////////////////////////
// searchBox


(function() {

  Template.searchBox.events({
    'keypress #normSearchField' : function(event) {
      if (event.which == 13) {
        Template.search.start('#normSearchField');
        return false;
      }
    },

    'click #normSearchBtn' : function() {
      Template.search.start('#normSearchField');
    },

    'click #phoneSearchBtn' : function() {
      Session.set("showPhoneSearch", true);
    }
  });

})();