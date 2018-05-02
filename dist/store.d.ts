export declare abstract class Action<P extends Object> {
    readonly param: Readonly<P>;
    constructor(param: P);
}
export interface ActionConstructor<A extends Action<P>, P extends Object> {
    new (param: P): A;
}
export interface Reducer<S, P extends Object, A extends Action<P>> {
    (state: S, action: A): S;
}
export declare class Store<S> {
    private state_;
    private reducers_;
    private subscribers_;
    readonly state: S;
    constructor(state: S);
    addReducer<A extends Action<P>, P extends Object>(ctor: ActionConstructor<A, P>, reducer: Reducer<S, P, A>): this;
    doAction<A extends Action<P>, P extends Object>(action: A): boolean;
    subscribe(subscriber: (store: Store<S>) => void): void;
}
