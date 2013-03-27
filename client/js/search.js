///////////////////////////////////////////////////////////////////////////////
// search
//
// Global variables used:
// - Session.keys.searching
// - showTime function (for Soundcloud search results)


(function() {

  /////////////////////////////////////////////////////////////////////////////
  // reactive SearchEngine object

  function SearchEngine (searchFn) {
    this.setDefaultValues();
    this.compFlagDeps = new Deps.Dependency;
    this.navIndexDeps = new Deps.Dependency;
    this.search = searchFn;
  }

  SearchEngine.prototype.setDefaultValues = function() {
    this.compFlag = false;
    this.navIndex = 0;
    this.results = [];
    this.errorMessage = false;
  };

  SearchEngine.prototype.complete = function() {
    Deps.depend(this.compFlagDeps);
    return this.compFlag;
  };

  SearchEngine.prototype.setComplete = function() {
    this.compFlag = true;
    this.compFlagDeps.changed();
  };

  SearchEngine.prototype.index = function() {
    Deps.depend(this.navIndexDeps);
    return this.navIndex;
  };

  SearchEngine.prototype.setIndex = function(newIndex) {
    this.navIndex = newIndex;
    this.navIndexDeps.changed();
  };


  /////////////////////////////////////////////////////////////////////////////
  // Youtube Search


  var ytSearch = function (query) {

    var searchURL = "https://www.googleapis.com/youtube/v3/search";
    var param = {};
    var that = this;
    param["q"] = 'intitle:' + query;
    param["type"] = "video";
    param["key"] = "AIzaSyC9NItPbDx4SdF3DQJn-5dT2fL1qtNACKI";
    param["videoEmbeddable"] = true;
    param["maxResults"] = 50;
    param["part"] = "id, snippet";
    param["fields"] =  "items(id/videoId, ";
    param["fields"] += "snippet(title, thumbnails/default/url))";

    Meteor.http.get(searchURL, {params: param}, function (error, result)  {
      
      that.setComplete();
      if (error) {
        that.errorMessage = result.data.error.message;
        return;
      }

      var resp = result.data.items;
      var item, title, titleIndex, artist;

      for (var i = 0, l = resp.length; i < l; i++) {

        item = resp[i];
        title = item.snippet.title;
        titleIndex = title.indexOf(" - ");
        
        if (titleIndex !== -1) {
          artist = title.substring(0, titleIndex);
          title = title.substring(titleIndex + 3);
        } else {
          artist = "";
        }

        that.results[i] = {
          "artist": artist,
          "title": title,
          "pic": item.snippet.thumbnails.default.url,
          "streamID": item.id.videoId,
          "type": "YouTube",
          "selected": ""
        };
      }
    });
  };


  /////////////////////////////////////////////////////////////////////////////
  // SoundCloud Search

  var scSearch = function (query) {

    var param = {};
    param["q"] = query;
    param["order"] = "hotness";
    param["filter"] = "public, streamable";
    var that = this;


    SC.get('/tracks', param, function(resp, error) {
      
      that.setComplete();
      if (error) {
        that.errorMessage = error.message;
        return;
      }

      for (var i = 0, l = resp.length; i < l; i++) {
        item = resp[i];
        that.results[i] = {
          "artist" : item.user.username,
          "title" : item.title,
          "duration" : showTime(Math.floor(item.duration / 1000)),
          "pic" : (item.artwork_url) ? item.artwork_url : item.waveform_url,
          "streamID": item.permalink_url,
          "type": "SoundCloud",
          "selected": ""
        };
      }
    });
  };


  /////////////////////////////////////////////////////////////////////////////
  // template functions


  var template = Template.search;
  template.query = "";

  template.searchAPI = [
    {
      'name': 'Youtube',
      'homepage': 'http://www.youtube.com',
      'logoImage': '<img src="/YtLogo.png" width="95" height="40"' + 
                   ' alt="Youtube Logo">',
       'engine': new SearchEngine(ytSearch)
    },
    {
      'name': 'SoundCloud',
      'homepage': 'http://www.soundcloud.com',
      'logoImage': '<img src="/ScLogo.png" width="64" height="43"' +
                   ' alt="SoundCloud Logo">',
      'engine': new SearchEngine(scSearch)
    }
  ];


  template.start = function (queryField) {

    // remove any previous search results
    Session.set("searching", false);
    Meteor.flush();
    Template.searchEngine.reset();

    // start the search engines
    this.query = $(queryField).val();
    for (var i = 0, l = template.searchAPI.length; i < l; i++) {
      template.searchAPI[i].engine.setDefaultValues();
      template.searchAPI[i].engine.search(this.query);
    }

    // show the page
    Session.set("searching", true);
    $('#normSearchBtn').tab('show');
    $(queryField).val("");
    window.scrollTo(0,0);
  };


  template.resetSearchEngines = function() {
    for (var i = 0, l = template.searchAPI.length; i < l; i++) {
      template.searchAPI[i].engine.setDefaultValues();
    }    
  };


  template.searching = function() {
    return Session.get("searching");
  };


})();
 