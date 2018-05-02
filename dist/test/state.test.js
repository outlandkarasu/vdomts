"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var store_1 = require("../store");
describe("create action", function () {
    var TestAction = (function (_super) {
        __extends(TestAction, _super);
        function TestAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TestAction;
    }(store_1.Action));
    it("compare same entries", function () {
        var a = new TestAction({ value: "test" });
        chai_1.assert.equal(a.param.value, "test");
    });
});
describe("reduce state", function () {
    var store = new store_1.Store({ value: "initial" });
    var TestAction = (function (_super) {
        __extends(TestAction, _super);
        function TestAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TestAction;
    }(store_1.Action));
    var reducer = function (s, a) {
        s.value = a.param.value;
        return s;
    };
    store.addReducer(TestAction, reducer);
    var called = false;
    store.subscribe(function (s) {
        called = true;
    });
    chai_1.assert.equal(store.state.value, "initial");
    chai_1.assert.isFalse(called);
    chai_1.assert.isTrue(store.doAction(new TestAction({ value: "test" })));
    chai_1.assert.equal(store.state.value, "test");
    chai_1.assert.isTrue(called);
    var TestAction2 = (function (_super) {
        __extends(TestAction2, _super);
        function TestAction2() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TestAction2;
    }(store_1.Action));
    called = false;
    chai_1.assert.isFalse(store.doAction(new TestAction2({ value: "test" })));
    chai_1.assert.isFalse(called);
});
//# sourceMappingURL=state.test.js.map