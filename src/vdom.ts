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
     *  create new tag element and start new state.
     *
     *  @param name tag name.
     *  @return node builder.
     */
    tag(name: string): NodeBuilder;

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
     *  add a sub view.
     *
     *  @param v sub view.
     *  @return node builder.
     */
    view(v: View): NodeBuilder;

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

    /**
     *  close current element.
     */
    end(): NodeBuilder;
}

/// view class interface.
export interface View {

    /**
     *  @return element tag name.
     */
    readonly tagName: string;

    /**
     *  render this view to node.
     *
     *  @param b node builder.
     */
    render(b: NodeBuilder): void;
}

/// building state.
interface State {
    element: Element;
    child: Node | null;
    attributes: Attributes | null;
    classes : Classes | null;
    eventListeners: EventListenerSet | null;
}

class NodeBuilderImpl implements NodeBuilder {
    private stack_: State[];

    constructor(root: Element) {
        this.stack_ = [];
        this.startNewState(root);
    }

    get element(): Element {
        return this.state.element;
    }

    tag(name: string): NodeBuilder {
        // create a new child element
        const state = this.state;
        const element = state.element;
        let child = state.child;
        if(!child
                || child.nodeType !== Node.ELEMENT_NODE
                || (<Element>child).tagName !== name.toUpperCase()) {
            const newChild: Element = document.createElement(name);
            if(child) {
                element.insertBefore(newChild, child);
            } else {
                element.appendChild(newChild);
            }
            state.child = newChild;
            child = newChild;
        }
        this.startNewState(<Element>child);

        return this;
    }

    attr(name: string, value: string): NodeBuilder {
        if(!this.state.attributes) {
            this.state.attributes = (<Attributes>{});
        }
        this.state.attributes[name] = value;
        return this;
    }

    cls(name: string): NodeBuilder {
        if(!this.state.classes) {
            this.state.classes = (<Classes>{});
        }
        this.state.classes[name] = true;
        return this;
    }

    text(value: string): NodeBuilder {
        // create a new child element
        const state = this.state;
        let child = state.child;
        if(!child || child.nodeType !== Node.TEXT_NODE) {
            const newChild: Text = document.createTextNode(value);
            const element = state.element;
            if(child) {
                element.insertBefore(newChild, child);
            } else {
                element.appendChild(newChild);
            }
            child = newChild;
        } else if(child.textContent !== value) {
            child.textContent = value;
        }

        // move to next node.
        state.child = child.nextSibling;
        return this;
    }

    view(v: View): NodeBuilder {
        v.render(this.tag(v.tagName));
        return this;
    }

    event(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): NodeBuilder {
        if(!this.state.eventListeners) {
            this.state.eventListeners = new EventListenerSet();
        }
        this.state.eventListeners.add(type, listener, options);
        return this;
    }

    end(): NodeBuilder {
        this.removeRestNodes();
        this.replaceEventListeners();
        this.replaceAttributes();
        this.replaceClasses();
        this.stack_.pop();

        // move to next element.
        const state = this.state;
        if(state && state.child) {
            state.child = state.child.nextSibling;
        }

        return this;
    }

    endAll(): void {
        while(this.stack_.length > 0) {
            this.end();
        }
    }

    private get state(): State {
        return this.stack_[this.stack_.length - 1];
    }

    private startNewState(newRoot: Element) {
        this.stack_.push({
            element: newRoot,
            child: newRoot.firstChild,
            attributes: null,
            classes: null,
            eventListeners: null
        });
    }

    // remove unmatched rest nodes.
    private removeRestNodes(): void {
        const state = this.state;
        const child = state.child;
        if(!child) {
            return;
        }

        const element = state.element;
        while(child.nextSibling) {
            element.removeChild(child.nextSibling);
        }
        element.removeChild(child);
    }

    private replaceEventListeners(): void {
        const state = this.state;
        const element = state.element;
        const currentSet = <EventListenerSet | undefined> (<any>element).__vdom_eventListeners;
        const newSet = state.eventListeners;
        if(currentSet) {
            currentSet.eachRemovedEntries(newSet, (e) => e.removeFrom(element));
            currentSet.eachAddedEntries(newSet, (e) => e.addTo(element));
        } else if(newSet) {
            newSet.eachEntries((e) => e.addTo(element));
        }
        (<any>element).__vdom_eventListeners = newSet;
    }

    // update current element attributes
    private replaceAttributes(): void {
        const state = this.state;
        const element = state.element;

        // update exists attributes.
        const newAttrsSet = state.attributes;
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
    }

    private replaceClasses(): void {
        const state = this.state;
        const element = state.element;

        // update exists classes
        const classList = element.classList;
        const newClassList = state.classes;
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
}

export function build(root: Element, fn: (b: NodeBuilder) => void): Element {
    const builder = new NodeBuilderImpl(root);
    fn(builder);
    builder.endAll();
    return root;
}

export function render(root: Element, v: View): Element {
    const builder = new NodeBuilderImpl(root);
    builder.view(v);
    builder.endAll();
    return root;
}

