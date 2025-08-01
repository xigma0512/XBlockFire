import { Player, system } from "@minecraft/server";

import { BombStateManager } from "../BombStateManager";
import { C4IdleState } from "./Idle";
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
        system.runTimeout(() => {
            BombStateManager.updateState(new C4IdleState);
        });
    }
    
    on_running() {
        return true;
    }

    on_exit() {
        
    }
}