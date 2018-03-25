import {assert} from "chai";

import * as vdom from "../vdom";

describe("vdom", () => {
    it("append tag", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => {
            assert.isNotNull(b.element);
            if(b) {
                if(b.element) {
                    assert.equal(b.element.nodeType, Node.ELEMENT_NODE);
                    assert.equal(b.element.tagName, "SECTION");
                }
                b.tag("div");
            }
        });

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
    });

    it("append tag and attribute", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.tag("div", () => {
            b.attr("test", "test value");
        }));

        assert.equal(root.children.length, 1);

        const child: Element = root.children[0];
        assert.equal(child.tagName, "DIV");
        assert.equal(child.attributes.length, 1);
        assert.equal(child.attributes.getNamedItem("test").value, "test value");
    });

    it("append tag attribute and child", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => {
            b.tag("div", () => {
                b.tag("div", () => b.attr("test", "child"));
            });
        });

        assert.equal(root.children.length, 1);

        const child: Element = root.children[0];
        assert.equal(child.tagName, "DIV");

        const child2: Element = child.children[0];
        assert.equal(child2.tagName, "DIV");
        assert.equal(child2.attributes.length, 1);
        assert.equal(child2.attributes.getNamedItem("test").value, "child");
    });

    it("remove an attribute", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.tag("div", () => b.attr("test", "test value")));
        let child: Element = root.children[0];
        assert.equal(child.attributes.length, 1);

        vdom.build(root, (b) => b.tag("div"));
        assert.equal(child.attributes.length, 0);
    });

    it("remove an attribute", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.tag("div", () => {
            b.attr("test", "test value")
             .attr("test2", "test2 value");
        }));
        let child: Element = root.children[0];
        assert.equal(child.attributes.length, 2);

        vdom.build(root, (b) => b.tag("div", () => {
            b.attr("test2", "test2 value");
        }));
        assert.equal(child.attributes.length, 1);
        assert.equal(child.attributes.getNamedItem("test2").value, "test2 value");
    });

    it("redraw child", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.tag("div"));

        // redraw
        vdom.build(root, (b) => b.tag("div"));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
    });

    it("create recursive tags", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.tag("div", (b) => {
            b.tag("section");
        }));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
        let child: Element = root.children[0];
        assert.equal(child.children.length, 1);
        assert.equal(child.children[0].tagName, "SECTION");

        // redraw
        vdom.build(root, (b) => b.tag("div", (b) => b.tag("section")));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
        child = root.children[0];
        assert.equal(child.children.length, 1);
        assert.equal(child.children[0].tagName, "SECTION");
    });

    it("remove unmatch tags", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => {
            b.tag("div").tag("section");
        });

        assert.equal(root.children.length, 2);
        assert.equal(root.children[0].tagName, "DIV");
        assert.equal(root.children[1].tagName, "SECTION");

        // redraw
        vdom.build(root, (b) => b.tag("section"));
        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "SECTION");
    });

    it("remove unmatch child tag", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => {
            b.tag("div", () => b.tag("section"));
        });

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
        let child: Element = root.children[0];
        assert.equal(child.children.length, 1);
        assert.equal(child.children[0].tagName, "SECTION");

        // remove child
        vdom.build(root, (b) => b.tag("div"));
        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
        child = root.children[0];
        assert.equal(child.children.length, 0);
    });

    it("add text node", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.text("test"));

        assert.isNotNull(root.firstChild);
        if(root && root.firstChild) {
            assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            assert.equal(root.firstChild.textContent, "test");
        }
    });

    it("update text node", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.text("test").text("test2"));

        assert.equal(root.childNodes.length, 2);

        if(root && root.firstChild) {
            assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            assert.equal(root.firstChild.textContent, "test");
        }
        if(root && root.lastChild) {
            assert.equal(root.lastChild.nodeType, Node.TEXT_NODE);
            assert.equal(root.lastChild.textContent, "test2");
        }
        vdom.build(root, (b) => b.text("test1").text("test2"));

        if(root.firstChild && root.lastChild) {
            assert.equal(root.firstChild.textContent, "test1");
            assert.equal(root.lastChild.textContent, "test2");
        }
    });

    it("remove text node", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => b.text("test").text("test2"));

        assert.equal(root.childNodes.length, 2);
        if(root.firstChild) {
            assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            assert.equal(root.firstChild.textContent, "test");
        }
        if(root.lastChild) {
            assert.equal(root.lastChild.nodeType, Node.TEXT_NODE);
            assert.equal(root.lastChild.textContent, "test2");
        }

        vdom.build(root, (b) => b.text("test2"));
        assert.equal(root.childNodes.length, 1);
        if(root.firstChild && root.lastChild) {
            assert.equal(root.firstChild.textContent, "test2");
            assert.equal(root.lastChild.textContent, "test2");
        }
    });

    it("add text node after element", () => {
        const root: HTMLElement = document.createElement("section");
        vdom.build(root, (b) => {
            b.tag("div")
             .text("test");
        });

        assert.equal(root.childNodes.length, 2);
        assert.equal(root.childNodes[0].nodeType, Node.ELEMENT_NODE);
        assert.equal((<Element>root.childNodes[0]).tagName, "DIV");
        assert.equal(root.childNodes[1].nodeType, Node.TEXT_NODE);
        assert.equal(root.childNodes[1].textContent, "test");
    });
});

