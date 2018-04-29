import { View, EventHandler } from "./vdom";
export declare type EventOptions = boolean | AddEventListenerOptions | undefined;
export declare class EventListenerEntry {
    private view_;
    private type_;
    private handler_;
    private closure_;
    private options_;
    private added_;
    private target_;
    constructor(view: View, type: string, handler: EventHandler, options: EventOptions);
    readonly added: boolean;
    readonly capture: boolean;
    match(view: View, type: string, handler: EventHandler, options: EventOptions): boolean;
    equals(other: EventListenerEntry): boolean;
    addEventHandlerTo(target: EventTarget): void;
    removeEventHandler(): void;
    setAddedFlag(): void;
    clearAddedFlag(): void;
}
export declare class EventListenerSet {
    private entries_;
    constructor();
    contains(view: View, type: string, handler: EventHandler, options: EventOptions): boolean;
    add(view: View, type: string, handler: EventHandler, options: EventOptions): void;
    syncHandlers(target: EventTarget): void;
    private find(view, type, handler, options);
}
