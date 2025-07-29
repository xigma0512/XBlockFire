import { gameroom } from "../../gameroom/GameRoom";
import { GamePhaseManager } from "./GamePhaseManager";

import { IdlePhase } from "./bomb_plant/Idle";

import { GameModeEnum } from "../../../declarations/enum/GameModeEnum";

export class BlankPhase implements IPhaseHandler {

    readonly phaseTag = -1;
    readonly hud!: InGameHud;
    readonly currentTick = -1;
    
    constructor() { }

    on_entry() {
    }

    on_running() {
        if (!gameroom()) return;
        this.transitions();
    }

    on_exit() {
    }

    private transitions() {
        switch(gameroom().gameMode) {
            case GameModeEnum.BombPlant: 
                GamePhaseManager.updatePhase(new IdlePhase());
                break;
        }
    }

}