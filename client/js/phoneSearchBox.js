///////////////////////////////////////////////////////////////////////////////
// phoneSearchBox

(function() {

  var template = Template.phoneSearchBox;

  template.rendered = function() {
    $('#phoneSearchField').focus();
  };
  
  template.search = function() {
    Session.set("showPhoneSearch", false);
    Template.search.start('#phoneSearchField'); 
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
  
    'click #phoneSearchCancel' : function() {
      Session.set("showPhoneSearch", false);
    }
  });

})();

