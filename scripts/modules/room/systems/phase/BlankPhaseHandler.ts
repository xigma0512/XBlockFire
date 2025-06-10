import { GameModeEnum } from "../../types/Enum";
import { GameRoomManager } from "../GameRoom";

import { BombPlant_IdlePhase } from "./bomb_plant/Idle";

export class BlankPhase implements IPhaseHandler {

    constructor(private readonly roomId: number) { }

    on_entry() {
        console.warn('Entry blank phase.');
    }

    on_running() {
        this.transitions();
    }

    on_exit() {
        console.warn('Exit blank phase.');
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        switch(room.gameMode) {
            case GameModeEnum.BombPlant: 
                room.phaseManager.updatePhase(new BombPlant_IdlePhase(this.roomId));
                break;
        }
    }

}