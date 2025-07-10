declare abstract class IC4StateHandler {
    readonly stateTag: number;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}