import { ItemActor } from "../../actors/Actor";
import { ActorManager } from "../ActorManager";
import { getPlayerHandItem } from "../../../../utils/Utils";
import { FireModeEnum } from "../../types/Enums";

import { Player, system, world } from "@minecraft/server";
import { BulletSystem } from "./BulletSystem";
import { getPlayerGunOffset } from "./GunOffsetSystem";

class GunFireSystem {

    private static _instance: GunFireSystem;
    static get instance() { return (this._instance || (this._instance = new this())); }

    private _firingTask: Map<Player, number>;
    private _cooldowns: Set<Player>;

    private constructor() {
        this._firingTask = new Map();
        this._cooldowns = new Set();
    }

    startFiring(player: Player, gunActor: ItemActor) {
        const magazineComp = gunActor.getComponent('magazine')!;
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
    }

    stopFiring(player: Player) {
        const taskId = this._firingTask.get(player);
        if (taskId === undefined) return;
        system.clearRun(taskId);
        this._firingTask.delete(player);
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
        const magazineComp = gunActor.getComponent('magazine')!;
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
    
    const handItem = getPlayerHandItem(player);
    if (handItem === undefined) return;
        
    const result = ActorManager.getActor(handItem);
    if (!result.success) return;
    
    const actor = result.ret as ItemActor;

    if (handItem.hasTag('xblockfire:gun')) {
        GunFireSystem.instance.startFiring(player, actor);
    }
});

const stopFireTrigger = world.afterEvents.itemStopUse.subscribe(ev => {
    const player = ev.source;
    
    const handItem = getPlayerHandItem(player);
    if (handItem === undefined) return;

    if (handItem.hasTag('xblockfire:gun')) {
        GunFireSystem.instance.stopFiring(player);
    }
});
