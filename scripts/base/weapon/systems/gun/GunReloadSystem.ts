import { ActorManager } from "../ActorManager";
import { ItemActor } from "../../actors/Actor";
import { set_entity_native_property, entity_native_property } from "../../../../utils/Property";
import { getPlayerHandItem } from "../../../../utils/others/Entity";
import { progressBar } from "../../../../utils/others/Format";

import { Player, system, world } from "@minecraft/server";
import { GunAnimations } from "./GunAnimations";

class GunReloadSystem {

    private player: Player;
    private reloadTaskId: number = -1;

    constructor(player: Player) {
        this.player = player;
    }

    playerReload() {
        try 
        {
            const handItem = getPlayerHandItem(this.player);
            if (!handItem) throw 'player hand item is undefined.';
            
            if (!ActorManager.isActor(handItem)) throw 'hand item actor is undefined.';
            const actor = ActorManager.getActor(handItem) as ItemActor;
            
            if (!this.canReload(actor)) throw 'cannot reload now';
            
            this.startReload(actor);
        } 
        catch(err: any)
        {
            return this.failure();
        }
    }

    private startReload(actor: ItemActor) {
        const reloadComp = actor.getComponent('gun_reload')!;
        const reloadTime = reloadComp.reload_time;
        const startTick = system.currentTick;
        
        const progressBarTaskId = system.runInterval(() => {
            const progressBarStr = `${progressBar(reloadTime, system.currentTick - startTick, 30)}`;
            this.player.onScreenDisplay.setActionBar(progressBarStr);
        });

        this.reloadTaskId = system.runTimeout(() => {
            this.complete(actor);
            
            system.clearRun(progressBarTaskId);
            world.afterEvents.dataDrivenEntityTrigger.unsubscribe(failTriggerCallback);
        }, reloadTime);

        const failTriggerCallback = world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
            if (this.player.id === ev.entity.id && ev.eventId === 'property:state.reload.fail') {
                this.failure();

                system.clearRun(progressBarTaskId);
                world.afterEvents.dataDrivenEntityTrigger.unsubscribe(failTriggerCallback);
                this.player.stopSound(reloadComp.reload_sound ?? '');
            }
        });

        set_entity_native_property(this.player, 'player:state.reload', 'reloading');
        GunAnimations.playGunReloadAnimation(this.player, actor);
    }

    private canReload(actor: ItemActor) {
        const isReloading = entity_native_property(this.player, 'player:state.reload');
        if (isReloading === 'reloading') return false;

        const magazineComp = actor.getComponent('gun_magazine');
        if (!magazineComp) return false;

        return magazineComp.ammo < magazineComp.capacity && magazineComp.storageAmmo > 0;
    }

    private failure() {
        if (this.reloadTaskId !== -1) system.clearRun(this.reloadTaskId);

        set_entity_native_property(this.player, 'player:state.reload', 'fail');
    }

    private complete(actor: ItemActor) {
        const magazineComp = actor.getComponent('gun_magazine');
        if (!magazineComp) return this.failure();

        const ammoNeeded = magazineComp.capacity - magazineComp.ammo;
        const ammoToTransfer = Math.min(ammoNeeded, magazineComp.storageAmmo);

        magazineComp.ammo += ammoToTransfer;
        magazineComp.storageAmmo -= ammoToTransfer;
        
        set_entity_native_property(this.player, 'player:state.reload', 'success');
    }
}

world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
    if (ev.entity instanceof Player && ev.eventId === 'property:state.reload.pre_reload') {
        new GunReloadSystem(ev.entity).playerReload();
    }
});