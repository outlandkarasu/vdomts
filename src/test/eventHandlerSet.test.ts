import {assert} from "chai";

import * as ev from "../eventHandlerSet";
import {View} from "../vdom";

describe("EventHandlerEntry", () => {
    const view: View = {
        tagName: "DIV",
        render(b: any): void {}
    };

    it("compare same entries", () => {
        const fn = () => {};
        const e1 = new ev.EventHandlerEntry(view, "click", fn, true);
        const e2 = new ev.EventHandlerEntry(view, "click", fn, true);

        assert(e1.equals(e2));
    });

    it("compare entries that different event handler", () => {
        const e1 = new ev.EventHandlerEntry(view, "click", () => {}, true);
        const e2 = new ev.EventHandlerEntry(view, "click", () => {}, true);

        assert(!e1.equals(e2));
    });

    it("compare entries that different capture flag", () => {
        const fn = () => {};
        const e1 = new ev.EventHandlerEntry(view, "click", fn, true);
        const e2 = new ev.EventHandlerEntry(view, "click", fn, false);

        assert(!e1.equals(e2));
    });

    it("add event listener", () => {
        const fn = () => {};
        const eventHandlerSet = new ev.EventHandlerSet();
        eventHandlerSet.add(view, "click", fn, false);
        assert(eventHandlerSet.contains(view, "click", fn, false));
    });

    it("add and remove event handlers", () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const target = new EventTarget();
        const set = new ev.EventHandlerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);

        set.syncEventHandlers(target);

        set.add(view, "click", fn1, false);
        //set.add("dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);

        set.syncEventHandlers(target);

        assert(set.contains(view, "click", fn1, false));
        assert(!set.contains(view, "dblclick", fn1, false)); // removed
        assert(set.contains(view, "click", fn1, true));
        assert(set.contains(view, "click", fn2, true));
        assert(set.contains(view, "click", fn2, true));
        assert(set.contains(view, "click", fn2, false));
    });

    it("for each added event listeners", () => {
        let fn1Called = false;
        let fn2Called = false;

        const fn1 = function(this: View): void {
            assert(this === view);
            fn1Called = true;
        };
        const fn2 = function(this: View): void {
            assert(this === view);
            fn2Called = true;
        };

        const target = new EventTarget();
        const set = new ev.EventHandlerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        //set.add(view, "click", fn2, false);

        set.syncEventHandlers(target);

        target.dispatchEvent(new Event("click"));
        assert(fn1Called);
        assert(fn2Called);

        fn1Called = false;
        fn2Called = false;
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);

        assert(set.contains(view, "click", fn1, false));
        assert(set.contains(view, "dblclick", fn1, false));
        assert(set.contains(view, "click", fn1, true));
        assert(set.contains(view, "click", fn2, true));
        assert(set.contains(view, "click", fn2, true));
        assert(set.contains(view, "click", fn2, false));
    });
});

