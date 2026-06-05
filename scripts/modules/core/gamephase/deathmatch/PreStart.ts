import { PhaseIdentity } from '../PhaseIdentity';
import { PhaseManager } from '../PhaseManager';
import { DeathmatchActionPhase } from './Action';
import { InGameHud } from '../../../../ui/InGameHud';

export class DeathmatchPreStartPhase implements IPhaseHandler {
    readonly phaseTag = 101;
    readonly phaseId = PhaseIdentity.Deathmatch.PreStart;
    readonly hud!: InGameHud;
    readonly currentTick = -1;

    on_entry() {}

    on_running() {
        PhaseManager.updatePhase(new DeathmatchActionPhase());
    }

    on_exit() {}
}
