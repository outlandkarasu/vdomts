import {assert} from "chai";

import * as ev from "../eventListenerSet";

describe("EventListenerEntry", () => {
    it("compare same entries", () => {
        const fn = () => {};
        const e1 = new ev.EventListenerEntry("click", fn, true);
        const e2 = new ev.EventListenerEntry("click", fn, true);

        assert(e1.equals(e2));
    });

    it("compare entries that different event handler", () => {
        const e1 = new ev.EventListenerEntry("click", () => {}, true);
        const e2 = new ev.EventListenerEntry("click", () => {}, true);

        assert(!e1.equals(e2));
    });

    it("compare entries that different capture flag", () => {
        const fn = () => {};
        const e1 = new ev.EventListenerEntry("click", fn, true);
        const e2 = new ev.EventListenerEntry("click", fn, false);

        assert(!e1.equals(e2));
    });

    it("add event listener", () => {
        const fn = () => {};
        const eventListenerSet = new ev.EventListenerSet();
        eventListenerSet.add("click", fn, false);

        assert(eventListenerSet.find(new ev.EventListenerEntry("click", fn, false)));
    });

    it("for each removed event listeners", () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const set1 = new ev.EventListenerSet();
        set1.add("click", fn1, false);
        set1.add("dblclick", fn1, false);
        set1.add("click", fn1, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, false);

        const set2 = new ev.EventListenerSet();
        set2.add("click", fn1, false);
        //set2.add("dblclick", fn1, false);
        set2.add("click", fn1, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, false);

        let removed: ev.EventListenerEntry | undefined = undefined;
        set1.eachRemovedEntries(set2, (e) => {
            removed = e;
        });
        assert(removed, "not removed");
        if(removed) {
        assert((<ev.EventListenerEntry>removed).equals(new ev.EventListenerEntry("dblclick", fn1, false)));
        }
    });

    it("for each added event listeners", () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const set1 = new ev.EventListenerSet();
        set1.add("click", fn1, false);
        set1.add("dblclick", fn1, false);
        set1.add("click", fn1, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, true);
        //set1.add("click", fn2, false);

        const set2 = new ev.EventListenerSet();
        set2.add("click", fn1, false);
        set2.add("dblclick", fn1, false);
        set2.add("click", fn1, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, true);
        set2.add("click", fn2, false);

        let added: ev.EventListenerEntry | undefined = undefined;
        set1.eachAddedEntries(set2, (e) => {
            added = e;
        });
        assert(added, "not added");
        if(added) {
            assert((<ev.EventListenerEntry>added).equals(new ev.EventListenerEntry("click", fn2, false)));
        }
    });

    it("undefined new set", () => {
        const fn1 = () => {};
        const fn2 = () => {};
        const set1 = new ev.EventListenerSet();
        set1.add("click", fn1, false);
        set1.add("dblclick", fn1, false);
        set1.add("click", fn1, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, true);
        set1.add("click", fn2, false);

        let count = 0;
        set1.eachRemovedEntries(null, (e) => ++count);
        assert.equal(count, 6);

        count = 0;
        set1.eachAddedEntries(null, (e) => ++count);
        assert.equal(count, 0);
    });
});

