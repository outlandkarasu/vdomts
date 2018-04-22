/**
 *  Event listener map.
 */

import {View, EventHandler} from "./vdom";

export type EventOptions = boolean | AddEventListenerOptions | undefined;

/// event listener entry.
export class EventListenerEntry {
    private type_: string;
    private handler_: EventHandler;
    private options_: EventOptions;

    constructor(type: string, handler: EventHandler, options: EventOptions) {
        this.type_ = type;
        this.handler_ = handler;
        this.options_ = options;
    }

    /// is capture.
    get capture(): boolean {
        const options = this.options_;
        if(!options) {
            return false;
        } else if(options instanceof Object) {
            return Boolean((<AddEventListenerOptions>options).capture);
        } else {
            return Boolean(options);
        }
    }

    /// compare event listener
    equals(other: EventListenerEntry): boolean {
        return this.type_ === other.type_
            && this.handler_ === other.handler_
            && this.capture === other.capture;
    }

    /// add event handler to target.
    addTo(target: EventTarget): void {
        target.addEventListener(this.type_, this.handler_, this.options_);
    }

    /// remove event handler from target.
    removeFrom(target: EventTarget): void {
        target.removeEventListener(this.type_, this.handler_, this.options_);
    }
}

/// event listener set
export class EventListenerSet {

    private entries_: EventListenerEntry[];

    constructor() {
        this.entries_ = [];
    }

    /// add an event listener.
    add(type: string, handler: EventHandler, options: EventOptions) {
        this.entries_.push(new EventListenerEntry(type, handler, options));
    }

    /// find an event listener.
    find(e: EventListenerEntry): boolean {
        for(let entry of this.entries_) {
            if(e.equals(entry)) {
                return true;
            }
        }
        return false;
    }

    /// for each removed handler.
    eachRemovedEntries(newSet: EventListenerSet | null, fn: (e: EventListenerEntry) => void): void {
        for(let e of this.entries_) {
            if(!newSet || !newSet.find(e)) {
                fn(e);
            }
        }
    }

    /// for each added handler.
    eachAddedEntries(newSet: EventListenerSet | null, fn: (e: EventListenerEntry) => void): void {
        if(!newSet) {
            return;
        }

        for(let e of newSet.entries_) {
            if(!this.find(e)) {
                fn(e);
            }
        }
    }

    /// for each entries
    eachEntries(fn: (e: EventListenerEntry) => void): void {
        for(let e of this.entries_) {
            fn(e);
        }
    }
}

