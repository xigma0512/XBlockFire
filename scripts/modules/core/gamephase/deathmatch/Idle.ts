import { PhaseIdentity } from '../PhaseIdentity';
import { InGameHud } from '../../../../ui/InGameHud';

export class DeathmatchIdlePhase implements IPhaseHandler {
    readonly phaseTag = 100;
    readonly phaseId = PhaseIdentity.Deathmatch.Idle;
    readonly hud!: InGameHud;
    readonly currentTick = -1;

    on_entry() {}
    on_running() {}
    on_exit() {}
}
