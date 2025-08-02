import { system } from "@minecraft/server";

import { BombStateManager } from "../BombStateManager";

import { lang } from "../../../../infrastructure/Language";
import { Broadcast } from "../../../../infrastructure/utils/Broadcast";
import { gameEvents } from "../../../../infrastructure/event/EventEmitter";

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
    
    c4Entity.dimension.createExplosion(c4Entity.location, 20, { causesFire: false, breaksBlocks: false });
    
    const location = c4Entity.location;
    const volume = 3;
    Broadcast.sound(EXPLOSION_SOUND, { location, volume });
    Broadcast.message(lang('game.bombplant.c4_exploded.attacker_win'));
    
    gameEvents.emit('onC4Exploded', {});
}