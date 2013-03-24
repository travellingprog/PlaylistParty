///////////////////////////////////////////////////////////////////////////////
// searchEngine
//
// Global variables used:
// - Session.keys.searching


(function() {

  //////////////////////////////////////////////////////////////////////////////
  // Reactive Selection object

  function Selection() {
    this.arr = [];
    this.selectionDeps = new Deps.Dependency;
  }

  Selection.prototype.get = function() {
    Deps.depend(this.selectionDeps);
    return this.arr;
  };

  Selection.prototype.length = function() {
    Deps.depend(this.selectionDeps);
    return this.arr.length;
  }; 

  Selection.prototype.add = function(newItem) {
    this.arr.push(newItem);
    this.selectionDeps.changed();
  };

  Selection.prototype.remove = function(item) {
    for (var i = 0, l = this.arr.length; i < l; i++) {
      if (this.arr[i].streamID === item.streamID) {
        this.arr.splice(i, 1);
        break;
      }
    }
    
    if (i === l) return;  // no match, so no change
    this.selectionDeps.changed();
  };

  Selection.prototype.reset = function() {
    this.arr = [];
    this.selectionDeps.changed();
  };



  //////////////////////////////////////////////////////////////////////////////
  // template functions


  // variables shared by all instances of this template
  var template = Template.searchEngine;
  var selection = new Selection();
  

  template.reset = function() {
    selection.reset();
  };


  template.searching = function() {
    return Session.get("searching");
  };


  template.searchComplete = function() {
    return this.engine.complete();
  };


  template.noSearchError = function () {
    return (! this.engine.errorMessage);
  };


  template.someResult = function() {
    var resultsLength = this.engine.results.length;
    return (resultsLength === 0) ? false : true;
  };
  

  template.result = function () {
    var resultsLength = this.engine.results.length;
    var startIndex = this.engine.index();
    var endIndex = startIndex + 5;
    if (resultsLength < endIndex) endIndex = resultsLength;
    return this.engine.results.slice(startIndex, endIndex);
  };

  
  template.description = function() {
    var result = '';
    if (this.artist)   result += this.artist + '<br>';
    if (this.title)    result += '<strong>' + this.title + '</strong><br>';
    if (this.duration) result += this.duration + '<br>';
    return result;
  };


  template.hideAdd = function () {
    if (selection.length() > 0) return "hidden";
    return "";
  };


  template.SelectOrUnselect = function() {
    if (this.selected === "") return "Select";
    return "Unselect";
  };


  template.errorMsg = function() {
    return this.engine.errorMessage;
  };


  template.disablePrev = function () {
    if (this.engine.index() === 0) return "disabled";
    return "";
  };


  template.disableNext = function () {
    if ((this.engine.index() + 5) >= this.engine.results.length) return "disabled";
    return "";
  };


  template.hideMultSel = function () {
    if (selection.length() === 0) return "hidden";
    return "";
  };


  template.selNum = function() {
    return selection.length();
  };


  template.events({

    // searchEngine context

    'click .prev' : function() {
      if (this.engine.index() === 0) return;
      this.engine.setIndex(this.engine.index() - 5);
      scrollToLogo(this.name);
    },


    'click .next' : function() {
      if ( (this.engine.index() + 5) >= this.engine.results.length ) return;
      this.engine.setIndex(this.engine.index() + 5);
      scrollToLogo(this.name);
    },


    'click .addSelection' : function() {;
      var sel = selection.get();      
      for (var i = 0, l = sel.length; i < l; i++){
        insertItem(sel[i]);
      }
      closeSearch();
    },


    'click .cancel': function() {
      closeSearch();
    },



    // results context

    'click .addItem' : function() {
      insertItem(this);
      closeSearch();
    },


    'click .selectItem' : function(e) {

      if (this.selected === "") 
      {
        this.selected = "selected";  
        selection.add(this);
        $(e.target.parentElement).addClass("selected");
        $(e.target).text("Unselect");
      } 
      else 
      {
        selection.remove(this);
        this.selected = "";      
        $(e.target.parentElement).removeClass("selected");
        $(e.target).text("Select");
      }
    }
  });


  var scrollToLogo = function(name) {
      var logoPos = $('#logo' + name).offset().top;
      var topPos = $('#searchTop').offset().top;
      $('html, body').scrollTop(logoPos - topPos);
  };


  var insertItem = function(item) {
    Playlist.update(
    PlaylistParty.listID,
    {
      $push: 
      { 
        'items':
        {
          "type" : item.type,
          "streamID" : item.streamID,
          "artist": item.artist,
          "title": item.title,
          "pic": item.pic,
          "addedBy": Meteor.userId() || '',
          "id": (new Meteor.Collection.ObjectID()).toHexString()
        }
      }
    },
    function (error) {
      if (error) alert(error);
    });
    if (Meteor.user()) {
      // Set this playlist as the first one in the user's profile
      var myPlaylists = Meteor.user().profile.playlists;
      if (myPlaylists[0] === PlaylistParty.listID) return;
      myPlaylists = _.without(myPlaylists, PlaylistParty.listID);
      myPlaylists.splice(0,0,PlaylistParty.listID);
      myPlaylists = _.first(myPlaylists, 20);
      Meteor.users.update(Meteor.userId(), 
                          {$set: {'profile.playlists': myPlaylists}});
    }
  };


  var closeSearch = function() {
    $('#deskMenu .active').tab("show");
    $(window).scrollTop(PlaylistParty.previousScrollTop);
    selection.reset();
    Session.set("searching", false);
    Template.search.resetSearchEngines();
  };


})();