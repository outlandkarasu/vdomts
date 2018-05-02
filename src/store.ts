/**
 *  state store implementation.
 */

/// action type.
export abstract class Action<P extends Object> {
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

/// state store.
interface Store<S> {
}

/// reducer function.
type Reducer = <S, P>(state: S, action: Action<P>) => S;

