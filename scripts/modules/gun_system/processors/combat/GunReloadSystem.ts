import { ActorManager } from "../ActorManager";
import { ItemActor } from "../../actors/Actor";
import { set_entity_native_property, entity_native_property } from "../../../../utils/Property";
import { getPlayerHandItem, progressBar } from "../../../../utils/Utils";
import { Player, system, world } from "@minecraft/server";

class GunReloadSystem {

    private player: Player;
    private reloadTaskId: number = -1;

    constructor(player: Player) {
        this.player = player;
    }

    playerReload() {
        const handItem = getPlayerHandItem(this.player);
        if (!handItem) return this.failure();

        const actorResult = ActorManager.getActor(handItem);
        if (!actorResult.success) return this.failure();

        const actor = actorResult.ret! as ItemActor;
        if (!this.canReload(actor)) return this.failure();

        const reloadComp = actor.getComponent('gun_reload');
        if (!reloadComp) return this.failure();

        this.startReloadTimer(actor, reloadComp.reload_time);
    }

    private startReloadTimer(actor: ItemActor, reloadTime: number) {
        
        const startTick = system.currentTick;
        
        const progressBarTaskId = system.runInterval(() => {
            const progressBarStr = `${progressBar(reloadTime, system.currentTick - startTick)}`;
            this.player.onScreenDisplay.setActionBar(progressBarStr);
        });

        this.reloadTaskId = system.runTimeout(() => {
            this.complete(actor);
            
            system.clearRun(progressBarTaskId);
            world.afterEvents.dataDrivenEntityTrigger.unsubscribe(failTriggerCallback);
        }, reloadTime);

        const failTriggerCallback = world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => {
            if (this.player.id === ev.entity.id && ev.eventId === 'trigger:reload_fail') {
                this.failure();

                system.clearRun(progressBarTaskId);
                world.afterEvents.dataDrivenEntityTrigger.unsubscribe(failTriggerCallback);
            }
        });
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
    if (ev.entity instanceof Player && ev.eventId === 'trigger:reloading') {
        new GunReloadSystem(ev.entity).playerReload();
    }
});