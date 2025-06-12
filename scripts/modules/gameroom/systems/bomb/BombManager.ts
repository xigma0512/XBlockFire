import { BombIdleState } from "./states/Idle";

import { system } from "@minecraft/server";

export class BombManager {

    readonly roomId: number;
    private stateHandler: IBombStateHandler;
    private taskId: number;

    constructor(roomId: number) {
        this.roomId = roomId;
        this.stateHandler = new BombIdleState(roomId); 
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