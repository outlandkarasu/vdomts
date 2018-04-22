"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventListenerSet_1 = require("./eventListenerSet");
var ViewState = (function () {
    function ViewState(root, view) {
        this.stack_ = [];
        this.view_ = view;
        this.startNewState(root);
    }
    Object.defineProperty(ViewState.prototype, "view", {
        get: function () {
            return this.view_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewState.prototype, "state", {
        get: function () {
            return this.stack_[this.stack_.length - 1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewState.prototype, "stateCount", {
        get: function () {
            return this.stack_.length;
        },
        enumerable: true,
        configurable: true
    });
    ViewState.prototype.startNewState = function (newRoot) {
        this.stack_.push({
            element: newRoot,
            child: newRoot.firstChild,
            attributes: null,
            classes: null,
            eventListeners: null
        });
    };
    ViewState.prototype.popState = function () {
        this.stack_.pop();
    };
    return ViewState;
}());
var NodeBuilderImpl = (function () {
    function NodeBuilderImpl(root, view) {
        this.stack_ = [];
        this.startNewViewState(root, view);
    }
    Object.defineProperty(NodeBuilderImpl.prototype, "element", {
        get: function () {
            return this.state.element;
        },
        enumerable: true,
        configurable: true
    });
    NodeBuilderImpl.prototype.tag = function (name) {
        var state = this.state;
        var element = state.element;
        var child = state.child;
        if (!child
            || child.nodeType !== Node.ELEMENT_NODE
            || child.tagName !== name.toUpperCase()) {
            var newChild = document.createElement(name);
            if (child) {
                element.insertBefore(newChild, child);
            }
            else {
                element.appendChild(newChild);
            }
            state.child = newChild;
            child = newChild;
        }
        this.startNewState(child);
        return this;
    };
    NodeBuilderImpl.prototype.attr = function (name, value) {
        if (!this.state.attributes) {
            this.state.attributes = {};
        }
        this.state.attributes[name] = value;
        return this;
    };
    NodeBuilderImpl.prototype.cls = function (name) {
        if (!this.state.classes) {
            this.state.classes = {};
        }
        this.state.classes[name] = true;
        return this;
    };
    NodeBuilderImpl.prototype.text = function (value) {
        var state = this.state;
        var child = state.child;
        if (!child || child.nodeType !== Node.TEXT_NODE) {
            var newChild = document.createTextNode(value);
            var element = state.element;
            if (child) {
                element.insertBefore(newChild, child);
            }
            else {
                element.appendChild(newChild);
            }
            child = newChild;
        }
        else if (child.textContent !== value) {
            child.textContent = value;
        }
        state.child = child.nextSibling;
        return this;
    };
    NodeBuilderImpl.prototype.view = function (v) {
        try {
            this.tag(v.tagName);
            try {
                this.startNewViewState(this.state.element, v);
                v.render(this);
            }
            finally {
                this.endViewState();
            }
        }
        finally {
            this.end();
        }
        return this;
    };
    NodeBuilderImpl.prototype.event = function (type, listener, options) {
        if (!this.state.eventListeners) {
            this.state.eventListeners = new eventListenerSet_1.EventListenerSet();
        }
        this.state.eventListeners.add(type, listener, options);
        return this;
    };
    NodeBuilderImpl.prototype.end = function () {
        return this.viewState.stateCount < 2 ? this : this.forceEnd();
    };
    NodeBuilderImpl.prototype.forceEnd = function () {
        this.removeRestNodes();
        this.replaceEventListeners();
        this.replaceAttributes();
        this.replaceClasses();
        this.viewState.popState();
        var state = this.state;
        if (state && state.child) {
            state.child = state.child.nextSibling;
        }
        return this;
    };
    NodeBuilderImpl.prototype.endAll = function () {
        while (this.viewState.stateCount > 0) {
            this.forceEnd();
        }
    };
    NodeBuilderImpl.prototype.build = function (fn) {
        try {
            fn(this);
        }
        finally {
            this.endViewState();
        }
    };
    Object.defineProperty(NodeBuilderImpl.prototype, "viewState", {
        get: function () {
            return this.stack_[this.stack_.length - 1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeBuilderImpl.prototype, "state", {
        get: function () {
            return this.viewState.state;
        },
        enumerable: true,
        configurable: true
    });
    NodeBuilderImpl.prototype.startNewState = function (newRoot) {
        this.viewState.startNewState(newRoot);
    };
    NodeBuilderImpl.prototype.startNewViewState = function (newRoot, view) {
        this.stack_.push(new ViewState(newRoot, view));
    };
    NodeBuilderImpl.prototype.endViewState = function () {
        this.endAll();
        this.stack_.pop();
    };
    NodeBuilderImpl.prototype.removeRestNodes = function () {
        var state = this.state;
        var child = state.child;
        if (!child) {
            return;
        }
        var element = state.element;
        while (child.nextSibling) {
            element.removeChild(child.nextSibling);
        }
        element.removeChild(child);
    };
    NodeBuilderImpl.prototype.replaceEventListeners = function () {
        var state = this.state;
        var element = state.element;
        var currentSet = element.__vdom_eventListeners;
        var newSet = state.eventListeners;
        if (currentSet) {
            currentSet.eachRemovedEntries(newSet, function (e) { return e.removeFrom(element); });
            currentSet.eachAddedEntries(newSet, function (e) { return e.addTo(element); });
        }
        else if (newSet) {
            newSet.eachEntries(function (e) { return e.addTo(element); });
        }
        element.__vdom_eventListeners = newSet;
    };
    NodeBuilderImpl.prototype.replaceAttributes = function () {
        var state = this.state;
        var element = state.element;
        var newAttrsSet = state.attributes;
        if (newAttrsSet) {
            for (var _i = 0, _a = Object.keys(newAttrsSet); _i < _a.length; _i++) {
                var key = _a[_i];
                element.setAttribute(key, newAttrsSet[key]);
            }
        }
        var attrs = element.attributes;
        for (var i = 0; i < attrs.length;) {
            var key = attrs[i].name;
            if (!newAttrsSet || !newAttrsSet.hasOwnProperty(key)) {
                element.removeAttribute(key);
            }
            else {
                ++i;
            }
        }
    };
    NodeBuilderImpl.prototype.replaceClasses = function () {
        var state = this.state;
        var element = state.element;
        var classList = element.classList;
        var newClassList = state.classes;
        if (newClassList) {
            classList.add.apply(classList, Object.keys(newClassList));
        }
        for (var i = 0; i < classList.length;) {
            var name_1 = classList[i];
            if (!newClassList || !newClassList.hasOwnProperty(name_1)) {
                classList.remove(name_1);
            }
            else {
                ++i;
            }
        }
    };
    return NodeBuilderImpl;
}());
function build(root, fn) {
    var rootView = {
        get tagName() {
            return root.tagName;
        },
        render: function (b) {
        }
    };
    (new NodeBuilderImpl(root, rootView)).build(fn);
    return root;
}
exports.build = build;
//# sourceMappingURL=vdom.js.map