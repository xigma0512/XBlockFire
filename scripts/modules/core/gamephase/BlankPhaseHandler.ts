import { gameroom } from '../GameRoom';
import { PhaseManager } from './PhaseManager';
import { GameModePhaseFactory } from './GameModePhaseFactory';
import { InGameHud } from '../../../ui/InGameHud';

export class BlankPhase implements IPhaseHandler {
    readonly phaseTag = -1;
    readonly hud!: InGameHud;
    readonly currentTick = -1;

    constructor() {}

    on_entry() {}

    on_running() {
        if (!gameroom()) return;
        this.transitions();
    }

    on_exit() {}

    private transitions() {
        PhaseManager.updatePhase(GameModePhaseFactory.createIdlePhase(gameroom().gameMode));
    }
}

