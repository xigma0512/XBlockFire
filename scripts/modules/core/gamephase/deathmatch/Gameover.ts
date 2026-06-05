import { PhaseIdentity } from '../PhaseIdentity';
import { PhaseManager } from '../PhaseManager';
import { DeathmatchIdlePhase } from './Idle';
import { InGameHud } from '../../../../ui/InGameHud';

const COUNTDOWN_TIME = 10 * 20;

export class DeathmatchGameOverPhase implements IPhaseHandler {
    readonly phaseTag = 103;
    readonly phaseId = PhaseIdentity.Deathmatch.Gameover;
    readonly hud!: InGameHud;

    private _currentTick = COUNTDOWN_TIME;
    get currentTick() {
        return this._currentTick;
    }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
    }

    on_running() {
        this._currentTick--;
        if (this.currentTick <= 0) PhaseManager.updatePhase(new DeathmatchIdlePhase());
    }

    on_exit() {}
}
