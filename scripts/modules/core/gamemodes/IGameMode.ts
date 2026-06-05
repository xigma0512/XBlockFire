import { GameModeEnum } from '../GameModeEnum';

export interface IGameMode {
    readonly modeId: GameModeEnum;
    createIdlePhase(): IPhaseHandler;
    createForceStartPhase(): IPhaseHandler;
    setupModeTasks(): number | number[];
}

