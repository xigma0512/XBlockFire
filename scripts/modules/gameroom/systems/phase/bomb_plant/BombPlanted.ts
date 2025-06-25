import { GameRoomManager } from "../../GameRoom";
import { BP_PhaseEnum } from "../../../types/PhaseEnum";
import { BP_RoundEndPhase } from "./RoundEnd";

import { TeamEnum } from "../../../types/TeamEnum";
import { set_variable } from "../../../../../utils/Variable";

const COUNTDOWN_TIME = 50 * 20;

export class BP_BombPlantedPhase implements IPhaseHandler {

    readonly phaseTag = BP_PhaseEnum.BombPlanted;
    private _currentTick: number = COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) { }

    on_entry() {
        this._currentTick = COUNTDOWN_TIME;
        console.warn(`[Room ${this.roomId}] Entry BP:bomb_planted phase.`);
    }

    on_running() {
        this._currentTick --;
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