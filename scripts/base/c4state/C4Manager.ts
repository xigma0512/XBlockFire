import { C4IdleState } from "./states/Idle";

import { system } from "@minecraft/server";

class _C4Manager {

    private static _instance: _C4Manager;
    static get instance() { return (this._instance || (this._instance = new this)); }

    private stateHandler: IC4StateHandler;
    private taskId: number;

    constructor() {
        this.stateHandler = new C4IdleState(); 
        system.run(() => this.stateHandler.on_entry());
        this.taskId = this.taskId = system.runInterval(() => this.stateHandler.on_running());
    }

    updateState(newState: IC4StateHandler) {
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

export const C4Manager = _C4Manager.instance;