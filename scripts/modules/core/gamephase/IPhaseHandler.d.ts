declare interface IPhaseHandler {
    readonly phaseId: string;
    readonly currentTick: number;
    readonly hud?: any;
    on_entry(): void;
    on_running(): void;
    on_exit(): void;
}
