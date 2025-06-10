declare abstract class IPhaseHandler {
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}