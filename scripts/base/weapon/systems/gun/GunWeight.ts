import { system, world } from "@minecraft/server";
import { ActorManager } from "../ActorManager";

system.run(() => {
    world.afterEvents.playerHotbarSelectedSlotChange.subscribe(ev => {
        const movement = ev.player.getComponent('movement')!;
        let weight = movement.defaultValue;

        if (ev.itemStack && ActorManager.isActor(ev.itemStack)) {
            const actor = ActorManager.getActor(ev.itemStack)!;
            
            if (actor.hasComponent('item_weight')) {
                weight = actor.getComponent('item_weight')!.weight;
            }
        } 
        ev.player.getComponent('movement')?.setCurrentValue(weight);
    });
});