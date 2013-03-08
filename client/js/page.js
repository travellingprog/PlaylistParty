///////////////////////////////////////////////////////////////////////////////
// page Template
//
// Global varibles used here:
// - Session.keys.showPhoneSearch


(function () {

  Template.page.showPhoneSearch = function() {
    return Session.get("showPhoneSearch");
  };

})();

