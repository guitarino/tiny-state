var createState = function(global) {
  'use strict';

  // Trying not to pollute the namespace
  var sub = 'Symbol' in global ? global.Symbol() : '_subscribers' + Math.random();

  // This will allow us to call hOP on object that don't inherit Object.prototype
  var hOP = Object.prototype.hasOwnProperty;

  var State = function(iState) {
    Object.defineProperty(this, sub, {value: []}); // should not show up in for(..in..) loop, or be removable
    for(var key in iState) {
      if(hOP.call(iState, key)) {
        this[key] = iState[key];
      }
    }
  };

  // The reason for defineProperty is to make it non-configurable
  // So that rewrites will throw error
  Object.defineProperty(State.prototype, 'subscribe', {value: function(subscriber) {
    this[sub].push(subscriber);
  }});

  Object.defineProperty(State.prototype, 'unsubscribe', {value: function(subscriber) {
    var id = this[sub].indexOf(subscriber);
    if(~id) {
      this[sub].splice(id, 1);
    }
    else {
      console.warn("Not subscribed to this object's handleUpdate / function.. check if it's bound..");
    }
  }});

  Object.defineProperty(State.prototype, 'change', {value: function(changeState) {
    changeState(this);
    for(var i=0; i<this[sub].length; i++) {
      var subscriber = this[sub][i];
      if('handleUpdate' in subscriber) {
        subscriber.handleUpdate(this);
      }
      else {
        subscriber(this);
      }
    }
  }});

  return function createState(iState) {
    if(typeof iState === 'object' && iState !== null) {
      return new State(iState);
    } else {
      if(iState !== undefined) {
        console.warn('Should either not have arguments or an object with initial state. Ignoring argument.');
      }
      return new State({});
    }
  };
}(window || global);

try { module.exports = createState } catch(oops) { }