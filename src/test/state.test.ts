import {assert} from "chai";

import {Action, Store} from "../store";

describe("create action", () => {
    class TestAction extends Action<{value: string}> {}
    it("compare same entries", () => {
        const a = new TestAction({value: "test"});
        assert.equal(a.param.value, "test");
    });
});

describe("reduce state", () => {
    interface State { value: string; }
    class TestAction extends Action<{value: string}> {}
    class UnknownAction extends Action<{value: string}> {}
    const reducer = (s: State, a: TestAction): State => {
        s.value = a.param.value;
        return s;
    };

    it("can dispatch action", () => {
        const store = new Store<State>({value: "initial"});
        store.addReducer(TestAction, reducer);

        // before action.
        assert.equal(store.state.value, "initial");

        // dispatch action.
        assert.isTrue(store.doAction(new TestAction({value: "test"})));

        // after action. value has updated.
        assert.equal(store.state.value, "test");
    });

    it("ignore unknown action", () => {
        const store = new Store<State>({value: "initial"});
        store.addReducer(TestAction, reducer);

        // before action.
        assert.equal(store.state.value, "initial");

        // dispatch unknown action.
        assert.isFalse(store.doAction(new UnknownAction({value: "test"})));

        // after action. value has not updated.
        assert.equal(store.state.value, "initial");
    });

    it("can publish action event", () => {
        const store = new Store<State>({value: "initial"});
        store.addReducer(TestAction, reducer);

        let called = false;
        store.subscribe((s) => {
            called = true;
        });
        assert.isFalse(called);
        assert.isTrue(store.doAction(new TestAction({value: "test"})));
        assert.equal(store.state.value, "test");
        assert.isTrue(called);
    });

    it("don't publish unknown action event", () => {
        const store = new Store<State>({value: "initial"});
        store.addReducer(TestAction, reducer);

        let called = false;
        store.subscribe((s) => {
            called = true;
        });
        assert.isFalse(called);
        assert.isFalse(store.doAction(new UnknownAction({value: "test"})));
        assert.equal(store.state.value, "initial");
        assert.isFalse(called);
    });

    it("can remove subscriber", () => {
        const store = new Store<State>({value: "initial"});
        store.addReducer(TestAction, reducer);

        let called1 = false;
        const subscriber1 = (s: Store<State>) => {
            called1 = true;
        };

        let called2 = false;
        const subscriber2 = (s: Store<State>) => {
            called2 = true;
        };

        store.subscribe(subscriber1);
        store.subscribe(subscriber2);

        assert.isFalse(called1);
        assert.isFalse(called2);

        // dispatch action and publish to subscribers.
        assert.isTrue(store.doAction(new TestAction({value: "test"})));
        assert.equal(store.state.value, "test");
        assert.isTrue(called1);
        assert.isTrue(called2);

        // remove a subscriber.
        assert.isTrue(store.unsubscribe(subscriber1));

        // event not publish
        called1 = false;
        called2 = false;
        assert.isTrue(store.doAction(new TestAction({value: "test"})));
        assert.equal(store.state.value, "test");
        assert.isFalse(called1);
        assert.isTrue(called2);
    });
});

