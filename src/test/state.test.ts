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
});

