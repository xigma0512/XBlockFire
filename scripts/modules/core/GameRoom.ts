import { GameModeEnum } from './GameModeEnum';
import { IGameMode } from './gamemodes/IGameMode';
import { GameModeRegistry } from './gamemodes/GameModeRegistry';
import { system } from '@minecraft/server';

class GameRoom {
    static gameroom: GameRoom;

    readonly gameMode: GameModeEnum;
    readonly gameMapId: number;
    readonly activeMode: IGameMode;

    private modeTaskIds: number[] = [];

    constructor(gameMode: GameModeEnum, gameMapId: number) {
        this.gameMode = gameMode;
        this.gameMapId = gameMapId;
        this.activeMode = GameModeRegistry.getMode(gameMode);

        const tasks = this.activeMode.setupModeTasks();
        this.modeTaskIds = Array.isArray(tasks) ? tasks : [tasks];
    }

    close() {
        for (const taskId of this.modeTaskIds) {
            system.clearRun(taskId);
        }
    }
}

export class GameRoomFactory {
    static createRoom(mode: GameModeEnum, gameMapId: number) {
        GameRoom.gameroom = new GameRoom(mode, gameMapId);
    }
}

export const gameroom = () => {
    if (!GameRoom.gameroom) {
        GameRoom.gameroom = new GameRoom(GameModeEnum.BombPlant, 0);
    }
    return GameRoom.gameroom;
};
