import {assert} from "chai";

import * as ev from "../eventHandlerSet";

describe("EventListenerEntry", () => {
    const view = {
        tagName: "DIV",
        render(b: any): void {}
    };

    it("compare same entries", () => {
        const fn = () => {};
        const e1 = new ev.EventListenerEntry(view, "click", fn, true);
        const e2 = new ev.EventListenerEntry(view, "click", fn, true);

        assert(e1.equals(e2));
    });

    it("compare entries that different event handler", () => {
        const e1 = new ev.EventListenerEntry(view, "click", () => {}, true);
        const e2 = new ev.EventListenerEntry(view, "click", () => {}, true);

        assert(!e1.equals(e2));
    });

    it("compare entries that different capture flag", () => {
        const fn = () => {};
        const e1 = new ev.EventListenerEntry(view, "click", fn, true);
        const e2 = new ev.EventListenerEntry(view, "click", fn, false);

        assert(!e1.equals(e2));
    });

    it("add event listener", () => {
        const fn = () => {};
        const eventListenerSet = new ev.EventListenerSet();
        eventListenerSet.add(view, "click", fn, false);
        assert(eventListenerSet.contains(view, "click", fn, false));
    });

    it("for each removed event listeners", () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const target = new EventTarget();
        const set = new ev.EventListenerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);

        set.syncHandlers(target);

        set.add(view, "click", fn1, false);
        //set.add("dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, false);

        set.syncHandlers(target);

        assert(set.contains(view, "click", fn1, false));
        assert(!set.contains(view, "dblclick", fn1, false)); // removed
        assert(set.contains(view, "click", fn1, true));
        assert(set.contains(view, "click", fn2, true));
        assert(set.contains(view, "click", fn2, true));
        assert(set.contains(view, "click", fn2, false));
    });

    it("for each added event listeners", () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const target = new EventTarget();
        const set = new ev.EventListenerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        //set.add(view, "click", fn2, false);

        set.syncHandlers(target);

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

