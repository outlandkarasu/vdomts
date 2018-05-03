import { View, NodeBuilder, EventHandler } from "./vdom";
export declare class NodeBuilderImpl implements NodeBuilder {
    private stack_;
    constructor(root: Element, rootView: View);
    readonly element: Element;
    tag(name: string): NodeBuilder;
    private moveOrInsertNextTag(name);
    attr(name: string, value: string): NodeBuilder;
    attrIf(name: string, value: string, enable: boolean): NodeBuilder;
    cls(name: string): NodeBuilder;
    clsIf(name: string, enable: boolean): NodeBuilder;
    prop(name: string, value: any): NodeBuilder;
    propIf(name: string, value: any, enable: boolean): NodeBuilder;
    text(value: string): NodeBuilder;
    view(v: View): NodeBuilder;
    event(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): NodeBuilder;
    end(): NodeBuilder;
    build(fn: (b: NodeBuilder) => void): void;
    private readonly viewState;
    private readonly state;
    private startNewViewState(newRoot, view);
    private endViewState();
}
export declare function build(root: Element, fn: (b: NodeBuilder) => void): void;
export declare function rebuild(view: View): void;
