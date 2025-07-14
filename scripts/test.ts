import { world } from "@minecraft/server";
import { set_entity_native_property } from "./utils/Property";
import { Deagle } from "./base/weapon/actors/item/Deagle";
import { SG200 } from "./base/weapon/actors/item/SG200";
import { AWP } from "./base/weapon/actors/item/AWP";

world.afterEvents.chatSend.subscribe(ev => {
    if (ev.message === 'test') {
        const deagle = new Deagle();
        const sg200 = new SG200();
        const awp = new AWP();
        ev.sender.getComponent('inventory')?.container.addItem(deagle.item);
        ev.sender.getComponent('inventory')?.container.addItem(sg200.item);
        ev.sender.getComponent('inventory')?.container.addItem(awp.item);
        set_entity_native_property(ev.sender, 'player:can_use_item', true);
    }
})