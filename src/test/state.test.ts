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
    interface State {
        value: string;
    }
    const store = new Store<State>({value: "initial"});

    class TestAction extends Action<{value: string}> {}
    const reducer = (s: State, a: TestAction): State => {
        s.value = a.param.value;
        return s;
    };
    store.addReducer(TestAction, reducer);

    assert.equal(store.state.value, "initial");
    assert.isTrue(store.doAction(new TestAction({value: "test"})));
    assert.equal(store.state.value, "test");

    class TestAction2 extends Action<{value: string}> {}
    assert.isFalse(store.doAction(new TestAction2({value: "test"})));
});

