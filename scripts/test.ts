import { world } from "@minecraft/server";
import { Glock17 } from "./modules/weapon/actors/item/Glock17";

world.afterEvents.chatSend.subscribe(ev => {
    const player = ev.sender;
    player.sendMessage('hello');
    
    const glock17 = new Glock17();
    player.getComponent('inventory')?.container.addItem(glock17.item);
})