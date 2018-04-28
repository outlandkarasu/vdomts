"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var ev = require("../eventListenerSet");
describe("EventListenerEntry", function () {
    var view = {
        tagName: "DIV",
        render: function (b) { }
    };
    it("compare same entries", function () {
        var fn = function () { };
        var e1 = new ev.EventListenerEntry(view, "click", fn, true);
        var e2 = new ev.EventListenerEntry(view, "click", fn, true);
        chai_1.assert(e1.equals(e2));
    });
    it("compare entries that different event handler", function () {
        var e1 = new ev.EventListenerEntry(view, "click", function () { }, true);
        var e2 = new ev.EventListenerEntry(view, "click", function () { }, true);
        chai_1.assert(!e1.equals(e2));
    });
    it("compare entries that different capture flag", function () {
        var fn = function () { };
        var e1 = new ev.EventListenerEntry(view, "click", fn, true);
        var e2 = new ev.EventListenerEntry(view, "click", fn, false);
        chai_1.assert(!e1.equals(e2));
    });
    it("add event listener", function () {
        var fn = function () { };
        var eventListenerSet = new ev.EventListenerSet();
        eventListenerSet.add(view, "click", fn, false);
        chai_1.assert(eventListenerSet.contains(view, "click", fn, false));
    });
    it("for each removed event listeners", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var target = new EventTarget();
        var set = new ev.EventListenerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);
        set.syncHandlers(target);
        set.add(view, "click", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);
        set.syncHandlers(target);
        chai_1.assert(set.contains(view, "click", fn1, false));
        chai_1.assert(!set.contains(view, "dblclick", fn1, false));
        chai_1.assert(set.contains(view, "click", fn1, true));
        chai_1.assert(set.contains(view, "click", fn2, true));
        chai_1.assert(set.contains(view, "click", fn2, true));
        chai_1.assert(set.contains(view, "click", fn2, false));
    });
    it("for each added event listeners", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var target = new EventTarget();
        var set = new ev.EventListenerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.syncHandlers(target);
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);
        chai_1.assert(set.contains(view, "click", fn1, false));
        chai_1.assert(set.contains(view, "dblclick", fn1, false));
        chai_1.assert(set.contains(view, "click", fn1, true));
        chai_1.assert(set.contains(view, "click", fn2, true));
        chai_1.assert(set.contains(view, "click", fn2, true));
        chai_1.assert(set.contains(view, "click", fn2, false));
    });
});
//# sourceMappingURL=eventListenerSet.test.js.map