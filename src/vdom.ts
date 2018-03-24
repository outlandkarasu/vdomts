/**
 *  Virtual DOM implementation.
 */

import {EventListenerSet} from "./eventListenerSet";

/// node attributes type.
type Attributes = { [key:string]: string };

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
    readonly element: Element | undefined;
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
    private parent: Node;
    private node: Node | null;
    private attributes: Attributes | null;
    private eventListenerSet: EventListenerSet | null;

    /**
     *  @param root root element.
     */
    constructor(root: Element) {
        this.parent = root;
        this.node = root.firstChild;
        this.attributes = null;
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

        const element: Element = (<Element>this.node);

        // update exists attributes.
        if(this.attributes) {
            for(let key of Object.keys(this.attributes)) {
                element.setAttribute(key, this.attributes[key]);
            }
        }

        // remove rest attributes.
        const attrs: NamedNodeMap = element.attributes;
        for(let i: number = 0; i < attrs.length;) {
            const key = attrs[i].name;
            if(!this.attributes || !this.attributes.hasOwnProperty(key)) {
                element.removeAttribute(key);
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
        const currentElement = this.node;
        const currentAttributes = this.attributes;
        const currentEventListenerSet = this.eventListenerSet;
        this.parent = this.node;
        this.node = this.parent.firstChild;
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

    get element(): Element | undefined {
        return (this.parent && this.parent.nodeType === Node.ELEMENT_NODE) ? (<Element>this.parent) : undefined;
    }
}

export function build(root: Element, fn: (b: NodeBuilder) => void): Element {
    (new NodeBuilderImpl(root)).build(fn);
    return root;
}

