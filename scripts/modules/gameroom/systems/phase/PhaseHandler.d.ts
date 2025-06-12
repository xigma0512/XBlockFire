declare abstract class IPhaseHandler {
    readonly phaseTag: number;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}