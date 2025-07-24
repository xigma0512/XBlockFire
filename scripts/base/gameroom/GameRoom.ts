import { AlliesMarker } from "../../modules/allies_mark/AlliesMarker";

import { GameModeEnum } from "../../types/gameroom/GameModeEnum";

import { system } from "@minecraft/server";

class GameRoom {

    static gameroom: GameRoom;

    readonly gameMode: GameModeEnum;
    readonly gameMapId: number;

    private markerTaskId = -1;

    constructor(gameMode: GameModeEnum, gameMapId: number) {
        this.gameMode = gameMode;
        this.gameMapId = gameMapId;

        this.markerTaskId = this.addMarkerTask();
    }

    private addMarkerTask() {
        switch(this.gameMode) {
            default:
            case GameModeEnum.BombPlant: 
                return system.runInterval(() => {
                    AlliesMarker.updateMark();
                }, 3);
        }
    }

    close() {
        system.clearRun(this.markerTaskId);
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