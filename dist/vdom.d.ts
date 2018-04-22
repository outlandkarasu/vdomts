export interface NodeBuilder {
    tag(name: string): NodeBuilder;
    attr(name: string, value: string): NodeBuilder;
    cls(name: string): NodeBuilder;
    text(value: string): NodeBuilder;
    view(v: View): NodeBuilder;
    event(type: string, listener: (e: Event) => any, options?: boolean | AddEventListenerOptions): NodeBuilder;
    readonly element: Element;
    end(): NodeBuilder;
}
export interface View {
    readonly tagName: string;
    render(b: NodeBuilder): void;
}
export { build } from "./nodeBuilderImpl";
