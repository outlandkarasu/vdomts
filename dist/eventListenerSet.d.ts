export declare type EventOptions = boolean | AddEventListenerOptions | undefined;
export declare class EventListenerEntry {
    private type_;
    private listener_;
    private options_;
    constructor(type: string, listener: EventListenerOrEventListenerObject, options: EventOptions);
    readonly capture: boolean;
    equals(other: EventListenerEntry): boolean;
    addTo(target: EventTarget): void;
    removeFrom(target: EventTarget): void;
}
export declare class EventListenerSet {
    private entries_;
    constructor();
    add(type: string, listener: EventListenerOrEventListenerObject, options: EventOptions): void;
    find(e: EventListenerEntry): boolean;
    eachRemovedEntries(newSet: EventListenerSet | null, fn: (e: EventListenerEntry) => void): void;
    eachAddedEntries(newSet: EventListenerSet | null, fn: (e: EventListenerEntry) => void): void;
    eachEntries(fn: (e: EventListenerEntry) => void): void;
}
