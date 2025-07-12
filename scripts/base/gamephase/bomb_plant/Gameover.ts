import { PhaseManager } from "../PhaseManager";

import { ActionHud } from "../../../modules/hud/bomb_plant/Action";
import { IdlePhase } from "./Idle";
import { Config } from "./_config";

import { PhaseEnum as BombPlantPhaseEnum } from "../../../types/gamephase/BombPlantPhaseEnum";

const config = Config.gameover;

export class GameOverPhase implements IPhaseHandler {

    readonly phaseTag = BombPlantPhaseEnum.Gameover;
    readonly hud: ActionHud;
    private _currentTick: number = config.COUNTDOWN_TIME;
    get currentTick() { return this._currentTick; }

    constructor() {
        this.hud = new ActionHud();
    }

    on_entry() {
        this._currentTick = config.COUNTDOWN_TIME;
    }

    on_running() {
        this._currentTick --;
        this.hud.update();
        this.transitions();
    }

    on_exit() {
    }

    private transitions() {
        if (this.currentTick <= 0) PhaseManager.updatePhase(new IdlePhase());
    }

}