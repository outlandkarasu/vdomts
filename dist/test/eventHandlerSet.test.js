"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var ev = require("../eventHandlerSet");
describe("EventHandlerEntry", function () {
    var view = {
        tagName: "DIV",
        render: function (b) { }
    };
    it("compare same entries", function () {
        var fn = function () { };
        var e1 = new ev.EventHandlerEntry(view, "click", fn, true);
        var e2 = new ev.EventHandlerEntry(view, "click", fn, true);
        chai_1.assert(e1.equals(e2));
    });
    it("compare entries that different event handler", function () {
        var e1 = new ev.EventHandlerEntry(view, "click", function () { }, true);
        var e2 = new ev.EventHandlerEntry(view, "click", function () { }, true);
        chai_1.assert(!e1.equals(e2));
    });
    it("compare entries that different capture flag", function () {
        var fn = function () { };
        var e1 = new ev.EventHandlerEntry(view, "click", fn, true);
        var e2 = new ev.EventHandlerEntry(view, "click", fn, false);
        chai_1.assert(!e1.equals(e2));
    });
    it("add event listener", function () {
        var fn = function () { };
        var eventHandlerSet = new ev.EventHandlerSet();
        eventHandlerSet.add(view, "click", fn, false);
        chai_1.assert(eventHandlerSet.contains(view, "click", fn, false));
    });
    it("for each removed event listeners", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var target = new EventTarget();
        var set = new ev.EventHandlerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);
        set.syncEventHandlers(target);
        set.add(view, "click", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);
        set.syncEventHandlers(target);
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
        var set = new ev.EventHandlerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.syncEventHandlers(target);
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
//# sourceMappingURL=eventHandlerSet.test.js.map