import {View, NodeBuilder, EventHandler} from "./vdom";
import {EventListenerSet} from "./eventListenerSet";

/// node attributes type.
type Attributes = { [key:string]: string };

/// node classList type.
type Classes = { [key:string]: boolean };

/// building state.
interface State {
    element: Element;
    child: Node | null;
    attributes: Attributes | null;
    classes : Classes | null;
    eventListeners: EventListenerSet | null;
}

class ViewState {
    private stack_: State[];
    private view_: View;

    constructor(root: Element, view: View) {
        this.stack_ = [];
        this.view_ = view;
        this.startNewState(root);
    }

    get view(): View {
        return this.view_;
    }

    get state(): State {
        return this.stack_[this.stack_.length - 1];
    }

    get stateCount(): number {
        return this.stack_.length;
    }

    startNewState(newRoot: Element): void {
        this.stack_.push({
            element: newRoot,
            child: newRoot.firstChild,
            attributes: null,
            classes: null,
            eventListeners: null
        });
    }

    popState(): void {
        this.stack_.pop();
    }
}

export class NodeBuilderImpl implements NodeBuilder {
    private stack_: ViewState[];

    constructor(root: Element, view: View) {
        this.stack_ = [];
        this.startNewViewState(root, view);
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
        try {
            // start view element tag.
            this.tag(v.tagName);

            // start view rendering.
            try {
                this.startNewViewState(this.state.element, v);
                v.render(this);
            } finally {
                // end view rendering.
                this.endViewState();
            }
        } finally {
            // close view element tag
            this.end();
        }
        return this;
    }

    event(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): NodeBuilder {
        if(!this.state.eventListeners) {
            this.state.eventListeners = new EventListenerSet();
        }
        this.state.eventListeners.add(type, handler, options);
        return this;
    }

    end(): NodeBuilder {
        return this.viewState.stateCount < 2 ? this : this.forceEnd();
    }

    private forceEnd(): NodeBuilder {
        this.removeRestNodes();
        this.replaceEventListeners();
        this.replaceAttributes();
        this.replaceClasses();
        this.viewState.popState();

        // move to next element.
        const state = this.state;
        if(state && state.child) {
            state.child = state.child.nextSibling;
        }

        return this;
    }

    endAll(): void {
        while(this.viewState.stateCount > 0) {
            this.forceEnd();
        }
    }

    build(fn: (b: NodeBuilder) => void): void {
        try {
          fn(this);
        } finally {
            this.endViewState();
        }
    }

    private get viewState(): ViewState {
        return this.stack_[this.stack_.length - 1];
    }

    private get state(): State {
        return this.viewState.state;
    }

    private startNewState(newRoot: Element): void {
        this.viewState.startNewState(newRoot);
    }

    private startNewViewState(newRoot: Element, view: View): void {
        this.stack_.push(new ViewState(newRoot, view));
    }

    private endViewState() {
        this.endAll();
        this.stack_.pop();
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
    const rootView = {
        get tagName() {
            return root.tagName;
        },

        render(b: NodeBuilder): void {
            // do nothing
        }
    };

    (new NodeBuilderImpl(root, rootView)).build(fn);
    return root;
}

