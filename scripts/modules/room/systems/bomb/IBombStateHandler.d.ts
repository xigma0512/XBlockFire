declare abstract class IBombStateHandler {
    readonly stateTag: number;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}