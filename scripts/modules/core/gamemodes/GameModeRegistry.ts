import { GameModeEnum } from '../GameModeEnum';
import { IGameMode } from './IGameMode';
import { BombPlantMode } from './BombPlant/BombPlantMode';
import { DeathmatchMode } from './Deathmatch/DeathmatchMode';

export class GameModeRegistry {
    private static modes = new Map<GameModeEnum, IGameMode>([
        [GameModeEnum.BombPlant, new BombPlantMode()],
        [GameModeEnum.Deathmatch, new DeathmatchMode()]
    ]);

    static register(mode: IGameMode) {
        this.modes.set(mode.modeId, mode);
    }

    static getMode(modeId: GameModeEnum): IGameMode {
        const mode = this.modes.get(modeId);
        if (!mode) {
            return this.modes.get(GameModeEnum.BombPlant)!;
        }
        return mode;
    }
}

