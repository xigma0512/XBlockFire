import { BombStateManager } from "./BombStateManager";
import { C4IdleState } from "./states/Idle";

export class BlankState implements IBombStateHandler {

    readonly stateTag = -1;
    readonly strategies = [];
    
    constructor() { }

    on_entry() {
    }

    on_running() {
        BombStateManager.updateState(new C4IdleState());
        return true;
    }

    on_exit() {
    }

}