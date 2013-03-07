///////////////////////////////////////////////////////////////////////////////
// searchEngine
//
// Global variables used:
// - Session.keys.searching
// - ReactiveData function
// - Items Collection


(function() {

  //////////////////////////////////////////////////////////////////////////////
  // Reactive Selection object

  function Selection() {
    this.arr = [];
  }

  Selection.prototype = new ReactiveData();

  Selection.prototype.get = function() {
    this.readingData(Meteor.deps.Context.current, 'selection');
    return this.arr;
  };

  Selection.prototype.length = function() {
    this.readingData(Meteor.deps.Context.current, 'selection');
    return this.arr.length;
  }; 

  Selection.prototype.add = function(newItem) {
    this.arr.push(newItem);
    this.changedData('selection');
  };

  Selection.prototype.remove = function(item) {
    for (var i = 0, l = this.arr.length; i < l; i++) {
      if (this.arr[i].streamID === item.streamID) {
        this.arr.splice(i, 1);
        break;
      }
    }
    
    if (i === l) return;  // no match, so no change
    this.changedData('selection');
  };

  Selection.prototype.reset = function() {
    this.arr = [];
    this.changedData('selection');
  };

  Selection.prototype.constructor = Selection;


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
  

  template.result = function () {
    var resultsLength = this.engine.results.length;
    if (resultsLength === 0) return;
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
      scrollToLogo();
    },


    'click .next' : function() {
      if ( (this.engine.index() + 5) >= this.engine.results.length ) return;
      this.engine.setIndex(this.engine.index() + 5);
      scrollToLogo();
    },


    'click .addSelection' : function() {;
      var newSeqNo = getNewSeqNo();
      var sel = selection.get();
      
      for (var i = 0, l = sel.length; i < l; i++){
        insertItem(sel[i], newSeqNo);
        newSeqNo++;
      }
      closeSearch();
    },


    'click .cancel': function() {
      closeSearch();
    },



    // results context

    'click .addItem' : function() {
      var newSeqNo = getNewSeqNo();
      insertItem(this, newSeqNo);
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


  var scrollToLogo = function() {
      var logoPos = $('#logo' + this.name).offset().top;
      var topPos = $('#searchTop').offset().top;
      $('html, body').scrollTop(logoPos - topPos);
  };


  var getNewSeqNo = function() {
    if (! Items.findOne({})) {
      return 1;
    } else {
      return parseInt(Items.findOne({},{sort: {seqNo: -1}}).seqNo) + 1;
    }
  };


  var insertItem = function(item, seqNo) {
    Items.insert({
      "playlistID" : testList, 
      "type" : item.type, 
      "streamID" : item.streamID,
      "artist": item.artist,
      "title": item.title,
      "seqNo" : parseFloat(seqNo + "." + (new Date()).getTime()), 
      "addedBy" : "user1"
    });
  };


  var closeSearch = function() {
    $('#deskMenu .active').tab("show");
    selection.reset();
    Session.set("searching", false);
    Template.search.resetSearchEngines();
  };


})();