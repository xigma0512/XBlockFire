import { BlankPhase } from "./BlankPhase";

import { system } from "@minecraft/server";

class _GamePhaseManager {

    private static _instance: _GamePhaseManager;
    static get instance() { return (this._instance || (this._instance = new this)); }
    
    currentTick: number = -1;

    private _phaseHandler: IPhaseHandler;
    get phaseHandler() { return this._phaseHandler; }

    private _taskId: number;

    private constructor() {
        this._phaseHandler = new BlankPhase();
        this._phaseHandler.on_entry();
        this._taskId = system.runInterval(this.runTick.bind(this));
    }
    
    updatePhase(newPhase: IPhaseHandler) {
        this._phaseHandler.on_exit();
        system.clearRun(this._taskId);
        
        system.waitTicks(5).then(() => { 
            this._phaseHandler = newPhase;
            this._phaseHandler.on_entry();
            
            this._taskId = system.runInterval(this.runTick.bind(this));
        });
    }

    private runTick() {
        this._phaseHandler.hud?.update();
        if (this._phaseHandler.on_running()) {
            this.currentTick --;
            this._phaseHandler.transitions();
        }
    }

}

export const GamePhaseManager = _GamePhaseManager.instance;