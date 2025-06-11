import { GameModeEnum } from "../GameModeEnum";
import { GameRoomManager } from "../GameRoom";

import { BP_IdlePhase } from "./bomb_plant/Idle";

export class BlankPhase implements IPhaseHandler {

    readonly phaseTag = -1;
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
                room.phaseManager.updatePhase(new BP_IdlePhase(this.roomId));
                break;
        }
    }

}