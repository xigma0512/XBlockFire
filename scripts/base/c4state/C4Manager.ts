import { C4IdleState } from "./states/Idle";

import { system } from "@minecraft/server";

export class C4Manager {

    readonly roomId: number;
    private stateHandler: IC4StateHandler;
    private taskId: number;

    constructor(roomId: number) {
        this.roomId = roomId;
        this.stateHandler = new C4IdleState(roomId); 
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