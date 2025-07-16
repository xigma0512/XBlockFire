import { ItemActor } from "../../actors/Actor";
import { ActorManager } from "../ActorManager";
import { BulletSystem } from "../bullet/BulletSystem";
import { getPlayerGunOffset } from "./GunOffsetSystem";
import { GunAnimations } from "./GunAnimations";

import { FireModeEnum } from "../../../../types/weapon/WeaponEnum";

import { getPlayerHandItem } from "../../../../utils/others/Entity";
import { entity_native_property } from "../../../../utils/Property";

import { Player, system, world } from "@minecraft/server";

class _GunFireSystem {

    private static _instance: _GunFireSystem;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private _cooldowns: Set<Player>;

    private constructor() {
        this._cooldowns = new Set();
    }

    startFiring(player: Player, gunActor: ItemActor) {
        const gunFireComp = gunActor.getComponent('gun_fire')!;

        switch(gunFireComp.fire_mode) {
            case FireModeEnum["Fully-Auto"]:
                this.fullAutoFire(player, gunActor);
                break;
            case FireModeEnum["Semi-Auto"]:
                this.semiAutoFire(player, gunActor);
                break;
        }
    }

    private fullAutoFire(player: Player, actor: ItemActor) {
        if (this._cooldowns.has(player)) return;

        const gunFireComp = actor.getComponent('gun_fire')!;
        const fireRate = gunFireComp.fire_rate;

        this.fire(player, actor);
        const taskId = system.runInterval(() => this.fire(player, actor), fireRate);
        this._cooldowns.add(player);
        system.runTimeout(() => this._cooldowns.delete(player), fireRate);
        
        this.stopFiringTrigger(player, taskId);
    }

    private semiAutoFire(player: Player, actor: ItemActor) {
        
        const gunFireComp = actor.getComponent('gun_fire')!;
        const fireRate = gunFireComp.fire_rate;
        
        if (gunFireComp.release_to_fire) 
        {
            const callback = world.afterEvents.itemReleaseUse.subscribe(ev => {
                if (!this._cooldowns.has(player) && ev.source.id === player.id) {
                    this.fire(player, actor);
                    
                    this._cooldowns.add(player);
                    system.runTimeout(() => this._cooldowns.delete(player), fireRate);
                }
                world.afterEvents.itemReleaseUse.unsubscribe(callback);
            });
        }
        else 
        {
            if (this._cooldowns.has(player)) return;

            this.fire(player, actor);
            this._cooldowns.add(player);
            system.runTimeout(() => this._cooldowns.delete(player), fireRate);
        }
    }

    private fire(player: Player, gunActor: ItemActor) {
        const magazineComp = gunActor.getComponent('gun_magazine')!;
        if (magazineComp.ammo <= 0) {
            player.playSound('xblockfire.empty_gun');
            return;
        }
        
        magazineComp.ammo --;

        const gunComp = gunActor.getComponent('gun')!;
        const gunFireComp = gunActor.getComponent('gun_fire')!;
        const shootOffset = getPlayerGunOffset(player, gunActor);
        
        for (let _ = 0; _ < gunFireComp.bullet_spread; _ ++) {
            BulletSystem.spawnBullet(player, gunComp.gunTypeId, shootOffset);
        }

        GunAnimations.playerGunFireAnimation(player, gunActor);
    }

    private stopFiringTrigger(player: Player, firingTaskId: number) {

        const afterItemStopUse = world.afterEvents.itemStopUse.subscribe((ev) => { 
            if (ev.source.id === player.id) stopFire(); 
        });
        const afterPlayerHotbarSelected = world.afterEvents.playerHotbarSelectedSlotChange.subscribe((ev) => {
            if (ev.player.id === player.id) stopFire(); 
        });
        const afterPlayerLeave = world.afterEvents.playerLeave.subscribe((ev) => {
            if (ev.playerId === player.id) stopFire(); 
        });

        const stopFire = () => {
            system.clearRun(firingTaskId);

            world.afterEvents.itemStopUse.unsubscribe(afterItemStopUse);
            world.afterEvents.playerHotbarSelectedSlotChange.unsubscribe(afterPlayerHotbarSelected);
            world.afterEvents.playerLeave.unsubscribe(afterPlayerLeave);
        }
    }
}

const GunFireSystem = _GunFireSystem.instance;

const startFireTrigger = world.afterEvents.itemStartUse.subscribe(ev => {
    const player = ev.source;
    if (!entity_native_property(player, 'player:can_use_item')) return;

    const isReloading = entity_native_property(player, 'player:state.reload');
    if (isReloading === 'reloading') return;
    
    const handItem = getPlayerHandItem(player);
    if (handItem === undefined || !ActorManager.isActor(handItem)) return;
    const actor = ActorManager.getActor(handItem) as ItemActor;

    if (actor.hasComponent('gun')) {
        GunFireSystem.startFiring(player, actor);
    }
});