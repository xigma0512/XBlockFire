declare abstract class IPhaseHandler {
    readonly phaseTag: number;
    readonly currentTick: number;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}