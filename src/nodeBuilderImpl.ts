import {View, NodeBuilder, EventHandler} from "./vdom";
import {EventListenerSet} from "./eventListenerSet";

/// node attributes type.
type Attributes = { [key:string]: string };

/// node classList type.
type Classes = { [key:string]: boolean };

/// building state.
class State {
    private view_: View;
    element: Element;
    child: Node | null;
    private attributes_: Attributes | null;
    private classes_: Classes | null;

    constructor(view: View, element: Element, child: Node | null) {
        this.view_ = view;
        this.element = element;
        this.child = child;
        this.attributes_ = null;
        this.classes_ = null;
    }

    attr(name: string, value: string): void {
        if(!this.attributes_) {
            this.attributes_ = (<Attributes>{});
        }
        this.attributes_[name] = value;
    }

    cls(name: string): void {
        if(!this.classes_) {
            this.classes_ = (<Classes>{});
        }
        this.classes_[name] = true;
    }

    text(value: string): void {
        // create a new child element
        let child = this.child;
        if(!child || child.nodeType !== Node.TEXT_NODE) {
            const newChild: Text = document.createTextNode(value);
            const element = this.element;
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
        this.child = child.nextSibling;
    }

    event(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): void {
        if(!this.eventListeners) {
            this.eventListeners = new EventListenerSet();
        }
        this.eventListeners.add(this.view_, type, handler, options);
    }


    get eventListeners(): EventListenerSet | null {
        return <EventListenerSet | null> (<any>this.element).__vdom_eventListeners;
    }

    set eventListeners(eventListenerSet: EventListenerSet | null) {
        (<any>this.element).__vdom_eventListeners = eventListenerSet;
    }

    /// remove unmatched rest nodes.
    removeRestNodes(): void {
        const child = this.child;
        if(!child) {
            return;
        }

        const element = this.element;
        while(child.nextSibling) {
            element.removeChild(child.nextSibling);
        }
        element.removeChild(child);
    }

    syncEventListeners(): void {
        const eventListeners = this.eventListeners;
        if(eventListeners) {
            eventListeners.syncHandlers(this.element);
        }
    }

    // update current element attributes
    replaceAttributes(): void {
        const element = this.element;

        // update exists attributes.
        const newAttrsSet = this.attributes_;
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

    replaceClasses(): void {
        // update exists classes
        const classList = this.element.classList;
        const newClassList = this.classes_;
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

    syncHandlers(): void {
        const eventListeners = this.eventListeners;
        if(eventListeners) {
            eventListeners.syncHandlers(this.element);
        }
    }
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
        this.stack_.push(new State(this.view_, newRoot, newRoot.firstChild));
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
        this.state.attr(name, value);
        return this;
    }

    cls(name: string): NodeBuilder {
        this.state.cls(name);
        return this;
    }

    text(value: string): NodeBuilder {
        this.state.text(value);
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
        this.event(type, handler, options);
        return this;
    }

    end(): NodeBuilder {
        return this.viewState.stateCount < 2 ? this : this.forceEnd();
    }

    private forceEnd(): NodeBuilder {
        this.removeRestNodes();
        this.syncEventListeners();
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

    private endViewState(): void {
        this.endAll();
        this.stack_.pop();
    }

    private removeRestNodes(): void {
        this.state.removeRestNodes();
    }

    private syncEventListeners(): void {
        this.state.syncEventListeners();
    }

    private replaceAttributes(): void {
        this.state.replaceAttributes();
    }

    private replaceClasses(): void {
        this.state.replaceClasses();
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

