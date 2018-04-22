"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var vdom = require("../vdom");
describe("vdom tags and attributes", function () {
    var root = document.createElement("div");
    it("append tag", function () {
        vdom.build(root, function (b) {
            chai_1.assert.isNotNull(b.element);
            if (b) {
                if (b.element) {
                    chai_1.assert.equal(b.element.nodeType, Node.ELEMENT_NODE);
                    chai_1.assert.equal(b.element.tagName, "DIV");
                }
                b.tag("div").end();
            }
        });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
    });
    it("append tag and attribute", function () {
        vdom.build(root, function (b) { return b.tag("div").attr("test", "test value"); });
        chai_1.assert.equal(root.children.length, 1);
        var child = root.children[0];
        chai_1.assert.equal(child.tagName, "DIV");
        chai_1.assert.equal(child.attributes.length, 1);
        chai_1.assert.equal(child.attributes.getNamedItem("test").value, "test value");
    });
    it("append tag attribute and child", function () {
        vdom.build(root, function (b) {
            b.tag("div")
                .attr("test", "parent")
                .tag("div")
                .attr("test", "child").end();
        });
        chai_1.assert.equal(root.children.length, 1);
        var child = root.children[0];
        chai_1.assert.equal(child.tagName, "DIV");
        var child2 = child.children[0];
        chai_1.assert.equal(child2.tagName, "DIV");
        chai_1.assert.equal(child2.attributes.length, 1);
        chai_1.assert.equal(child2.attributes.getNamedItem("test").value, "child");
    });
    it("remove an attribute", function () {
        vdom.build(root, function (b) { return b.tag("div").attr("test", "test value"); });
        var child = root.children[0];
        chai_1.assert.equal(child.attributes.length, 1);
        vdom.build(root, function (b) { return b.tag("div"); });
        chai_1.assert.equal(child.attributes.length, 0);
    });
    it("remove an attribute", function () {
        vdom.build(root, function (b) {
            b.tag("div")
                .attr("test", "test value")
                .attr("test2", "test2 value");
        });
        var child = root.children[0];
        chai_1.assert.equal(child.attributes.length, 2);
        vdom.build(root, function (b) { return b.tag("div").attr("test2", "test2 value"); });
        chai_1.assert.equal(child.attributes.length, 1);
        chai_1.assert.equal(child.attributes.getNamedItem("test2").value, "test2 value");
    });
});
describe("vdom childlen tags", function () {
    var root = document.createElement("div");
    it("redraw child", function () {
        vdom.build(root, function (b) { return b.tag("div"); });
        vdom.build(root, function (b) { return b.tag("div"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
    });
    it("create recursive tags", function () {
        vdom.build(root, function (b) { return b.tag("div").tag("section"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
        var child = root.children[0];
        chai_1.assert.equal(child.children.length, 1);
        chai_1.assert.equal(child.children[0].tagName, "SECTION");
        vdom.build(root, function (b) { return b.tag("div").tag("section"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
        child = root.children[0];
        chai_1.assert.equal(child.children.length, 1);
        chai_1.assert.equal(child.children[0].tagName, "SECTION");
    });
    it("remove unmatch tags", function () {
        vdom.build(root, function (b) { return b.tag("div").end().tag("section"); });
        chai_1.assert.equal(root.children.length, 2);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
        chai_1.assert.equal(root.children[1].tagName, "SECTION");
        vdom.build(root, function (b) { return b.tag("section"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "SECTION");
    });
    it("remove unmatch child tag", function () {
        vdom.build(root, function (b) { return b.tag("div").tag("section"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
        var child = root.children[0];
        chai_1.assert.equal(child.children.length, 1);
        chai_1.assert.equal(child.children[0].tagName, "SECTION");
        vdom.build(root, function (b) { return b.tag("div"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
        child = root.children[0];
        chai_1.assert.equal(child.children.length, 0);
    });
});
describe("vdom text nodes", function () {
    var root = document.createElement("div");
    it("add text node", function () {
        vdom.build(root, function (b) { return b.text("test"); });
        chai_1.assert.isNotNull(root.firstChild);
        if (root && root.firstChild) {
            chai_1.assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            chai_1.assert.equal(root.firstChild.textContent, "test");
        }
    });
    it("update text node", function () {
        vdom.build(root, function (b) { return b.text("test").text("test2"); });
        chai_1.assert.equal(root.childNodes.length, 2);
        if (root && root.firstChild) {
            chai_1.assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            chai_1.assert.equal(root.firstChild.textContent, "test");
        }
        if (root && root.lastChild) {
            chai_1.assert.equal(root.lastChild.nodeType, Node.TEXT_NODE);
            chai_1.assert.equal(root.lastChild.textContent, "test2");
        }
        vdom.build(root, function (b) { return b.text("test1").text("test2"); });
        if (root.firstChild && root.lastChild) {
            chai_1.assert.equal(root.firstChild.textContent, "test1");
            chai_1.assert.equal(root.lastChild.textContent, "test2");
        }
    });
    it("remove text node", function () {
        vdom.build(root, function (b) { return b.text("test").text("test2"); });
        chai_1.assert.equal(root.childNodes.length, 2);
        if (root.firstChild) {
            chai_1.assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            chai_1.assert.equal(root.firstChild.textContent, "test");
        }
        if (root.lastChild) {
            chai_1.assert.equal(root.lastChild.nodeType, Node.TEXT_NODE);
            chai_1.assert.equal(root.lastChild.textContent, "test2");
        }
        vdom.build(root, function (b) { return b.text("test2"); });
        chai_1.assert.equal(root.childNodes.length, 1);
        if (root.firstChild && root.lastChild) {
            chai_1.assert.equal(root.firstChild.textContent, "test2");
            chai_1.assert.equal(root.lastChild.textContent, "test2");
        }
    });
    it("add text node after element", function () {
        vdom.build(root, function (b) {
            b.tag("div").end().text("test");
        });
        chai_1.assert.equal(root.childNodes.length, 2);
        chai_1.assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
        chai_1.assert.equal(root.childNodes[1].nodeType, Node.TEXT_NODE);
        chai_1.assert.equal(root.childNodes[1].textContent, "test");
    });
});
describe("vdom css list", function () {
    var root = document.createElement("div");
    it("add style class", function () {
        vdom.build(root, function (b) { return b.tag("div").cls("test-class"); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        var element = root.children[0];
        chai_1.assert.equal(element.tagName, "DIV");
        chai_1.assert.equal(element.classList.length, 1);
        chai_1.assert.equal(element.classList[0], "test-class");
    });
    it("add style class to a child", function () {
        vdom.build(root, function (b) {
            b.tag("div")
                .cls("test-class-parent")
                .tag("section")
                .cls("test-class-child");
        });
        chai_1.assert.equal(root.children.length, 1);
        var parent = root.children[0];
        chai_1.assert.equal(parent.nodeType, Node.ELEMENT_NODE);
        chai_1.assert.equal(parent.tagName, "DIV");
        chai_1.assert.equal(parent.classList.length, 1);
        chai_1.assert.equal(parent.classList[0], "test-class-parent");
        chai_1.assert.equal(parent.children.length, 1);
        var child = parent.children[0];
        chai_1.assert.equal(child.classList.length, 1);
        chai_1.assert.equal(child.classList[0], "test-class-child");
    });
    it("remove style class", function () {
        var classes = ["test1", "test2"];
        var build = function () {
            vdom.build(root, function (b) {
                b.tag("div");
                classes.forEach(function (e) { return b.cls(e); });
            });
        };
        build();
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        var element = root.children[0];
        chai_1.assert.equal(element.tagName, "DIV");
        chai_1.assert.equal(element.classList.length, 2);
        chai_1.assert(element.classList.contains("test1"));
        chai_1.assert(element.classList.contains("test2"));
        classes.pop();
        build();
        chai_1.assert.equal(element.classList.length, 1);
        chai_1.assert(element.classList.contains("test1"));
        chai_1.assert(!element.classList.contains("test2"));
        classes[0] = "test3";
        build();
        chai_1.assert.equal(element.classList.length, 1);
        chai_1.assert(element.classList.contains("test3"));
        chai_1.assert(!element.classList.contains("test1"));
        classes.push("test4");
        build();
        chai_1.assert.equal(element.classList.length, 2);
        chai_1.assert(element.classList.contains("test3"));
        chai_1.assert(element.classList.contains("test4"));
    });
});
describe("vdom sub view", function () {
    var root = document.createElement("div");
    it("render view", function () {
        var view = {
            tagName: "div",
            render: function (b) {
            }
        };
        vdom.build(root, function (b) { return b.view(view); });
        chai_1.assert.equal(root.children.length, 1);
        chai_1.assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        chai_1.assert.equal(root.children[0].tagName, "DIV");
    });
    it("render sub view", function () {
        var subview = {
            tagName: "section",
            render: function (b) {
                b.end();
                b.tag("section").end();
            }
        };
        var view = {
            tagName: "div",
            render: function (b) {
                b.view(subview);
                b.text("test");
            }
        };
        vdom.build(root, function (b) { return b.view(view); });
        chai_1.assert.equal(root.children.length, 1);
        var viewElement = root.children[0];
        chai_1.assert.equal(viewElement.nodeType, Node.ELEMENT_NODE);
        chai_1.assert.equal(viewElement.tagName, "DIV");
        chai_1.assert.equal(viewElement.childNodes.length, 2);
        chai_1.assert.equal(viewElement.childNodes[0].nodeType, Node.ELEMENT_NODE);
        var child = viewElement.children[0];
        chai_1.assert.equal(child.tagName, "SECTION");
        chai_1.assert.equal(child.children.length, 1);
        chai_1.assert.equal(child.children[0].tagName, "SECTION");
        chai_1.assert.equal(viewElement.childNodes[1].nodeType, Node.TEXT_NODE);
        chai_1.assert.equal(viewElement.childNodes[1].textContent, "test");
    });
});
//# sourceMappingURL=vdom.test.js.map