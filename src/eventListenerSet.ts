/**
 *  Event listener map.
 */

import {View, EventHandler} from "./vdom";

export type EventOptions = boolean | AddEventListenerOptions | undefined;

/// is capture event options
function isCapture(options: EventOptions): boolean {
    if(!options) {
        return false;
    } else if(options instanceof Object) {
        return Boolean((<AddEventListenerOptions>options).capture);
    } else {
        return Boolean(options);
    }
}

/// event listener entry.
export class EventListenerEntry {
    private view_: View;
    private type_: string;
    private handler_: EventHandler; private closure_: EventHandler;
    private options_: EventOptions;
    private added_: boolean;
    private target_: EventTarget | null;

    constructor(view: View, type: string, handler: EventHandler, options: EventOptions) {
        this.view_ = view;
        this.type_ = type;
        this.handler_ = handler;
        this.closure_ = handler.bind(view);
        this.options_ = options;
        this.added_ = true;
        this.target_ = null;
    }

    /// is added.
    get added(): boolean {
        return this.added_;
    }

    /// is capture.
    get capture(): boolean {
        return isCapture(this.options_);
    }

    /// check event handler equality by paramaeters.
    match(view: View, type: string, handler: EventHandler, options: EventOptions): boolean {
        return this.view_ === view
            && this.type_ === type
            && this.handler_ === handler
            && this.capture === isCapture(options);
    }

    /// compare event listener
    equals(other: EventListenerEntry): boolean {
        return this.view_ === other.view_
            && this.type_ === other.type_
            && this.handler_ === other.handler_
            && this.capture === other.capture;
    }

    /// add event handler to target.
    addEventHandlerTo(target: EventTarget): void {
        // remove from old target.
        if(this.target_) {
            if(this.target_ === target) {
                // already added.
                return;
            } else {
                this.removeEventHandler();
            }
        }

        this.target_ = target;
        this.target_.addEventListener(this.type_, this.closure_, this.options_);
    }

    /// remove event handler from target.
    removeEventHandler(): void {
        if(this.target_) {
            this.target_.removeEventListener(this.type_, this.closure_, this.options_);
            this.target_ = null;
        }
    }

    /// set added flag.
    setAddedFlag(): void {
        this.added_ = true;
    }

    /// clear added flag.
    clearAddedFlag(): void {
        this.added_ = false;
    }
}

/// event listener set
export class EventListenerSet {

    private entries_: EventListenerEntry[];

    constructor() {
        this.entries_ = [];
    }

    /// find entry.
    contains(view: View, type: string, handler: EventHandler, options: EventOptions): boolean {
        return Boolean(this.find(view, type, handler, options));
    }

    /// add an event listener.
    add(view: View, type: string, handler: EventHandler, options: EventOptions): void {
        const found = this.find(view, type, handler, options);
        if(found) {
            found.setAddedFlag();
        } else {
            this.entries_.push(new EventListenerEntry(view, type, handler, options));
        }
    }

    /// add new handlers and remove unused handlers
    syncHandlers(target: EventTarget): void {
        const newEntries: EventListenerEntry[] = [];
        for(const e of this.entries_) {
            if(e.added) {
                newEntries.push(e);
                e.addEventHandlerTo(target);
            } else {
                e.removeEventHandler();
            }
            e.clearAddedFlag();
        }
        this.entries_ = newEntries;
    }

    private find(view: View, type: string, handler: EventHandler, options: EventOptions): EventListenerEntry | undefined {
        return this.entries_.find(e => e.match(view, type, handler, options));
    }

}

