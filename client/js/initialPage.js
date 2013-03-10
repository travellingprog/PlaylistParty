////////////////////////////////////////////////////////////////////////////////
// Initial page


(function(){
  
  Template.initialPage.errorMessage = function (reason) {
    var errMsg = '<div class="alert alert-error">';
    errMsg +=    '  <button type="button" class="close" data-dismiss="alert">&times;</button>';
    errMsg +=    '  <strong>Sorry!</strong> '
    errMsg +=        reason;
    errMsg +=    '</div>';
    $('#errorMessage').html(errMsg);
  };

  Template.initialPage.checkedURL = function() {
    return Session.get('checkedURL');
  };

  Template.initialPage.events({
    'click #launchCreation': function() {
      Session.set('showCreatePlaylist', true);
    }
  });

})();