import { gameroom } from "../../gameroom/GameRoom";
import { GamePhaseManager } from "./GamePhaseManager";

import { IdlePhase } from "./bomb_plant/Idle";

import { GameModeEnum } from "../../../declarations/enum/GameModeEnum";

export class BlankPhase implements IPhaseHandler {

    readonly phaseTag = -1;
    
    constructor() { }

    on_entry() {
    }

    on_running() {
        return true;
    }

    on_exit() {
    }

    transitions() {
        switch(gameroom().gameMode) {
            case GameModeEnum.BombPlant: GamePhaseManager.updatePhase(new IdlePhase()); break;
        }
    }

}