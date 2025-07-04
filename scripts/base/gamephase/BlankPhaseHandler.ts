import { GameModeEnum } from "../../types/gameroom/GameModeEnum";
import { GameRoomManager } from "../gameroom/GameRoom";

import { IdlePhase } from "./bomb_plant/Idle";

export class BlankPhase implements IPhaseHandler {

    readonly phaseTag = -1;
    readonly hud!: InGameHud;
    readonly currentTick = -1;
    constructor(private readonly roomId: number) { }

    on_entry() {
        console.warn(`[Room ${this.roomId}] Entry blank phase.`);
    }

    on_running() {
        this.transitions();
    }

    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit blank phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        switch(room.gameMode) {
            case GameModeEnum.BombPlant: 
                room.phaseManager.updatePhase(new IdlePhase(this.roomId));
                break;
        }
    }

}