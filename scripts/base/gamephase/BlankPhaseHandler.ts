import { gameroom } from "../gameroom/GameRoom";
import { PhaseManager } from "./PhaseManager";

import { IdlePhase } from "./bomb_plant/Idle";

import { GameModeEnum } from "../../types/gameroom/GameModeEnum";

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
                PhaseManager.updatePhase(new IdlePhase());
                break;
        }
    }

}