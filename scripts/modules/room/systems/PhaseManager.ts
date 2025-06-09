import { system } from "@minecraft/server";
import { BlankPhase } from "./phases/BlankPhaseHandler";

export class PhaseManager {
    
    readonly roomId: string;
    private phaseHandler: IPhaseHandler;
    private taskId: number;

    constructor(roomId: string) {
        this.roomId = roomId;
        this.phaseHandler = new BlankPhase(roomId);
        this.taskId = system.runInterval(() => this.phaseHandler.on_running());
    }

    updatePhase(newPhase: IPhaseHandler) {
        this.phaseHandler.on_exit();
        system.clearRun(this.taskId);

        this.phaseHandler = newPhase;
        this.phaseHandler.on_entry();
        this.taskId = system.runInterval(() => this.phaseHandler.on_running());
    }

}