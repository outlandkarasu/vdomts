"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Action = (function () {
    function Action(param) {
        var p = {};
        for (var _i = 0, _a = Object.keys(param); _i < _a.length; _i++) {
            var k = _a[_i];
            p[k] = param[k];
        }
        this.param = p;
    }
    return Action;
}());
exports.Action = Action;
var ReducerEntry = (function () {
    function ReducerEntry(reducer, callReducer) {
        this.reducer = reducer;
        this.callReducer = callReducer;
    }
    return ReducerEntry;
}());
var Store = (function () {
    function Store(state) {
        this.reducers_ = [];
        this.subscribers_ = [];
        this.state_ = state;
    }
    Object.defineProperty(Store.prototype, "state", {
        get: function () {
            return this.state_;
        },
        enumerable: true,
        configurable: true
    });
    Store.prototype.addReducer = function (ctor, reducer) {
        var _this = this;
        if (this.reducers_.some(function (e) { return e.reducer === reducer; })) {
            return this;
        }
        var callReducer = function (a) {
            if (a instanceof ctor) {
                _this.state_ = reducer(_this.state_, a);
                return true;
            }
            return false;
        };
        this.reducers_.push(new ReducerEntry(reducer, callReducer));
        return this;
    };
    Store.prototype.doAction = function (action) {
        var called = false;
        for (var _i = 0, _a = this.reducers_; _i < _a.length; _i++) {
            var r = _a[_i];
            if (r.callReducer(action)) {
                called = true;
            }
        }
        if (called) {
            for (var _b = 0, _c = this.subscribers_; _b < _c.length; _b++) {
                var s = _c[_b];
                try {
                    s(this);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        return called;
    };
    Store.prototype.subscribe = function (subscriber) {
        if (!this.subscribers_.some(function (e) { return e === subscriber; })) {
            this.subscribers_.push(subscriber);
        }
    };
    Store.prototype.unsubscribe = function (subscriber) {
        var index = this.subscribers_.findIndex(function (e) { return e === subscriber; });
        if (index === -1) {
            return false;
        }
        this.subscribers_.splice(index, 1);
        return true;
    };
    return Store;
}());
exports.Store = Store;
//# sourceMappingURL=store.js.map