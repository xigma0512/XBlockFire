import { GameModeEnum } from '../GameModeEnum';

export interface IGameMode {
    readonly modeId: GameModeEnum;
    createIdlePhase(): IPhaseHandler;
    createForceStartPhase(): IPhaseHandler;
    setupModeTasks(): number | number[];

    onPlayerDeath?(deadPlayer: import('@minecraft/server').Player, attacker?: import('@minecraft/server').Player): void;
    getShopPointLimit?(attackerScore: number, defenderScore: number): number;
    onAlliesMarkerUpdate?(
        viewer: import('@minecraft/server').Player,
        groupPlayers: import('@minecraft/server').Player[]
    ): void;
    openShop?(player: import('@minecraft/server').Player): void;
}
