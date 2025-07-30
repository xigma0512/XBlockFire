import { GameModeEnum } from "../../declarations/enum/GameModeEnum";

class GameRoom {

    static gameroom: GameRoom;

    readonly gameMode: GameModeEnum;
    readonly gameMapId: number;

    constructor(gameMode: GameModeEnum, gameMapId: number) {
        this.gameMode = gameMode;
        this.gameMapId = gameMapId;
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
}