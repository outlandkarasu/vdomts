"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventHandlerSet_1 = require("./eventHandlerSet");
var State = (function () {
    function State(view, element, child) {
        this.view_ = view;
        this.element = element;
        this.child = child;
        this.attributes_ = null;
        this.classes_ = null;
        this.properties_ = null;
    }
    State.prototype.attr = function (name, value) {
        if (!this.attributes_) {
            this.attributes_ = {};
        }
        this.attributes_[name] = value;
    };
    State.prototype.cls = function (name) {
        if (!this.classes_) {
            this.classes_ = {};
        }
        this.classes_[name] = true;
    };
    State.prototype.prop = function (name, value) {
        if (!this.properties_) {
            this.properties_ = {};
        }
        this.properties_[name] = value;
    };
    State.prototype.text = function (value) {
        var child = this.child;
        if (!child || child.nodeType !== Node.TEXT_NODE) {
            var newChild = document.createTextNode(value);
            var element = this.element;
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
        this.child = child.nextSibling;
    };
    State.prototype.event = function (type, handler, options) {
        if (!this.eventHandlerSet) {
            this.eventHandlerSet = new eventHandlerSet_1.EventHandlerSet();
        }
        this.eventHandlerSet.add(this.view_, type, handler, options);
    };
    State.prototype.end = function () {
        this.removeRestNodes();
        this.syncEventHandlers();
        this.replaceAttributes();
        this.replaceClasses();
        this.updateProperties();
    };
    Object.defineProperty(State.prototype, "eventHandlerSet", {
        get: function () {
            return this.element.__vdom_eventHandlerSet;
        },
        set: function (eventHandlerSet) {
            this.element.__vdom_eventHandlerSet = eventHandlerSet;
        },
        enumerable: true,
        configurable: true
    });
    State.prototype.removeRestNodes = function () {
        var child = this.child;
        if (!child) {
            return;
        }
        var element = this.element;
        while (child.nextSibling) {
            element.removeChild(child.nextSibling);
        }
        element.removeChild(child);
    };
    State.prototype.replaceAttributes = function () {
        var element = this.element;
        var newAttrsSet = this.attributes_;
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
    State.prototype.replaceClasses = function () {
        var classList = this.element.classList;
        var newClassList = this.classes_;
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
    State.prototype.updateProperties = function () {
        var properties = this.properties_;
        if (!properties) {
            return;
        }
        var element = this.element;
        for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
            var k = _a[_i];
            element[k] = properties[k];
        }
    };
    State.prototype.syncEventHandlers = function () {
        var eventHandlerSet = this.eventHandlerSet;
        if (eventHandlerSet) {
            eventHandlerSet.syncEventHandlers(this.element);
        }
    };
    return State;
}());
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
        this.stack_.push(new State(this.view_, newRoot, newRoot.firstChild));
    };
    ViewState.prototype.endTag = function () {
        if (this.stack_.length === 1) {
            return;
        }
        this.forceEndTag();
    };
    ViewState.prototype.endView = function () {
        while (this.stack_.length > 0) {
            this.forceEndTag();
        }
    };
    ViewState.prototype.forceEndTag = function () {
        this.state.end();
        this.stack_.pop();
        var parentState = this.state;
        if (parentState && parentState.child) {
            parentState.child = parentState.child.nextSibling;
        }
    };
    return ViewState;
}());
var NodeBuilderImpl = (function () {
    function NodeBuilderImpl(root, rootView) {
        this.stack_ = [];
        this.startNewViewState(root, rootView);
    }
    Object.defineProperty(NodeBuilderImpl.prototype, "element", {
        get: function () {
            return this.state.element;
        },
        enumerable: true,
        configurable: true
    });
    NodeBuilderImpl.prototype.tag = function (name) {
        var child = this.moveOrInsertNextTag(name);
        this.viewState.startNewState(child);
        return this;
    };
    NodeBuilderImpl.prototype.moveOrInsertNextTag = function (name) {
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
        return child;
    };
    NodeBuilderImpl.prototype.attr = function (name, value) {
        this.state.attr(name, value);
        return this;
    };
    NodeBuilderImpl.prototype.attrIf = function (name, value, enable) {
        return enable ? this.attr(name, value) : this;
    };
    NodeBuilderImpl.prototype.cls = function (name) {
        this.state.cls(name);
        return this;
    };
    NodeBuilderImpl.prototype.clsIf = function (name, enable) {
        return enable ? this.cls(name) : this;
    };
    NodeBuilderImpl.prototype.prop = function (name, value) {
        this.state.prop(name, value);
        return this;
    };
    NodeBuilderImpl.prototype.propIf = function (name, value, enable) {
        return enable ? this.prop(name, value) : this;
    };
    NodeBuilderImpl.prototype.text = function (value) {
        this.state.text(value);
        return this;
    };
    NodeBuilderImpl.prototype.view = function (v) {
        var element = this.moveOrInsertNextTag(v.tagName);
        v.element = element;
        try {
            this.startNewViewState(v.element, v);
            v.render(this);
        }
        finally {
            this.endViewState();
            this.state.child = element.nextSibling;
        }
        return this;
    };
    NodeBuilderImpl.prototype.event = function (type, handler, options) {
        this.state.event(type, handler, options);
        return this;
    };
    NodeBuilderImpl.prototype.end = function () {
        this.viewState.endTag();
        return this;
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
    NodeBuilderImpl.prototype.startNewViewState = function (newRoot, view) {
        this.stack_.push(new ViewState(newRoot, view));
    };
    NodeBuilderImpl.prototype.endViewState = function () {
        this.viewState.endView();
        this.stack_.pop();
    };
    return NodeBuilderImpl;
}());
exports.NodeBuilderImpl = NodeBuilderImpl;
function build(root, fn) {
    var rootView = {
        element: root,
        get tagName() {
            return root.tagName;
        },
        render: function (b) {
        }
    };
    (new NodeBuilderImpl(root, rootView)).build(fn);
}
exports.build = build;
function rebuild(view) {
    if (view.element) {
        (new NodeBuilderImpl(view.element, view)).build(function (b) { return view.render(b); });
    }
}
exports.rebuild = rebuild;
//# sourceMappingURL=nodeBuilderImpl.js.map