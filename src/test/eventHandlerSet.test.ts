import {assert} from "chai";

import * as ev from "../eventHandlerSet";

describe("EventHandlerEntry", () => {
    const view = {
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

    it("for each removed event listeners", () => {
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
        const fn1 = () => {};
        const fn2 = () => {};
        const target = new EventTarget();
        const set = new ev.EventHandlerSet();
        set.add(view, "click", fn1, false);
        set.add(view, "dblclick", fn1, false);
        set.add(view, "click", fn1, true);
        set.add(view, "click", fn2, true);
        set.add(view, "click", fn2, true);
        //set.add(view, "click", fn2, false);

        set.syncEventHandlers(target);

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

