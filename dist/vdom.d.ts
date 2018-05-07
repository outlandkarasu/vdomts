export declare type EventHandler = (e: Event) => any;
export interface NodeBuilder {
    tag(name: string): NodeBuilder;
    attr(name: string, value: string): NodeBuilder;
    attrIf(name: string, value: string, enable: boolean): NodeBuilder;
    cls(name: string): NodeBuilder;
    clsIf(name: string, enable: boolean): NodeBuilder;
    prop(name: string, value: any): NodeBuilder;
    propIf(name: string, value: any, enable: boolean): NodeBuilder;
    style(name: string, value: any): NodeBuilder;
    styleIf(name: string, value: any, enable: boolean): NodeBuilder;
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
export { Action, Store } from "./store";
