/**
 *  Virtual DOM implementation.
 */

/// event handler type.
export type EventHandler = (e: Event) => any;

/// node builder type.
export interface NodeBuilder {

    /**
     *  create new tag element and start new state.
     *
     *  @param name tag name.
     *  @return node builder.
     */
    tag(name: string): NodeBuilder;

    /**
     *  add an attribute.
     *
     *  @param name attribute name.
     *  @param value attribute value.
     *  @return node builder.
     */
    attr(name: string, value: string): NodeBuilder;

    /**
     *  add an attribute if enable.
     *
     *  @param name attribute name.
     *  @param value attribute value.
     *  @param enable enable flag.
     *  @return node builder.
     */
    attrIf(name: string, value: string, enable: boolean): NodeBuilder;

    /**
     *  add an CSS style class.
     *
     *  @param name class name.
     *  @return node builder.
     */
    cls(name: string): NodeBuilder;

    /**
     *  add an CSS style class if enable.
     *
     *  @param name class name.
     *  @param enable enable flag.
     *  @return node builder.
     */
    clsIf(name: string, enable: boolean): NodeBuilder;

    /**
     *  add an text node.
     *
     *  @param value text node content.
     *  @return node builder.
     */
    text(value: string): NodeBuilder;

    /**
     *  add a sub view.
     *
     *  @param v sub view.
     *  @return node builder.
     */
    view(v: View): NodeBuilder;

    /**
     *  add event handler.
     *
     *  @param eventType listening event type.
     *  @param handler event handler.
     *  @param option event capture | event listen options.
     */
    event(type: string, handler: EventHandler, options?: boolean | AddEventListenerOptions): NodeBuilder;

    /// current Element instance.
    readonly element: Element;

    /**
     *  close current element.
     */
    end(): NodeBuilder;
}

/// view class interface.
export interface View {

    /**
     *  element tag name.
     */
    readonly tagName: string;

    /**
     *  render this view to node.
     *
     *  @param b node builder.
     */
    render(b: NodeBuilder): void;

    /**
     *  HTML element.
     */
    element?: Element;
}

export {build, rebuild} from "./nodeBuilderImpl";
export {Action, Store} from "./store";

