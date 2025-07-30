declare abstract class IPhaseHandler {
    
    readonly phaseTag: number;
    readonly hud?: InGameHud;

    on_entry(): void;
    on_running(): boolean;
    on_exit(): void;
    transitions(): void;
}