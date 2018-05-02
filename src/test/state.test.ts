import {assert} from "chai";

import {Action} from "../store";

describe("create action", () => {
    class TestAction extends Action<{value: string}> {}
    it("compare same entries", () => {
        const a = new TestAction({value: "test"});
        assert.equal(a.param.value, "test");
    });
});

