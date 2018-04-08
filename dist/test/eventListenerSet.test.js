"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var ev = require("../eventListenerSet");
describe("EventListenerEntry", function () {
    it("compare same entries", function () {
        var fn = function () { };
        var e1 = new ev.EventListenerEntry("click", fn, true);
        var e2 = new ev.EventListenerEntry("click", fn, true);
        chai_1.assert(e1.equals(e2));
    });
    it("compare entries that different event handler", function () {
        var e1 = new ev.EventListenerEntry("click", function () { }, true);
        var e2 = new ev.EventListenerEntry("click", function () { }, true);
        chai_1.assert(!e1.equals(e2));
    });
    it("compare entries that different capture flag", function () {
        var fn = function () { };
        var e1 = new ev.EventListenerEntry("click", fn, true);
        var e2 = new ev.EventListenerEntry("click", fn, false);
        chai_1.assert(!e1.equals(e2));
    });
    it("add event listener", function () {
        var fn = function () { };
        var eventListenerSet = new ev.EventListenerSet();
        eventListenerSet.add("click", fn, false);
        chai_1.assert(eventListenerSet.find(new ev.EventListenerEntry("click", fn, false)));
    });
    it("for each removed event listeners", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var set1 = new ev.EventListenerSet();
        set1.add("click", fn1, false);
        set1.add("dblclick", fn1, false);
        set1.add("click", fn1, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, false);
        var set2 = new ev.EventListenerSet();
        set2.add("click", fn1, false);
        set2.add("click", fn1, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, false);
        var removed = undefined;
        set1.eachRemovedEntries(set2, function (e) {
            removed = e;
        });
        chai_1.assert(removed, "not removed");
        if (removed) {
            chai_1.assert(removed.equals(new ev.EventListenerEntry("dblclick", fn1, false)));
        }
    });
    it("for each added event listeners", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var set1 = new ev.EventListenerSet();
        set1.add("click", fn1, false);
        set1.add("dblclick", fn1, false);
        set1.add("click", fn1, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, true);
        var set2 = new ev.EventListenerSet();
        set2.add("click", fn1, false);
        set2.add("dblclick", fn1, false);
        set2.add("click", fn1, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, false);
        var added = undefined;
        set1.eachAddedEntries(set2, function (e) {
            added = e;
        });
        chai_1.assert(added, "not added");
        if (added) {
            chai_1.assert(added.equals(new ev.EventListenerEntry("click", fn2, false)));
        }
    });
    it("undefined new set", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var set1 = new ev.EventListenerSet();
        set1.add("click", fn1, false);
        set1.add("dblclick", fn1, false);
        set1.add("click", fn1, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, false);
        var count = 0;
        set1.eachRemovedEntries(null, function (e) { return ++count; });
        chai_1.assert.equal(count, 6);
        count = 0;
        set1.eachAddedEntries(null, function (e) { return ++count; });
        chai_1.assert.equal(count, 0);
    });
});
//# sourceMappingURL=eventListenerSet.test.js.map