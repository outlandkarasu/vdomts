export declare type EventHandler = (e: Event) => any;
export interface NodeBuilder {
    tag(name: string): NodeBuilder;
    attr(name: string, value: string): NodeBuilder;
    cls(name: string): NodeBuilder;
    text(value: string): NodeBuilder;
    view(v: View): NodeBuilder;
    event(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): NodeBuilder;
    readonly element: Element;
    end(): NodeBuilder;
}
export interface View {
    readonly tagName: string;
    render(b: NodeBuilder): void;
    element?: Element;
}
export { build, rebuild } from "./nodeBuilderImpl";
