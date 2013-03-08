///////////////////////////////////////////////////////////////////////////////
// phoneSearchBox
//
// Global varibles used here:
// - Session.keys.showPhoneSearch


(function() {

  var template = Template.phoneSearchBox;

  template.rendered = function() {
    $('#phoneSearchField').focus();
  };
  
  template.search = function() {
    Template.search.start('#phoneSearchField');
    Session.set("showPhoneSearch", false); 
  };
  
  template.events({
    'keypress #phoneSearchField' : function(event) {
      if (event.which == 13) {
        template.search();
      }
    },
  
    'click #phoneSearchBtn2' : function() {
      template.search();
    },
  
    'click .cancel' : function() {
      Session.set("showPhoneSearch", false);
    }
  });

})();

