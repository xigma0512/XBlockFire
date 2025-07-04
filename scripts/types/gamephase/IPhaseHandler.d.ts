declare abstract class IPhaseHandler {
    readonly phaseTag: number;
    readonly currentTick: number;
    readonly hud: InGameHud;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}