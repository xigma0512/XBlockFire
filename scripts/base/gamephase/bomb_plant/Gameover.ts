import { GameRoomManager } from "../../gameroom/GameRoom";
import { IdlePhase } from "./Idle";
import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";
import { Config } from "./_config";

import { ActionHud } from "../../../modules/hud/bomb_plant/Action";

const config = Config.gameover;

export class GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor(private readonly roomId: number) {
        this.hud = new ActionHud(roomId);
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
        const room = GameRoomManager.getRoom(this.roomId);

        if (this.currentTick <= 0) room.phaseManager.updatePhase(new IdlePhase(this.roomId));
    }

}