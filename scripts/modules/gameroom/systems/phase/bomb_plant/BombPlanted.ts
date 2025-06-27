import { GameRoomManager } from "../../GameRoom";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";
import { BP_RoundEndPhase } from "./RoundEnd";

import { BP_Config } from "./_config";
import { TeamEnum } from "../../../types/TeamEnum";
import { set_variable } from "../../../../../utils/Variable";
import { BP_ActionHud } from "../../../../hud/bomb_plant/Action";

const config = BP_Config.bombplanted;

export class BP_BombPlantedPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.BombPlanted;
    readonly hud: BP_ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {
        this.hud = new BP_ActionHud(roomId);
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:bomb_planted phase.`);
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
        console.warn(`[Room ${this.roomId}] Exit BP:bomb_planted phase.`);
    }

    private transitions() {
        const room = GameRoomManager.instance.getRoom(this.roomId);

        if (this._currentTick <= 0) {
            set_variable(`${this.roomId}.round_winner`, TeamEnum.Attacker);
            room.phaseManager.updatePhase(new BP_RoundEndPhase(this.roomId));
        }
    }

}