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
var EventHandlerEntry = (function () {
    function EventHandlerEntry(view, type, handler, options) {
        this.view_ = view;
        this.type_ = type;
        this.handler_ = handler;
        this.closure_ = handler.bind(view);
        this.options_ = options;
        this.added_ = true;
        this.target_ = null;
    }
    Object.defineProperty(EventHandlerEntry.prototype, "added", {
        get: function () {
            return this.added_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventHandlerEntry.prototype, "capture", {
        get: function () {
            return isCapture(this.options_);
        },
        enumerable: true,
        configurable: true
    });
    EventHandlerEntry.prototype.match = function (view, type, handler, options) {
        return this.view_ === view
            && this.type_ === type
            && this.handler_ === handler
            && this.capture === isCapture(options);
    };
    EventHandlerEntry.prototype.equals = function (other) {
        return this.view_ === other.view_
            && this.type_ === other.type_
            && this.handler_ === other.handler_
            && this.capture === other.capture;
    };
    EventHandlerEntry.prototype.addEventHandlerTo = function (target) {
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
    EventHandlerEntry.prototype.removeEventHandler = function () {
        if (this.target_) {
            this.target_.removeEventListener(this.type_, this.closure_, this.options_);
            this.target_ = null;
        }
    };
    EventHandlerEntry.prototype.setAddedFlag = function () {
        this.added_ = true;
    };
    EventHandlerEntry.prototype.clearAddedFlag = function () {
        this.added_ = false;
    };
    return EventHandlerEntry;
}());
exports.EventHandlerEntry = EventHandlerEntry;
var EventHandlerSet = (function () {
    function EventHandlerSet() {
        this.entries_ = [];
    }
    EventHandlerSet.prototype.contains = function (view, type, handler, options) {
        return Boolean(this.find(view, type, handler, options));
    };
    EventHandlerSet.prototype.add = function (view, type, handler, options) {
        var found = this.find(view, type, handler, options);
        if (found) {
            found.setAddedFlag();
        }
        else {
            this.entries_.push(new EventHandlerEntry(view, type, handler, options));
        }
    };
    EventHandlerSet.prototype.syncEventHandlers = function (target) {
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
    EventHandlerSet.prototype.find = function (view, type, handler, options) {
        return this.entries_.find(function (e) { return e.match(view, type, handler, options); });
    };
    return EventHandlerSet;
}());
exports.EventHandlerSet = EventHandlerSet;
//# sourceMappingURL=eventHandlerSet.js.map