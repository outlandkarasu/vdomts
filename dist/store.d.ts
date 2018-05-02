export declare abstract class Action<P extends Object> {
    readonly param: Readonly<P>;
    constructor(param: P);
}
