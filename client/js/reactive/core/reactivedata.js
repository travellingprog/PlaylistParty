///////////////////////////////////////////////////////////////////////////////
// ReactiveData:
// Object to inherit to make a Meteor reactive data source

(function() {

  window.ReactiveData = function () {
    this.listeners = {};
  };

  ReactiveData.prototype.readingData = function (context, property) {
    if (! context) return;

    if (! this.listeners[property]) this.listeners[property] = {};

    if (! this.listeners[property][context.id]) {
      this.listeners[property][context.id] = context;
      var self = this;
      context.onInvalidate(function() {
        delete self.listeners[property][context.id];
      });
    }
  };

  ReactiveData.prototype.changedData = function (property) {
    for (var contextID in this.listeners[property]) {
      if (this.listeners[property].hasOwnProperty(contextID)) {
        this.listeners[property][contextID].invalidate();
      }
    }
  };

})();