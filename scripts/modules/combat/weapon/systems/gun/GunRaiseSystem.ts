import { ItemActor } from '../../actors/Actor';
import { ActorManager } from '../ActorManager';
import { progressBar } from '../../../../../utils/others/Format';
import { set_entity_native_property } from '../../../../../utils/Property';
import { gunRuntimeState } from './GunRuntimeState';

import { Player, system, world } from '@minecraft/server';
import { GunAnimations } from './GunAnimations';

export const GUN_RAISE_COOLDOWN_CATEGORY = 'xblockfire:raise_gun';
const DEFAULT_RAISE_TIME = 8;

export class GunRaiseSystem {
    static startRaise(player: Player, gunActor: ItemActor) {
        const raiseTime = this.getRaiseTime(gunActor);
        if (raiseTime <= 0) return;

        player.startItemCooldown(GUN_RAISE_COOLDOWN_CATEGORY, raiseTime);
        gunRuntimeState.setRaiseDuration(player.id, raiseTime);
        GunAnimations.playGunRaiseAnimation(player, gunActor);
    }

    static isRaised(player: Player) {
        return gunRuntimeState.isRaiseComplete(player.id, player.getItemCooldown(GUN_RAISE_COOLDOWN_CATEGORY));
    }

    static cleanupPlayer(player: Player) {
        gunRuntimeState.clearRaiseDuration(player.id);
    }

    static getRaiseProgressBar(player: Player) {
        const duration = gunRuntimeState.getRaiseDuration(player.id);
        if (!duration) return;

        const remaining = player.getItemCooldown(GUN_RAISE_COOLDOWN_CATEGORY);
        if (remaining <= 0) {
            gunRuntimeState.clearRaiseDuration(player.id);
            return;
        }

        return progressBar(duration, duration - remaining, 30);
    }

    private static getRaiseTime(gunActor: ItemActor) {
        return gunActor.getComponent('gun_raise')?.raise_time ?? DEFAULT_RAISE_TIME;
    }
}

world.afterEvents.playerHotbarSelectedSlotChange.subscribe((ev) => {
    gunRuntimeState.clearPendingReleaseFire(ev.player.id);
    gunRuntimeState.stopFiring(ev.player.id);
    const reloadSession = gunRuntimeState.cancelReload(ev.player.id);
    if (reloadSession?.reloadSound) ev.player.stopSound(reloadSession.reloadSound);
    if (reloadSession) set_entity_native_property(ev.player, 'player:state.reload', 'fail');

    const item = ev.itemStack;
    if (!item || !ActorManager.isActor(item)) return;

    const actor = ActorManager.getActor(item) as ItemActor | undefined;
    if (!actor?.hasComponent('gun')) return;

    GunRaiseSystem.startRaise(ev.player, actor);
});

world.beforeEvents.playerLeave.subscribe((ev) => {
    gunRuntimeState.cleanupPlayer(ev.player.id);
});
