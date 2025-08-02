import { Player } from "@minecraft/server";

import { DefusedC4SuccessStrategy } from "../strategies/DefusedC4Success";

import { BombStateEnum } from "../../../../declarations/enum/BombStateEnum";

export class C4DefusedState implements IBombStateHandler {
    
    readonly stateTag = BombStateEnum.Defused;
    readonly strategies: IBombStateStrategy[];

    constructor(private source: Player) {
        this.strategies = [
            new DefusedC4SuccessStrategy(source)
        ];
    }

    on_entry() {
    }
    
    on_running() {
        return true;
    }

    on_exit() {
        
    }
}