import { View, NodeBuilder, EventHandler } from "./vdom";
export declare class NodeBuilderImpl implements NodeBuilder {
    private stack_;
    constructor(root: Element, view: View);
    readonly element: Element;
    tag(name: string): NodeBuilder;
    attr(name: string, value: string): NodeBuilder;
    cls(name: string): NodeBuilder;
    text(value: string): NodeBuilder;
    view(v: View): NodeBuilder;
    event(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): NodeBuilder;
    end(): NodeBuilder;
    private forceEnd();
    endAll(): void;
    build(fn: (b: NodeBuilder) => void): void;
    private readonly viewState;
    private readonly state;
    private startNewState(newRoot);
    private startNewViewState(newRoot, view);
    private endViewState();
    private removeRestNodes();
    private syncEventListeners();
    private replaceAttributes();
    private replaceClasses();
}
export declare function build(root: Element, fn: (b: NodeBuilder) => void): Element;
