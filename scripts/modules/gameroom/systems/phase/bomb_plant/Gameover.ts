import { GameRoomManager } from "../../GameRoom";
import { BP_IdlePhase } from "./Idle";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";
import { BP_Config } from "./_config";

import { Broadcast } from "../../../../../utils/Broadcast";
import { BP_ActionHud } from "../../../../hud/bomb_plant/Action";

const config = BP_Config.gameover;

export class BP_GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.Gameover;
    readonly hud: BP_ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {
        this.hud = new BP_ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:gameover phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit BP:gameover phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        if (this.currentTick <= 0) room.phaseManager.updatePhase(new BP_IdlePhase(this.roomId));
    }

}