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
    it("add and remove event handlers", function () {
        var fn1 = function () { };
        var fn2 = function () { };
        var target = document.createElement("div");
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
        var fn1Called = false;
        var fn2Called = false;
        var fn1 = function () {
            chai_1.assert(this === view);
            fn1Called = true;
        };
        var fn2 = function () {
            chai_1.assert(this === view);
            fn2Called = true;
        };
        var target = document.createElement("div");
        var set = new ev.EventHandlerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.syncEventHandlers(target);
        target.dispatchEvent(new Event("click"));
        chai_1.assert(fn1Called);
        chai_1.assert(fn2Called);
        fn1Called = false;
        fn2Called = false;
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