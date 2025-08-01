import { C4IdleState } from "./states/Idle";

import { Entity, system } from "@minecraft/server";

class _BombStateManager {

    private static _instance: _BombStateManager;
    static get instance() { return (this._instance || (this._instance = new this)); }
    
    currentTick: number = -1;
    c4Entity: Entity | undefined;
   
    private _stateHandler: IBombStateHandler;
    get stateHandler() { return this._stateHandler; }
   
    private _taskId: number;
   
    private constructor() {
        this._stateHandler = new C4IdleState();

        this._stateHandler.on_entry();
        this._stateHandler.strategies.forEach(strategy => strategy.initialize());
        this._taskId = system.runInterval(this.runTick.bind(this));
    }
    
    updateState(newPhase: IBombStateHandler) {
        this._stateHandler.on_exit();
        this._stateHandler.strategies.forEach(strategy => strategy.dispose());
        system.clearRun(this._taskId);

        this._stateHandler = newPhase;
        this._stateHandler.on_entry();
        this._stateHandler.strategies.forEach(strategy => strategy.initialize());
        
        this._taskId = system.runInterval(this.runTick.bind(this));
    }
   
    private runTick() {
        if (this._stateHandler.on_running()) {
            this.currentTick --;
        }
    }

}

export const BombStateManager = _BombStateManager.instance;