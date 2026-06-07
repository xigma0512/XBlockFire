import { ActorManager } from '../ActorManager';
import { ItemActor } from '../../actors/Actor';
import { set_entity_native_property, entity_native_property } from '../../../../../utils/Property';
import { getPlayerHandItem } from '../../../../../utils/others/Entity';
import { progressBar } from '../../../../../utils/others/Format';

import { Player, system, world } from '@minecraft/server';
import { GunAnimations } from './GunAnimations';
import { GunRaiseSystem } from './GunRaiseSystem';
import { gunRuntimeState } from './GunRuntimeState';
import { gameroom } from '../../../../core/GameRoom';
import { GameModeEnum } from '../../../../core/GameModeEnum';

class GunReloadSystem {
    private player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    playerReload() {
        try {
            const handItem = getPlayerHandItem(this.player);
            if (!handItem) throw 'player hand item is undefined.';

            if (!ActorManager.isActor(handItem)) throw 'hand item actor is undefined.';
            const actor = ActorManager.getActor(handItem) as ItemActor;

            if (!this.canReload(actor)) throw 'cannot reload now';

            this.startReload(actor);
        } catch (err: any) {
            return this.cancelReload();
        }
    }

    cancelActiveReload() {
        this.cancelReload();
    }

    private startReload(actor: ItemActor) {
        const reloadComp = actor.getComponent('gun_reload')!;
        const reloadTime = reloadComp.reload_time;
        const startTick = system.currentTick;

        gunRuntimeState.stopFiring(this.player.id);

        const progressBarTaskId = system.runInterval(() => {
            const progressBarStr = `${progressBar(reloadTime, system.currentTick - startTick, 30)}`;
            this.player.onScreenDisplay.setActionBar(progressBarStr);
        });

        const timeoutTaskId = system.runTimeout(() => {
            this.finishReload(actor);
        }, reloadTime);

        gunRuntimeState.setReloadSession(this.player.id, {
            timeoutTaskId,
            progressTaskId: progressBarTaskId,
            reloadSound: `xblockfire.reload.${actor.typeId}`,
        });

        set_entity_native_property(this.player, 'player:state.reload', 'reloading');
        GunAnimations.playGunReloadAnimation(this.player, actor);
    }

    private canReload(actor: ItemActor) {
        if (!GunRaiseSystem.isRaised(this.player)) return false;

        const isReloading = entity_native_property(this.player, 'player:state.reload');
        if (isReloading === 'reloading') return false;

        const magazineComp = actor.getComponent('gun_magazine');
        if (!magazineComp) return false;

        return (
            magazineComp.ammo < magazineComp.capacity &&
            (isDeathmatchInfiniteAmmoActive() || magazineComp.storageAmmo > 0)
        );
    }

    private cancelReload() {
        const session = gunRuntimeState.cancelReload(this.player.id);
        if (session?.reloadSound) this.player.stopSound(session.reloadSound);

        set_entity_native_property(this.player, 'player:state.reload', 'fail');
    }

    private finishReload(actor: ItemActor) {
        const session = gunRuntimeState.completeReload(this.player.id);
        if (!session) return;

        this.complete(actor);
    }

    private complete(actor: ItemActor) {
        const magazineComp = actor.getComponent('gun_magazine');
        if (!magazineComp) return this.cancelReload();

        const ammoNeeded = magazineComp.capacity - magazineComp.ammo;
        const infiniteAmmo = isDeathmatchInfiniteAmmoActive();
        const ammoToTransfer = infiniteAmmo ? ammoNeeded : Math.min(ammoNeeded, magazineComp.storageAmmo);

        magazineComp.ammo += ammoToTransfer;
        if (!infiniteAmmo) magazineComp.storageAmmo -= ammoToTransfer;

        set_entity_native_property(this.player, 'player:state.reload', 'success');
    }
}

function isDeathmatchInfiniteAmmoActive() {
    return gameroom().gameMode === GameModeEnum.Deathmatch;
}

world.afterEvents.dataDrivenEntityTrigger.subscribe((ev) => {
    if (!(ev.entity instanceof Player)) return;

    if (ev.eventId === 'property:state.reload.pre_reload') {
        new GunReloadSystem(ev.entity).playerReload();
        return;
    }

    if (ev.eventId === 'property:state.reload.fail') {
        new GunReloadSystem(ev.entity).cancelActiveReload();
    }
});
