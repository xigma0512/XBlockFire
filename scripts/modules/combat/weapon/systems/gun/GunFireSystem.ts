import { ItemActor } from '../../actors/Actor';
import { BulletSystem } from '../bullet/BulletSystem';
import { ActorManager } from '../ActorManager';
import { GunAnimations } from './GunAnimations';
import { GunRaiseSystem } from './GunRaiseSystem';
import { gunRuntimeState } from './GunRuntimeState';

import { FireModeEnum } from '../../WeaponEnum';

import { getPlayerHandItem } from '../../../../../utils/others/Entity';
import { entity_native_property } from '../../../../../utils/Property';
import { gameEvents } from '../../../../../event/EventEmitter';

import { Player, system, world } from '@minecraft/server';

export class GunFireSystem {
    static startFiring(player: Player, gunActor: ItemActor) {
        const gunFireComp = gunActor.getComponent('gun_fire')!;

        switch (gunFireComp.fire_mode) {
            case FireModeEnum['Fully-Auto']:
                this.fullAutoFire(player, gunActor);
                break;
            case FireModeEnum['Semi-Auto']:
                this.semiAutoFire(player, gunActor);
                break;
        }
    }

    private static fullAutoFire(player: Player, actor: ItemActor) {
        if (!GunRaiseSystem.isRaised(player)) return;
        if (gunRuntimeState.hasFullAutoTask(player.id)) return;
        if (gunRuntimeState.isFireCoolingDown(player.id)) return;

        const gunFireComp = actor.getComponent('gun_fire')!;
        const fireRate = gunFireComp.fire_rate;

        this.fire(player, actor);
        const taskId = system.runInterval(() => {
            if (!gunRuntimeState.isFullAutoTask(player.id, taskId)) return;
            this.fire(player, actor);
        }, fireRate);

        const cooldownTaskId = system.runTimeout(() => gunRuntimeState.clearFireCooldown(player.id), fireRate);
        gunRuntimeState.startFireCooldown(player.id, cooldownTaskId);
        gunRuntimeState.setFullAutoTask(player.id, taskId);
    }

    private static semiAutoFire(player: Player, actor: ItemActor) {
        const gunFireComp = actor.getComponent('gun_fire')!;
        const fireRate = gunFireComp.fire_rate;

        if (gunFireComp.release_to_fire) {
            gunRuntimeState.setPendingReleaseFire(player.id, {
                actor,
                fireMode: gunFireComp.fire_mode,
                fireRate,
            });
            return;
        } else {
            if (!GunRaiseSystem.isRaised(player)) return;
            if (gunRuntimeState.isFireCoolingDown(player.id)) return;

            if (this.fire(player, actor)) this.emitGunFired(player, gunFireComp.fire_mode, fireRate);
            const cooldownTaskId = system.runTimeout(() => gunRuntimeState.clearFireCooldown(player.id), fireRate);
            gunRuntimeState.startFireCooldown(player.id, cooldownTaskId);
        }
    }

    private static fire(player: Player, gunActor: ItemActor) {
        const magazineComp = gunActor.getComponent('gun_magazine')!;
        if (magazineComp.ammo <= 0) {
            system.run(() => player.playSound('xblockfire.empty_gun'));
            return false;
        }

        magazineComp.ammo--;
        const gunFireComp = gunActor.getComponent('gun_fire')!;
        for (let _ = 0; _ < gunFireComp.bullet_spread; _++) {
            BulletSystem.shoot(player, gunActor);
        }

        system.run(() => GunAnimations.playGunFireAnimation(player, gunActor));
        return true;
    }

    private static emitGunFired(player: Player, fireMode: FireModeEnum, fireRate: number) {
        gameEvents.emit('gunFired', { shooter: player, fireMode, fireRate });
    }

    static fireFromRelease(player: Player, actor: ItemActor) {
        return this.fire(player, actor);
    }

    static emitGunFiredFromRelease(player: Player, fireMode: FireModeEnum, fireRate: number) {
        this.emitGunFired(player, fireMode, fireRate);
    }
}

const fullAutoFireTrigger = world.beforeEvents.itemUse.subscribe((ev) => {
    const player = ev.source;
    if (!entity_native_property(player, 'player:can_use_item')) return;

    const handItem = getPlayerHandItem(player);
    if (handItem === undefined || !ActorManager.isActor(handItem)) return;
    const actor = ActorManager.getActor(handItem) as ItemActor;
    if (!actor.hasComponent('gun')) return;

    const gunFireComp = actor.getComponent('gun_fire')!;
    const isReloading = entity_native_property(player, 'player:state.reload') === 'reloading';
    const releaseToFire = gunFireComp.release_to_fire;
    if (isReloading && !releaseToFire) return;

    GunFireSystem.startFiring(player, actor);
});

const semiAutoFireTrigger = world.afterEvents.itemReleaseUse.subscribe((ev) => {
    const pending = gunRuntimeState.consumePendingReleaseFire(ev.source.id);
    if (!pending) return;
    if (entity_native_property(ev.source, 'player:state.reload') === 'reloading') return;
    if (!GunRaiseSystem.isRaised(ev.source)) return;
    if (gunRuntimeState.isFireCoolingDown(ev.source.id)) return;

    if (GunFireSystem.fireFromRelease(ev.source, pending.actor)) {
        GunFireSystem.emitGunFiredFromRelease(ev.source, pending.fireMode, pending.fireRate);
    }

    const cooldownTaskId = system.runTimeout(() => gunRuntimeState.clearFireCooldown(ev.source.id), pending.fireRate);
    gunRuntimeState.startFireCooldown(ev.source.id, cooldownTaskId);
});

const stopFireTrigger = world.afterEvents.itemStopUse.subscribe((ev) => {
    gunRuntimeState.clearPendingReleaseFire(ev.source.id);
    gunRuntimeState.stopFiring(ev.source.id);
});

const cleanupTrigger = world.afterEvents.playerLeave.subscribe((ev) => {
    gunRuntimeState.cleanupPlayer(ev.playerId);
});
