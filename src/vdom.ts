/**
 *  Virtual DOM implementation.
 */

import {EventListenerSet} from "./eventListenerSet";

/// node attributes type.
type Attributes = { [key:string]: string };

/// node classList type.
type Classes = { [key:string]: boolean };

/// node builder type.
export interface NodeBuilder {
    /**
     *  create new tag element.
     *
     *  @param name tag name.
     *  @param fn inner tag definition.
     *  @return node builder.
     */
    tag(name: string, fn?: (b: NodeBuilder) => void): NodeBuilder;

    /**
     *  add an attribute.
     *
     *  @param name attribute name.
     *  @param value attribute value.
     *  @return node builder.
     */
    attr(name: string, value: string): NodeBuilder;

    /**
     *  add an CSS style class.
     *
     *  @param name class name.
     *  @return node builder.
     */
    cls(name: string): NodeBuilder;

    /**
     *  add an text node.
     *
     *  @param value text node content.
     *  @return node builder.
     */
    text(value: string): NodeBuilder;

    /**
     *  add event listener.
     *
     *  @param eventType listening event type.
     *  @param handler event handler.
     *  @param option event capture | event listen options.
     */
    event(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): NodeBuilder;

    /// current Element instance.
    readonly element: Element;
}

/// view class interface.
export interface View {
    /**
     *  render this view to node.
     *
     *  @param b node builder.
     */
    render(b: NodeBuilder): void;
}

/// node builder implementation
class NodeBuilderImpl implements NodeBuilder {
    private parent: Element;
    private node: Node | null;
    private attributes: Attributes | null;
    private classes : Classes | null;
    private eventListenerSet: EventListenerSet | null;

    /**
     *  @param root root element.
     */
    constructor(root: Element) {
        this.parent = root;
        this.node = root.firstChild;
        this.attributes = null;
        this.classes = null;
        this.eventListenerSet = null;
    }

    /**
     *  build nodes.
     *
     *  @param fn build function.
     */
    build(fn: (b: NodeBuilder) => void): void {
        fn(this);
        this.removeRestNodes();

        const element = this.parent;
        const currentSet = (<EventListenerSet | undefined>
            (<any>element).__vdom_eventListenerSet);
        const newSet = this.eventListenerSet;
        if(currentSet) {
            currentSet.eachRemovedEntries(newSet, (e) => {
                e.removeFrom(element);
            });
            currentSet.eachAddedEntries(newSet, (e) => {
                e.addTo(element);
            });
        } else if(newSet) {
            newSet.eachEntries((e) => e.addTo(element));
        }
        (<any>element).__vdom_eventListenerSet = newSet;
    }

    // remove unmatched rest nodes.
    private removeRestNodes(): void {
        if(!this.node) {
            return;
        }

        while(this.node.nextSibling) {
            this.parent.removeChild(this.node.nextSibling);
        }
        this.parent.removeChild(this.node);
    }

    // update current element attributes
    private updateAttributes(): void {
        if(!this.node || this.node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const element = (<Element>this.node);

        // update exists attributes.
        const newAttrsSet = this.attributes;
        if(newAttrsSet) {
            for(let key of Object.keys(newAttrsSet)) {
                element.setAttribute(key, newAttrsSet[key]);
            }
        }

        // remove rest attributes.
        const attrs = element.attributes;
        for(let i = 0; i < attrs.length;) {
            const key = attrs[i].name;
            if(!newAttrsSet || !newAttrsSet.hasOwnProperty(key)) {
                element.removeAttribute(key);
            } else {
                ++i;
            }
        }

        // update exists classes
        const classList = element.classList;
        const newClassList = this.classes;
        if(newClassList) {
            classList.add(...Object.keys(newClassList));
        }

        // remove rest classes.
        for(let i = 0; i < classList.length;) {
            const name = classList[i];
            if(!newClassList || !newClassList.hasOwnProperty(name)) {
                classList.remove(name);
            } else {
                ++i;
            }
        }
    }

    tag(name: string, fn?: (b: NodeBuilder) => void): NodeBuilder {
        // create a new child element
        if(!this.node
                || this.node.nodeType !== Node.ELEMENT_NODE
                || (<Element>this.node).tagName !== name.toUpperCase()) {
            const child: Element = document.createElement(name);
            if(this.node) {
                this.parent.insertBefore(child, this.node);
            } else {
                this.parent.appendChild(child);
            }
            this.node = child;
        }

        // recursive call
        const currentParent = this.parent;
        const currentElement = <Element>this.node;
        const currentAttributes = this.attributes;
        const currentClasses = this.classes;
        const currentEventListenerSet = this.eventListenerSet;
        this.parent = <Element>this.node;
        this.node = this.parent.firstChild;
        this.attributes = null;
        this.classes = null;
        this.eventListenerSet = null;
        if(fn) {
            this.build(fn);
        } else {
            // nothing rest nodes.
            this.removeRestNodes();
        }
        this.eventListenerSet = currentEventListenerSet;
        this.node = currentElement;
        this.parent = currentParent;

        // apply attributes from recursive call.
        this.updateAttributes();
        this.attributes = currentAttributes;
        this.classes = currentClasses;

        // move to next element.
        if(this.node) {
            this.node = this.node.nextSibling;
        }

        return this;
    }

    attr(name: string, value: string): NodeBuilder {
        if(!this.attributes) {
            this.attributes = (<Attributes>{});
        }
        this.attributes[name] = value;
        return this;
    }

    cls(name: string): NodeBuilder {
        if(!this.classes) {
            this.classes = (<Classes>{});
        }
        this.classes[name] = true;
        return this;
    }

    text(value: string): NodeBuilder {
        // create a new child element
        if(!this.node || this.node.nodeType !== Node.TEXT_NODE) {
            const child: Text = document.createTextNode(value);
            if(this.node) {
                this.parent.insertBefore(child, this.node);
            } else {
                this.parent.appendChild(child);
            }
            this.node = child;
        } else if(this.node.textContent !== value) {
            this.node.textContent = value;
        }

        // move to next node.
        if(this.node) {
            this.node = this.node.nextSibling;
        }

        return this;
    }

    event(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): NodeBuilder {
        if(!this.eventListenerSet) {
            this.eventListenerSet = new EventListenerSet();
        }
        this.eventListenerSet.add(type, listener, options);
        return this;
    }

    get element(): Element {
        return this.parent;
    }
}

export function build(root: Element, fn: (b: NodeBuilder) => void): Element {
    (new NodeBuilderImpl(root)).build(fn);
    return root;
}

