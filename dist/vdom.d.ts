export interface NodeBuilder {
    tag(name: string, fn?: (b: NodeBuilder) => void): NodeBuilder;
    attr(name: string, value: string): NodeBuilder;
    cls(name: string): NodeBuilder;
    text(value: string): NodeBuilder;
    event(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): NodeBuilder;
    readonly element: Element;
}
export interface View {
    render(b: NodeBuilder): void;
}
export declare function build(root: Element, fn: (b: NodeBuilder) => void): Element;
