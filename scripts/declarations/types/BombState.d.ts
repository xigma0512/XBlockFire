declare abstract class IBombStateHandler {
    readonly stateTag: number;
    readonly strategies: IBombStateStrategy[];

    on_entry(): void;
    on_running(): boolean;
    on_exit(): void;
}

declare interface IBombStateStrategy {
    initialize(): void;
    dispose(): void;
}