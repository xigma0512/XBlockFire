import { GameModeEnum } from '../../GameModeEnum';
import { IGameMode } from '../IGameMode';
import { DeathmatchIdlePhase } from './phases/Idle';
import { DeathmatchPreStartPhase } from './phases/PreStart';
import { AlliesMarker } from '../../../player/AlliesMarker';
import { system } from '@minecraft/server';

export class DeathmatchMode implements IGameMode {
    readonly modeId = GameModeEnum.Deathmatch;

    createIdlePhase(): IPhaseHandler {
        return new DeathmatchIdlePhase();
    }

    createForceStartPhase(): IPhaseHandler {
        return new DeathmatchPreStartPhase();
    }

    setupModeTasks(): number | number[] {
        // In original design, Deathmatch fell through to BombPlant's marker task
        const taskId = system.runInterval(() => {
            AlliesMarker.updateMark();
        }, 3);
        return taskId;
    }
}

