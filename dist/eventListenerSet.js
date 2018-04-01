"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventListenerEntry = (function () {
    function EventListenerEntry(type, listener, options) {
        this.type_ = type;
        this.listener_ = listener;
        this.options_ = options;
    }
    Object.defineProperty(EventListenerEntry.prototype, "capture", {
        get: function () {
            var options = this.options_;
            if (!options) {
                return false;
            }
            else if (options instanceof Object) {
                return Boolean(options.capture);
            }
            else {
                return Boolean(options);
            }
        },
        enumerable: true,
        configurable: true
    });
    EventListenerEntry.prototype.equals = function (other) {
        return this.type_ === other.type_
            && this.listener_ === other.listener_
            && this.capture === other.capture;
    };
    EventListenerEntry.prototype.addTo = function (target) {
        target.addEventListener(this.type_, this.listener_, this.options_);
    };
    EventListenerEntry.prototype.removeFrom = function (target) {
        target.removeEventListener(this.type_, this.listener_, this.options_);
    };
    return EventListenerEntry;
}());
exports.EventListenerEntry = EventListenerEntry;
var EventListenerSet = (function () {
    function EventListenerSet() {
        this.entries_ = [];
    }
    EventListenerSet.prototype.add = function (type, listener, options) {
        this.entries_.push(new EventListenerEntry(type, listener, options));
    };
    EventListenerSet.prototype.find = function (e) {
        for (var _i = 0, _a = this.entries_; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (e.equals(entry)) {
                return true;
            }
        }
        return false;
    };
    EventListenerSet.prototype.eachRemovedEntries = function (newSet, fn) {
        for (var _i = 0, _a = this.entries_; _i < _a.length; _i++) {
            var e = _a[_i];
            if (!newSet || !newSet.find(e)) {
                fn(e);
            }
        }
    };
    EventListenerSet.prototype.eachAddedEntries = function (newSet, fn) {
        if (!newSet) {
            return;
        }
        for (var _i = 0, _a = newSet.entries_; _i < _a.length; _i++) {
            var e = _a[_i];
            if (!this.find(e)) {
                fn(e);
            }
        }
    };
    EventListenerSet.prototype.eachEntries = function (fn) {
        for (var _i = 0, _a = this.entries_; _i < _a.length; _i++) {
            var e = _a[_i];
            fn(e);
        }
    };
    return EventListenerSet;
}());
exports.EventListenerSet = EventListenerSet;
//# sourceMappingURL=eventListenerSet.js.map