import { system } from "@minecraft/server";
import { BombStateManager } from "../BombStateManager";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { C4IdleState } from "../states/Idle";

const EXPLOSION_SOUND = 'xblockfire.c4_explosion';

export class ExplosionStrategy implements IBombStateStrategy {    
    
    private taskId = -1;

    initialize() {
        this.taskId = system.runInterval(() => {
            const currentTick = BombStateManager.currentTick;
            if (currentTick <= 0) explosion();
        });
    }

    dispose() {
        system.clearRun(this.taskId);
    }
}

function explosion() {
    const c4Entity = BombStateManager.c4Entity!;

    const location = c4Entity.location;
    const volume = 3;
    Broadcast.sound(EXPLOSION_SOUND, { location, volume });

    c4Entity.dimension.createExplosion(c4Entity.location, 20, { causesFire: false, breaksBlocks: false });
    BombStateManager.updateState(new C4IdleState());
}