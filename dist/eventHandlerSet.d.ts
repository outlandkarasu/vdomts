import { View, EventHandler } from "./vdom";
export declare type EventOptions = boolean | AddEventListenerOptions | undefined;
export declare class EventHandlerEntry {
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
    equals(other: EventHandlerEntry): boolean;
    addEventHandlerTo(target: EventTarget): void;
    removeEventHandler(): void;
    setAddedFlag(): void;
    clearAddedFlag(): void;
}
export declare class EventHandlerSet {
    private entries_;
    constructor();
    contains(view: View, type: string, handler: EventHandler, options: EventOptions): boolean;
    add(view: View, type: string, handler: EventHandler, options: EventOptions): void;
    syncEventHandlers(target: EventTarget): void;
    private find(view, type, handler, options);
}
