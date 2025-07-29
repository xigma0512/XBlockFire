import { BlankPhase } from "./BlankPhaseHandler";

import { system } from "@minecraft/server";

class _GamePhaseManager {

    private static _instance: _GamePhaseManager;
    static get instance() { return (this._instance || (this._instance = new this)); }
    
    private phaseHandler: IPhaseHandler;
    private taskId: number;

    private constructor() {
        this.phaseHandler = new BlankPhase();
        this.phaseHandler.on_entry();
        this.taskId = system.runInterval(() => this.phaseHandler.on_running());
    }

    updatePhase(newPhase: IPhaseHandler) {
        this.phaseHandler.on_exit();
        system.clearRun(this.taskId);

        system.waitTicks(5).then(() => { 
            this.phaseHandler = newPhase;
            this.phaseHandler.on_entry();
            this.taskId = system.runInterval(() => this.phaseHandler.on_running());
        });
    }

    getPhase() {
        return this.phaseHandler;
    }

}

export const GamePhaseManager = _GamePhaseManager.instance;