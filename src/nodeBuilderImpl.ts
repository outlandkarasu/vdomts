import {View, NodeBuilder, EventHandler} from "./vdom";
import {EventHandlerSet} from "./eventHandlerSet";

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
        if(!this.eventHandlerSet) {
            this.eventHandlerSet = new EventHandlerSet();
        }
        this.eventHandlerSet.add(this.view_, type, handler, options);
    }


    get eventHandlerSet(): EventHandlerSet | null {
        return <EventHandlerSet | null> (<any>this.element).__vdom_eventHandlerSet;
    }

    set eventHandlerSet(eventHandlerSet: EventHandlerSet | null) {
        (<any>this.element).__vdom_eventHandlerSet = eventHandlerSet;
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

    /// replace element attributes.
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

    /// replace element style classes.
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

    syncEventHandlers(): void {
        const eventHandlerSet = this.eventHandlerSet;
        if(eventHandlerSet) {
            eventHandlerSet.syncEventHandlers(this.element);
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

    endTag(): void {
        if(this.stack_.length === 1) {
            return;
        }
        this.forceEndTag();
    }

    endView(): void {
        while(this.stack_.length > 0) {
            this.forceEndTag();
        }
    }

    private forceEndTag(): void {
        const endState = this.state;
        endState.removeRestNodes();
        endState.syncEventHandlers();
        endState.replaceAttributes();
        endState.replaceClasses();

        this.stack_.pop();

        const parentState = this.state;
        if(parentState && parentState.child) {
            parentState.child = parentState.child.nextSibling;
        }
    }
}

export class NodeBuilderImpl implements NodeBuilder {
    private stack_: ViewState[] = [];

    constructor(root: Element, rootView: View) {
        this.startNewViewState(root, rootView);
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
            v.element = this.state.element;

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
        this.state.event(type, handler, options);
        return this;
    }

    end(): NodeBuilder {
        this.viewState.endTag();
        return this;
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
        this.viewState.endView();
        this.stack_.pop();
    }

    private removeRestNodes(): void {
        this.state.removeRestNodes();
    }

    private syncEventHandlers(): void {
        this.state.syncEventHandlers();
    }

    private replaceAttributes(): void {
        this.state.replaceAttributes();
    }

    private replaceClasses(): void {
        this.state.replaceClasses();
    }
}

/**
 *  build new node tree.
 *
 *  @param root root element.
 *  @param fn building function.
 */
export function build(root: Element, fn: (b: NodeBuilder) => void): void {
    const rootView: View = {
        element: root,
        get tagName(): string {
            return root.tagName;
        },
        render(b: NodeBuilder): void {
        }
    };
    (new NodeBuilderImpl(root, rootView)).build(fn);
}

/**
 *  rebuild view node.
 *  skip if element is null.
 *
 *  @param view rebuild view.
 */
export function rebuild(view: View): void {
    if(view.element) {
        (new NodeBuilderImpl(view.element, view)).build((b) => view.render(b));
    }
}

