import { ItemActor } from "../../actors/Actor";
import { ActorManager } from "../ActorManager";
import { BulletSystem } from "../bullet/BulletSystem";
import { getPlayerGunOffset } from "./GunOffsetSystem";

import { FireModeEnum } from "../../../../types/weapon/WeaponEnum";

import { getPlayerHandItem } from "../../../../utils/others/Entity";
import { entity_native_property } from "../../../../utils/Property";

import { Player, system, world } from "@minecraft/server";
import { ItemStopUseAfterEvent, PlayerHotbarSelectedSlotChangeAfterEvent, PlayerLeaveAfterEvent } from "@minecraft/server";

interface StopFiringListeners {
    afterItemStopUse: (ev: ItemStopUseAfterEvent) => void;
    afterPlayerHotbarSelected: (ev: PlayerHotbarSelectedSlotChangeAfterEvent) => void;
    afterPlayerLeave: (ev: PlayerLeaveAfterEvent) => void;
}

class GunFireSystem {

    private static _instance: GunFireSystem;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private _firingTask: Map<Player, number>;
    private _stopFiringCallback: Map<Player, StopFiringListeners>;
    private _cooldowns: Set<Player>;

    private constructor() {
        this._firingTask = new Map();
        this._stopFiringCallback = new Map();
        this._cooldowns = new Set();
    }

    startFiring(player: Player, gunActor: ItemActor) {
        const magazineComp = gunActor.getComponent('gun_magazine')!;
        if (magazineComp.ammo <= 0) return;
        
        const gunFireComp = gunActor.getComponent('gun_fire')!;

        switch(gunFireComp.fire_mode) {
            case FireModeEnum["Fully-Auto"]:
                this.fullAutoFire(player, gunActor);
                break;
            case FireModeEnum["Semi-Auto"]:
                this.semiAutoFire(player, gunActor);
                break;
        }

        this._stopFiringCallback.set(player, {
            afterItemStopUse: world.afterEvents.itemStopUse.subscribe((ev) => { 
                if (ev.source.id === player.id) this.stopFiringTrigger(player); 
            }),
            afterPlayerHotbarSelected: world.afterEvents.playerHotbarSelectedSlotChange.subscribe((ev) => {
                if (ev.player.id === player.id) this.stopFiringTrigger(player); 
            }),
            afterPlayerLeave: world.afterEvents.playerLeave.subscribe((ev) => {
                if (ev.playerId === player.id) this.stopFiringTrigger(player); 
            })
        });
    }

    private stopFiringTrigger(player: Player) {
        if (this._firingTask.has(player)) {
            const taskId = this._firingTask.get(player)!;
            system.clearRun(taskId);
            this._firingTask.delete(player);
        }

        if (this._stopFiringCallback.has(player)) {
            const callbacks = this._stopFiringCallback.get(player)!;
            
            world.afterEvents.itemStopUse.unsubscribe(callbacks.afterItemStopUse);
            world.afterEvents.playerHotbarSelectedSlotChange.unsubscribe(callbacks.afterPlayerHotbarSelected);
            world.afterEvents.playerLeave.unsubscribe(callbacks.afterPlayerLeave);

            this._stopFiringCallback.delete(player);   
        }
    }

    private fullAutoFire(player: Player, actor: ItemActor) {
        const gunFireComp = actor.getComponent('gun_fire')!;
        const fireRate = gunFireComp.fire_rate;

        this.fire(player, actor);
        const taskId = system.runInterval(() => this.fire(player, actor), fireRate);
        this._firingTask.set(player, taskId);
    }

    private semiAutoFire(player: Player, actor: ItemActor) {
        if (this._cooldowns.has(player)) return;

        const gunFireComp = actor.getComponent('gun_fire')!;
        const fireRate = gunFireComp.fire_rate;
                
        if (gunFireComp.release_to_fire) 
        {
            const callback = world.afterEvents.itemReleaseUse.subscribe(ev => {
                if (ev.source.id !== player.id) return;
                this.fire(player, actor);
                
                this._cooldowns.add(player);
                system.runTimeout(() => this._cooldowns.delete(player), fireRate);
                world.afterEvents.itemReleaseUse.unsubscribe(callback);
            });
        }
        else 
        {
            this.fire(player, actor);
            this._cooldowns.add(player);
            system.runTimeout(() => this._cooldowns.delete(player), fireRate);
        }
    }

    private fire(player: Player, gunActor: ItemActor) {
        const magazineComp = gunActor.getComponent('gun_magazine')!;
        if (magazineComp.ammo === 0) return;
        
        magazineComp.ammo --;

        const gunComp = gunActor.getComponent('gun')!;
        const gunFireComp = gunActor.getComponent('gun_fire')!;
        const shootOffset = getPlayerGunOffset(player, gunActor);
        
        for (let _ = 0; _ < gunFireComp.bullet_spread; _ ++) {
            BulletSystem.instance.spawnBullet(player, gunComp.gunTypeId, shootOffset);
        }
    }
}

const startFireTrigger = world.afterEvents.itemStartUse.subscribe(ev => {
    const player = ev.source;
    if (!entity_native_property(player, 'player:can_use_item')) return;
    
    const handItem = getPlayerHandItem(player);
    if (handItem === undefined) return;
    
    if (!ActorManager.isActor(handItem)) return;
    const actor = ActorManager.getActor(handItem) as ItemActor;

    if (handItem.hasTag('xblockfire:gun')) {
        GunFireSystem.instance.startFiring(player, actor);
    }
});