import { PhaseIdentity } from '../PhaseIdentity';
import { InGameHud } from '../../../../ui/InGameHud';

const ACTION_TIME = 10 * 60 * 20;

export class DeathmatchActionPhase implements IPhaseHandler {
    readonly phaseTag = 102;
    readonly phaseId = PhaseIdentity.Deathmatch.Action;
    readonly hud!: InGameHud;

    private _currentTick = ACTION_TIME;
    get currentTick() {
        return this._currentTick;
    }

    on_entry() {
        this._currentTick = ACTION_TIME;
    }

    on_running() {
        this._currentTick--;
    }

    on_exit() {}
}
