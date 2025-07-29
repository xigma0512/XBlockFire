import { C4IdleState } from "./states/Idle";

import { system } from "@minecraft/server";

class _BombStateManager {

    private static _instance: _BombStateManager;
    static get instance() { return (this._instance || (this._instance = new this)); }

    private stateHandler: IBombStateHandler;
    private taskId: number;

    constructor() {
        this.stateHandler = new C4IdleState(); 
        system.run(() => this.stateHandler.on_entry());
        this.taskId = this.taskId = system.runInterval(() => this.stateHandler.on_running());
    }

    updateState(newState: IBombStateHandler) {
        this.stateHandler.on_exit();
        system.clearRun(this.taskId);

        this.stateHandler = newState;
        this.stateHandler.on_entry();
        this.taskId = system.runInterval(() => this.stateHandler.on_running());
    }

    getHandler() {
        return this.stateHandler;
    }

}

export const BombStateManager = _BombStateManager.instance;