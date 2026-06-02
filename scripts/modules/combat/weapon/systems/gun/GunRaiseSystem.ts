import { ItemActor } from '../../actors/Actor';
import { ActorManager } from '../ActorManager';
import { progressBar } from '../../../../../utils/others/Format';

import { Player, system, world } from '@minecraft/server';

export const GUN_RAISE_COOLDOWN_CATEGORY = 'xblockfire:raise_gun';
const DEFAULT_RAISE_TIME = 8;

export class GunRaiseSystem {
    private static readonly _raiseStates = new Map<string, number>();

    static startRaise(player: Player, gunActor: ItemActor) {
        const raiseTime = this.getRaiseTime(gunActor);
        if (raiseTime <= 0) return;

        player.startItemCooldown(GUN_RAISE_COOLDOWN_CATEGORY, raiseTime);
        this._raiseStates.set(player.id, raiseTime);
    }

    static canFire(player: Player) {
        return player.getItemCooldown(GUN_RAISE_COOLDOWN_CATEGORY) <= 0;
    }

    static cleanupPlayer(player: Player) {
        this._raiseStates.delete(player.id);
    }

    static getRaiseProgressBar(player: Player) {
        const duration = this._raiseStates.get(player.id);
        if (!duration) return;

        const remaining = player.getItemCooldown(GUN_RAISE_COOLDOWN_CATEGORY);
        if (remaining <= 0) {
            this._raiseStates.delete(player.id);
            return;
        }

        return progressBar(duration, duration - remaining, 20);
    }

    private static getRaiseTime(gunActor: ItemActor) {
        return gunActor.getComponent('gun_raise')?.raise_time ?? DEFAULT_RAISE_TIME;
    }
}

system.run(() => {
    world.afterEvents.playerHotbarSelectedSlotChange.subscribe((ev) => {
        const item = ev.itemStack;
        if (!item || !ActorManager.isActor(item)) return;

        const actor = ActorManager.getActor(item) as ItemActor | undefined;
        if (!actor?.hasComponent('gun')) return;

        GunRaiseSystem.startRaise(ev.player, actor);
    });

    world.beforeEvents.playerLeave.subscribe((ev) => {
        GunRaiseSystem.cleanupPlayer(ev.player);
    });
});
