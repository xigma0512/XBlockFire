import { GameModeEnum } from '../GameModeEnum';
import { IdlePhase as BombPlantIdlePhase } from './bomb_plant/Idle';
import { PreRoundStartPhase as BombPlantPreRoundStartPhase } from './bomb_plant/PreRoundStart';
import { DeathmatchIdlePhase } from './deathmatch/Idle';
import { DeathmatchPreStartPhase } from './deathmatch/PreStart';

export class GameModePhaseFactory {
    static createIdlePhase(mode: GameModeEnum): IPhaseHandler {
        switch (mode) {
            case GameModeEnum.Deathmatch:
                return new DeathmatchIdlePhase();
            case GameModeEnum.BombPlant:
            default:
                return new BombPlantIdlePhase();
        }
    }

    static createForceStartPhase(mode: GameModeEnum): IPhaseHandler {
        switch (mode) {
            case GameModeEnum.Deathmatch:
                return new DeathmatchPreStartPhase();
            case GameModeEnum.BombPlant:
            default:
                return new BombPlantPreRoundStartPhase();
        }
    }
}
