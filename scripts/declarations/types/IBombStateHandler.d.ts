declare abstract class IBombStateHandler {
    readonly stateTag: number;
    readonly entity?;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}