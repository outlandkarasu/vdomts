import {assert} from "chai";

import * as vdom from "../vdom";

describe("vdom tags and attributes", () => {
    const root: HTMLElement = document.createElement("div");

    it("append tag", () => {
        vdom.build(root, (b) => {
            assert.isNotNull(b.element);
            if(b) {
                if(b.element) {
                    assert.equal(b.element.nodeType, Node.ELEMENT_NODE);
                    assert.equal(b.element.tagName, "DIV");
                }
                b.tag("div").end();
            }
        });

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
    });

    it("append tag and attribute", () => {
        vdom.build(root, (b) => b.tag("div").attr("test", "test value"));

        assert.equal(root.children.length, 1);

        const child: Element = root.children[0];
        assert.equal(child.tagName, "DIV");
        assert.equal(child.attributes.length, 1);
        assert.equal(child.attributes.getNamedItem("test").value, "test value");
    });

    it("append tag attribute and child", () => {
        vdom.build(root, (b) => {
            b.tag("div")
                .attr("test", "parent")
                .tag("div")
                    .attr("test", "child").end();
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
        vdom.build(root, (b) => b.tag("div").attr("test", "test value"));
        let child: Element = root.children[0];
        assert.equal(child.attributes.length, 1);

        vdom.build(root, (b) => b.tag("div"));
        assert.equal(child.attributes.length, 0);
    });

    it("remove an attribute", () => {
        vdom.build(root, (b) => {
            b.tag("div")
                 .attr("test", "test value")
                 .attr("test2", "test2 value");
        });
        let child: Element = root.children[0];
        assert.equal(child.attributes.length, 2);

        vdom.build(root, (b) => b.tag("div").attr("test2", "test2 value"));
        assert.equal(child.attributes.length, 1);
        assert.equal(child.attributes.getNamedItem("test2").value, "test2 value");
    });
});

describe("vdom childlen tags", () => {
    const root: HTMLElement = document.createElement("div");

    it("redraw child", () => {
        vdom.build(root, (b) => b.tag("div"));

        // redraw
        vdom.build(root, (b) => b.tag("div"));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
    });

    it("create recursive tags", () => {
        vdom.build(root, (b) => b.tag("div").tag("section"));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
        let child: Element = root.children[0];
        assert.equal(child.children.length, 1);
        assert.equal(child.children[0].tagName, "SECTION");

        // redraw
        vdom.build(root, (b) => b.tag("div").tag("section"));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "DIV");
        child = root.children[0];
        assert.equal(child.children.length, 1);
        assert.equal(child.children[0].tagName, "SECTION");
    });

    it("remove unmatch tags", () => {
        vdom.build(root, (b) => b.tag("div").end().tag("section"));

        assert.equal(root.children.length, 2);
        assert.equal(root.children[0].tagName, "DIV");
        assert.equal(root.children[1].tagName, "SECTION");

        // redraw
        vdom.build(root, (b) => b.tag("section"));
        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].tagName, "SECTION");
    });

    it("remove unmatch child tag", () => {
        vdom.build(root, (b) => b.tag("div").tag("section"));

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
});

describe("vdom text nodes", () => {
    const root: HTMLElement = document.createElement("div");

    it("add text node", () => {
        vdom.build(root, (b) => b.text("test"));

        assert.isNotNull(root.firstChild);
        if(root && root.firstChild) {
            assert.equal(root.firstChild.nodeType, Node.TEXT_NODE);
            assert.equal(root.firstChild.textContent, "test");
        }
    });

    it("update text node", () => {
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
        vdom.build(root, (b) => {
            b.tag("div").end().text("test");
        });

        assert.equal(root.childNodes.length, 2);
        assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        assert.equal(root.children[0].tagName, "DIV");
        assert.equal(root.childNodes[1].nodeType, Node.TEXT_NODE);
        assert.equal(root.childNodes[1].textContent, "test");
    });
});

describe("vdom css list", () => {
    const root: HTMLElement = document.createElement("div");

    it("add style class", () => {
        vdom.build(root, (b) => b.tag("div").cls("test-class"));

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        const element: Element = root.children[0];
        assert.equal(element.tagName, "DIV");
        assert.equal(element.classList.length, 1);
        assert.equal(element.classList[0], "test-class");
    });

    it("add style class to a child", () => {
        vdom.build(root, (b) => {
            b.tag("div")
                .cls("test-class-parent")
                .tag("section")
                    .cls("test-class-child")
        });

        assert.equal(root.children.length, 1);
        const parent: Element = root.children[0];
        assert.equal(parent.nodeType, Node.ELEMENT_NODE);
        assert.equal(parent.tagName, "DIV");
        assert.equal(parent.classList.length, 1);
        assert.equal(parent.classList[0], "test-class-parent");
        assert.equal(parent.children.length, 1);

        const child: Element = parent.children[0];
        assert.equal(child.classList.length, 1);
        assert.equal(child.classList[0], "test-class-child");
    });

    it("remove style class", () => {
        const classes: string[]  = ["test1", "test2"];
        const build = () => {
            vdom.build(root, (b) => {
                b.tag("div");
                classes.forEach(e => b.cls(e));
            });
        };

        build();
        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);

        const element: Element = root.children[0];
        assert.equal(element.tagName, "DIV");
        assert.equal(element.classList.length, 2);
        assert(element.classList.contains("test1"));
        assert(element.classList.contains("test2"));

        // remove and rebuild nodes.
        classes.pop();
        build();
        assert.equal(element.classList.length, 1);
        assert(element.classList.contains("test1"));
        assert(!element.classList.contains("test2"));

        // update and rebuild nodes.
        classes[0] = "test3";
        build();
        assert.equal(element.classList.length, 1);
        assert(element.classList.contains("test3"));
        assert(!element.classList.contains("test1"));

        // add and rebuild nodes.
        classes.push("test4");
        build();
        assert.equal(element.classList.length, 2);
        assert(element.classList.contains("test3"));
        assert(element.classList.contains("test4"));
    });
});

describe("vdom sub view", () => {
    const root: HTMLElement = document.createElement("div");
    it("render view", () => {
        const view = {
            tagName: "div",
            render(b: vdom.NodeBuilder): void {
            }
        };
        vdom.render(root, view);

        assert.equal(root.children.length, 1);
        assert.equal(root.children[0].nodeType, Node.ELEMENT_NODE);
        assert.equal(root.children[0].tagName, "DIV");
    });
});

