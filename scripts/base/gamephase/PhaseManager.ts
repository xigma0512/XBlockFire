import { system } from "@minecraft/server";
import { BlankPhase } from "./BlankPhaseHandler";

export class PhaseManager {
    
    readonly roomId: number;
    private phaseHandler: IPhaseHandler;
    private taskId: number;

    constructor(roomId: number) {
        this.roomId = roomId;
        this.phaseHandler = new BlankPhase(roomId);
        this.phaseHandler.on_entry();
        this.taskId = system.runInterval(() => this.phaseHandler.on_running());
    }

    updatePhase(newPhase: IPhaseHandler) {
        this.phaseHandler.on_exit();
        system.clearRun(this.taskId);

        system.waitTicks(2).then(() => { 
            this.phaseHandler = newPhase;
            this.phaseHandler.on_entry();
            this.taskId = system.runInterval(() => this.phaseHandler.on_running());
        });
    }

    getPhase() {
        return this.phaseHandler;
    }

}