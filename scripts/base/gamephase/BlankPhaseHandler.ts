import { GameModeEnum } from "../../types/gameroom/GameModeEnum";
import { GameRoomManager } from "../gameroom/GameRoom";

import { IdlePhase } from "./bomb_plant/Idle";

export class BlankPhase implements IPhaseHandler {

    readonly phaseTag = -1;
    readonly hud!: InGameHud;
    readonly currentTick = -1;
    constructor(private readonly roomId: number) { }

    on_entry() {
    }

    on_running() {
        this.transitions();
    }

    on_exit() {
    }

    private transitions() {
        const room = GameRoomManager.getRoom(this.roomId);

        switch(room.gameMode) {
            case GameModeEnum.C4Plant: 
                room.phaseManager.updatePhase(new IdlePhase(this.roomId));
                break;
        }
    }

}