"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
    var TestAction = (function (_super) {
        __extends(TestAction, _super);
        function TestAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TestAction;
    }(store_1.Action));
    var UnknownAction = (function (_super) {
        __extends(UnknownAction, _super);
        function UnknownAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return UnknownAction;
    }(store_1.Action));
    var reducer = function (s, a) {
        s.value = a.param.value;
        return s;
    };
    it("can dispatch action", function () {
        var store = new store_1.Store({ value: "initial" });
        store.addReducer(TestAction, reducer);
        chai_1.assert.equal(store.state.value, "initial");
        chai_1.assert.isTrue(store.doAction(new TestAction({ value: "test" })));
        chai_1.assert.equal(store.state.value, "test");
    });
    it("ignore unknown action", function () {
        var store = new store_1.Store({ value: "initial" });
        store.addReducer(TestAction, reducer);
        chai_1.assert.equal(store.state.value, "initial");
        chai_1.assert.isFalse(store.doAction(new UnknownAction({ value: "test" })));
        chai_1.assert.equal(store.state.value, "initial");
    });
    it("can publish action event", function () {
        var store = new store_1.Store({ value: "initial" });
        store.addReducer(TestAction, reducer);
        var called = false;
        store.subscribe(function (s) {
            called = true;
        });
        chai_1.assert.isFalse(called);
        chai_1.assert.isTrue(store.doAction(new TestAction({ value: "test" })));
        chai_1.assert.equal(store.state.value, "test");
        chai_1.assert.isTrue(called);
    });
    it("don't publish unknown action event", function () {
        var store = new store_1.Store({ value: "initial" });
        store.addReducer(TestAction, reducer);
        var called = false;
        store.subscribe(function (s) {
            called = true;
        });
        chai_1.assert.isFalse(called);
        chai_1.assert.isFalse(store.doAction(new UnknownAction({ value: "test" })));
        chai_1.assert.equal(store.state.value, "initial");
        chai_1.assert.isFalse(called);
    });
    it("can remove subscriber", function () {
        var store = new store_1.Store({ value: "initial" });
        store.addReducer(TestAction, reducer);
        var called1 = false;
        var subscriber1 = function (s) {
            called1 = true;
        };
        var called2 = false;
        var subscriber2 = function (s) {
            called2 = true;
        };
        store.subscribe(subscriber1);
        store.subscribe(subscriber2);
        chai_1.assert.isFalse(called1);
        chai_1.assert.isFalse(called2);
        chai_1.assert.isTrue(store.doAction(new TestAction({ value: "test" })));
        chai_1.assert.equal(store.state.value, "test");
        chai_1.assert.isTrue(called1);
        chai_1.assert.isTrue(called2);
        chai_1.assert.isTrue(store.unsubscribe(subscriber1));
        called1 = false;
        called2 = false;
        chai_1.assert.isTrue(store.doAction(new TestAction({ value: "test" })));
        chai_1.assert.equal(store.state.value, "test");
        chai_1.assert.isFalse(called1);
        chai_1.assert.isTrue(called2);
    });
});
//# sourceMappingURL=state.test.js.map