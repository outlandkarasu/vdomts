"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Action = (function () {
    function Action(param) {
        var p = {};
        for (var _i = 0, _a = Object.keys(param); _i < _a.length; _i++) {
            var k = _a[_i];
            p[k] = param[k];
        }
        this.param = p;
    }
    return Action;
}());
exports.Action = Action;
//# sourceMappingURL=store.js.map