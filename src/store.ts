/**
 *  state store implementation.
 */

/// action type.
export abstract class Action<P extends Object> {

    /// action parameter.
    readonly param: Readonly<P>;

    /**
     *  initialize 
     *
     *  @param param parameter object.
     */
    constructor(param: P) {
        // copy parameter values
        const p: any = {};
        for(const k of Object.keys(param)) {
            p[k] = (<any>param)[k];
        }
        this.param = <Readonly<P>>p;
    }
}

/// action constructor.
export interface ActionConstructor<A extends Action<P>, P extends Object> {
    new(param: P): A;
}

/// reducer function.
export interface Reducer<S, P extends Object, A extends Action<P>> {
    (state: S, action: A): S;
}

/// reducer list entry
class ReducerEntry {

    /// reducer object.
    readonly reducer: any;

    /// call reducer function.
    readonly callReducer: (a: Object) => boolean;

    constructor(reducer: any, callReducer: (a: Object) => boolean) {
        this.reducer = reducer;
        this.callReducer = callReducer;
    }
}

/// state store.
export class Store<S> {

    /// state object.
    private state_: S;

    /// reducer entiries.
    private reducers_: ReducerEntry[] = [];

    /// subscribers.
    private subscribers_: { (store: Store<S>): void } [] = [];

    /// get state object.
    get state(): S {
        return this.state_;
    }

    /**
     *  initialize by initial state.
     *
     *  @param state initial state.
     */
    constructor(state: S) {
        this.state_ = state;
    }

    /**
     *  add a reducer.
     *
     *  @param reducer reducer function.
     *  @return this object.
     */
    addReducer<A extends Action<P>, P extends Object>(ctor: ActionConstructor<A, P>, reducer: Reducer<S, P, A>): this {
        if(this.reducers_.some(e => e.reducer === reducer)) {
            return this;
        }

        // append a new reducer.
        const callReducer = (a: Object): boolean => {
            if(a instanceof ctor) {
                this.state_ = reducer(this.state_, <A>a);
                return true;
            }
            return false;
        };
        this.reducers_.push(new ReducerEntry(reducer, callReducer));

        return this;
    }

    /**
     *  dispatch action and call matched reducers.
     *
     *  @param action dispatching action.
     *  @return true if called any reducers.
     */
    doAction<A extends Action<P>, P extends Object>(action: A): boolean {
        let called = false;
        for(const r of this.reducers_) {
            if(r.callReducer(action)) {
                called = true;
            }
        }

        if(called) {
            for(const s of this.subscribers_) {
                try {
                    s(this);
                } catch(e) {
                    // FIXME: implement better error handling.
                    console.error(e);
                }
            }
        }

        return called;
    }

    /**
     *  subscribe store.
     *
     *  @param subscriber subscriber function.
     */
    subscribe(subscriber: (store: Store<S>) => void): void {
        if(!this.subscribers_.some(e => e === subscriber)) {
            this.subscribers_.push(subscriber);
        }
    }

    /**
     *  unsubscribe store.
     *
     *  @param subscriber subscriber function.
     *  @return true if removed subscriber.
     */
    unsubscribe(subscriber: (store: Store<S>) => void): boolean {
        const index = this.subscribers_.findIndex(e => e === subscriber);
        if(index === -1) {
            return false;
        }
        this.subscribers_.splice(index, 1);
        return true;
    }
}

