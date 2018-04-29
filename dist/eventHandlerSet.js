"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isCapture(options) {
    if (!options) {
        return false;
    }
    else if (options instanceof Object) {
        return Boolean(options.capture);
    }
    else {
        return Boolean(options);
    }
}
var EventListenerEntry = (function () {
    function EventListenerEntry(view, type, handler, options) {
        this.view_ = view;
        this.type_ = type;
        this.handler_ = handler;
        this.closure_ = handler.bind(view);
        this.options_ = options;
        this.added_ = true;
        this.target_ = null;
    }
    Object.defineProperty(EventListenerEntry.prototype, "added", {
        get: function () {
            return this.added_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventListenerEntry.prototype, "capture", {
        get: function () {
            return isCapture(this.options_);
        },
        enumerable: true,
        configurable: true
    });
    EventListenerEntry.prototype.match = function (view, type, handler, options) {
        return this.view_ === view
            && this.type_ === type
            && this.handler_ === handler
            && this.capture === isCapture(options);
    };
    EventListenerEntry.prototype.equals = function (other) {
        return this.view_ === other.view_
            && this.type_ === other.type_
            && this.handler_ === other.handler_
            && this.capture === other.capture;
    };
    EventListenerEntry.prototype.addEventHandlerTo = function (target) {
        if (this.target_) {
            if (this.target_ === target) {
                return;
            }
            else {
                this.removeEventHandler();
            }
        }
        this.target_ = target;
        this.target_.addEventListener(this.type_, this.closure_, this.options_);
    };
    EventListenerEntry.prototype.removeEventHandler = function () {
        if (this.target_) {
            this.target_.removeEventListener(this.type_, this.closure_, this.options_);
            this.target_ = null;
        }
    };
    EventListenerEntry.prototype.setAddedFlag = function () {
        this.added_ = true;
    };
    EventListenerEntry.prototype.clearAddedFlag = function () {
        this.added_ = false;
    };
    return EventListenerEntry;
}());
exports.EventListenerEntry = EventListenerEntry;
var EventListenerSet = (function () {
    function EventListenerSet() {
        this.entries_ = [];
    }
    EventListenerSet.prototype.contains = function (view, type, handler, options) {
        return Boolean(this.find(view, type, handler, options));
    };
    EventListenerSet.prototype.add = function (view, type, handler, options) {
        var found = this.find(view, type, handler, options);
        if (found) {
            found.setAddedFlag();
        }
        else {
            this.entries_.push(new EventListenerEntry(view, type, handler, options));
        }
    };
    EventListenerSet.prototype.syncHandlers = function (target) {
        var newEntries = [];
        for (var _i = 0, _a = this.entries_; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.added) {
                newEntries.push(e);
                e.addEventHandlerTo(target);
            }
            else {
                e.removeEventHandler();
            }
            e.clearAddedFlag();
        }
        this.entries_ = newEntries;
    };
    EventListenerSet.prototype.find = function (view, type, handler, options) {
        return this.entries_.find(function (e) { return e.match(view, type, handler, options); });
    };
    return EventListenerSet;
}());
exports.EventListenerSet = EventListenerSet;
//# sourceMappingURL=eventHandlerSet.js.map