import { GameModeEnum } from '../../GameModeEnum';
import { IGameMode } from '../IGameMode';
import { IdlePhase } from './phases/Idle';
import { PreRoundStartPhase } from './phases/PreRoundStart';
import { AlliesMarker } from '../../../player/AlliesMarker';
import { system } from '@minecraft/server';

export class BombPlantMode implements IGameMode {
    readonly modeId = GameModeEnum.BombPlant;

    createIdlePhase(): IPhaseHandler {
        return new IdlePhase();
    }

    createForceStartPhase(): IPhaseHandler {
        return new PreRoundStartPhase();
    }

    setupModeTasks(): number | number[] {
        const taskId = system.runInterval(() => {
            AlliesMarker.updateMark();
        }, 3);
        return taskId;
    }
}

