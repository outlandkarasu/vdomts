import {View, NodeBuilder, EventHandler} from "./vdom";
import {EventHandlerSet} from "./eventHandlerSet";

/// node attributes type.
type Attributes = { [key:string]: string };

/// node classList type.
type Classes = { [key:string]: boolean };

/// node properies type.
type Properties = { [key:string]: any };

/// css style properies type.
type Styles = { [key:string]: string };

/// building state.
class State {
    private view_: View;
    element: Element;
    child: Node | null;
    private attributes_: Attributes | null;
    private classes_: Classes | null;
    private properties_: Properties | null;
    private styles_: Styles | null;

    constructor(view: View, element: Element, child: Node | null) {
        this.view_ = view;
        this.element = element;
        this.child = child;
        this.attributes_ = null;
        this.classes_ = null;
        this.properties_ = null;
        this.styles_ = null;
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

    prop(name: string, value: any): void {
        if(!this.properties_) {
            this.properties_ = (<Properties>{});
        }
        this.properties_[name] = value;
    }

    style(name: string, value: string): void {
        if(!this.styles_) {
            this.styles_ = (<Styles>{});
        }
        this.styles_[name] = value;
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

    end(): void {
        this.removeRestNodes();
        this.syncEventHandlers();
        this.replaceAttributes();
        this.replaceClasses();
        this.updateProperties();
        this.updateStyles();
    }

    private get eventHandlerSet(): EventHandlerSet | null {
        return <EventHandlerSet | null> (<any>this.element).__vdom_eventHandlerSet;
    }

    private set eventHandlerSet(eventHandlerSet: EventHandlerSet | null) {
        (<any>this.element).__vdom_eventHandlerSet = eventHandlerSet;
    }

    /// remove unmatched rest nodes.
    private removeRestNodes(): void {
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
    private replaceAttributes(): void {
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
    private replaceClasses(): void {
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

    private updateProperties(): void {
        const properties = this.properties_;
        if(!properties) {
            return;
        }

        const element = this.element;
        for(const k of Object.keys(properties)) {
            (<any>element)[k] = properties[k];
        }
    }

    private updateStyles(): void {
        const element = <HTMLElement>this.element;
        const style = element.style;
        const newStyles = this.styles_;
        if(newStyles) {
            for(const k of Object.keys(newStyles)) {
                style.setProperty(k, newStyles[k]);
            }
        }

        // remove rest styles.
        for(let i = 0; i < style.length;) {
            const name = style[i];
            if(!newStyles || !newStyles.hasOwnProperty(name)) {
                style.removeProperty(name);
            } else {
                ++i;
            }
        }
    }

    private syncEventHandlers(): void {
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
        this.state.end();
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
        const child = this.moveOrInsertNextTag(name);
        this.viewState.startNewState(child);
        return this;
    }

    private moveOrInsertNextTag(name: string): Element {
        // create a new child element
        const state = this.state;
        const element = state.element;
        let child = state.child;
        if(!child
                || child.nodeType !== Node.ELEMENT_NODE
                || (<Element>child).tagName !== name.toUpperCase()) {
            const newChild = document.createElement(name);
            if(child) {
                element.insertBefore(newChild, child);
            } else {
                element.appendChild(newChild);
            }
            state.child = newChild;
            child = newChild;
        }
        return <Element> child;
    }

    attr(name: string, value: string): NodeBuilder {
        this.state.attr(name, value);
        return this;
    }

    attrIf(name: string, value: string, enable: boolean): NodeBuilder {
        return enable ? this.attr(name, value) : this;
    }

    cls(name: string): NodeBuilder {
        this.state.cls(name);
        return this;
    }

    clsIf(name: string, enable: boolean): NodeBuilder {
        return enable ? this.cls(name) : this;
    }

    prop(name: string, value: any): NodeBuilder {
        this.state.prop(name, value);
        return this;
    }

    propIf(name: string, value: any, enable: boolean): NodeBuilder {
        return enable ? this.prop(name, value) : this;
    }

    style(name: string, value: any): NodeBuilder {
        this.state.style(name, value);
        return this;
    }

    styleIf(name: string, value: any, enable: boolean): NodeBuilder {
        return enable ? this.style(name, value) : this;
    }

    text(value: string): NodeBuilder {
        this.state.text(value);
        return this;
    }

    view(v: View): NodeBuilder {
        // start view element tag.
        const element = this.moveOrInsertNextTag(v.tagName);
        v.element = element;

        // start view rendering.
        try {
            this.startNewViewState(v.element, v);
            v.render(this);
        } finally {
            // end view rendering.
            this.endViewState();

            // move to next element.
            this.state.child = element.nextSibling;
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

    private startNewViewState(newRoot: Element, view: View): void {
        this.stack_.push(new ViewState(newRoot, view));
    }

    private endViewState(): void {
        this.viewState.endView();
        this.stack_.pop();
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

