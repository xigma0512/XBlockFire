import { BlankPhase } from "./BlankPhaseHandler";

import { system } from "@minecraft/server";
import { HudDriver } from "../../../ui/hud/drivers/HudDriver";

class _PhaseManager {

    private static _instance: _PhaseManager;
    static get instance() { return (this._instance || (this._instance = new this)); }
    
    private phaseHandler: IPhaseHandler;
    private taskId: number;
    private isTransitioning: boolean = false;
    get isPhaseTransitioning() { return this.isTransitioning; }

    private constructor() {
        this.phaseHandler = new BlankPhase();
        this.phaseHandler.on_entry();
        this.taskId = system.runInterval(() => {
            if (this.isTransitioning) return;
            this.phaseHandler.on_running();
        });
    }

    updatePhase(newPhase: IPhaseHandler) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        system.run(() => {
            this.phaseHandler.on_exit();
            system.clearRun(this.taskId);
            
            // Clear the sidebar when transitioning to avoid leaking game-in-progress lines
            HudDriver.clearSidebar();

            system.waitTicks(5).then(() => { 
                this.phaseHandler = newPhase;
                this.phaseHandler.on_entry();
                this.taskId = system.runInterval(() => {
                    if (this.isTransitioning) return;
                    this.phaseHandler.on_running();
                });
                this.isTransitioning = false;
            });
        });
    }

    getPhase() {
        return this.phaseHandler;
    }

}

export const PhaseManager = _PhaseManager.instance;

