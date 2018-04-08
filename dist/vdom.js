"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventListenerSet_1 = require("./eventListenerSet");
var NodeBuilderImpl = (function () {
    function NodeBuilderImpl(root) {
        this.parent = root;
        this.node = root.firstChild;
        this.attributes = null;
        this.classes = null;
        this.eventListenerSet = null;
    }
    NodeBuilderImpl.prototype.build = function (fn) {
        fn(this);
        this.removeRestNodes();
        var element = this.parent;
        var currentSet = element.__vdom_eventListenerSet;
        var newSet = this.eventListenerSet;
        if (currentSet) {
            currentSet.eachRemovedEntries(newSet, function (e) {
                e.removeFrom(element);
            });
            currentSet.eachAddedEntries(newSet, function (e) {
                e.addTo(element);
            });
        }
        else if (newSet) {
            newSet.eachEntries(function (e) { return e.addTo(element); });
        }
        element.__vdom_eventListenerSet = newSet;
    };
    NodeBuilderImpl.prototype.removeRestNodes = function () {
        if (!this.node) {
            return;
        }
        while (this.node.nextSibling) {
            this.parent.removeChild(this.node.nextSibling);
        }
        this.parent.removeChild(this.node);
    };
    NodeBuilderImpl.prototype.updateAttributes = function () {
        if (!this.node || this.node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        var element = this.node;
        var newAttrsSet = this.attributes;
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
        var classList = element.classList;
        var newClassList = this.classes;
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
    NodeBuilderImpl.prototype.tag = function (name, fn) {
        if (!this.node
            || this.node.nodeType !== Node.ELEMENT_NODE
            || this.node.tagName !== name.toUpperCase()) {
            var child = document.createElement(name);
            if (this.node) {
                this.parent.insertBefore(child, this.node);
            }
            else {
                this.parent.appendChild(child);
            }
            this.node = child;
        }
        var currentParent = this.parent;
        var currentElement = this.node;
        var currentAttributes = this.attributes;
        var currentClasses = this.classes;
        var currentEventListenerSet = this.eventListenerSet;
        this.parent = this.node;
        this.node = this.parent.firstChild;
        this.attributes = null;
        this.classes = null;
        this.eventListenerSet = null;
        if (fn) {
            this.build(fn);
        }
        else {
            this.removeRestNodes();
        }
        this.eventListenerSet = currentEventListenerSet;
        this.node = currentElement;
        this.parent = currentParent;
        this.updateAttributes();
        this.attributes = currentAttributes;
        this.classes = currentClasses;
        if (this.node) {
            this.node = this.node.nextSibling;
        }
        return this;
    };
    NodeBuilderImpl.prototype.attr = function (name, value) {
        if (!this.attributes) {
            this.attributes = {};
        }
        this.attributes[name] = value;
        return this;
    };
    NodeBuilderImpl.prototype.cls = function (name) {
        if (!this.classes) {
            this.classes = {};
        }
        this.classes[name] = true;
        return this;
    };
    NodeBuilderImpl.prototype.text = function (value) {
        if (!this.node || this.node.nodeType !== Node.TEXT_NODE) {
            var child = document.createTextNode(value);
            if (this.node) {
                this.parent.insertBefore(child, this.node);
            }
            else {
                this.parent.appendChild(child);
            }
            this.node = child;
        }
        else if (this.node.textContent !== value) {
            this.node.textContent = value;
        }
        if (this.node) {
            this.node = this.node.nextSibling;
        }
        return this;
    };
    NodeBuilderImpl.prototype.event = function (type, listener, options) {
        if (!this.eventListenerSet) {
            this.eventListenerSet = new eventListenerSet_1.EventListenerSet();
        }
        this.eventListenerSet.add(type, listener, options);
        return this;
    };
    Object.defineProperty(NodeBuilderImpl.prototype, "element", {
        get: function () {
            return (this.parent && this.parent.nodeType === Node.ELEMENT_NODE) ? this.parent : undefined;
        },
        enumerable: true,
        configurable: true
    });
    return NodeBuilderImpl;
}());
function build(root, fn) {
    (new NodeBuilderImpl(root)).build(fn);
    return root;
}
exports.build = build;
//# sourceMappingURL=vdom.js.map