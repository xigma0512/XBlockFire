import { ItemStack, Player, system } from "@minecraft/server";
import { ActorManager } from "./modules/gun_system/processors/ActorManager";
import { Glock17 } from "./modules/gun_system/actors/item/Glock17";

system.afterEvents.scriptEventReceive.subscribe(ev => {
    const player = ev.sourceEntity as Player;
    player.sendMessage('hello');

    const glock17 = new Glock17();
    ActorManager.setActor(glock17.item, glock17);

    player.getComponent('inventory')?.container.addItem(glock17.item);
})