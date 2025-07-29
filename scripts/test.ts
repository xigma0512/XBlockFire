import { world } from "@minecraft/server";
import { Deagle } from "./domain/weapon/actors/item/Deagle";
import { SG200 } from "./domain/weapon/actors/item/SG200";
import { AWP } from "./domain/weapon/actors/item/AWP";
import { P90 } from "./domain/weapon/actors/item/P90";
import { set_entity_native_property } from "./infrastructure/data/Property";

world.afterEvents.chatSend.subscribe(ev => {
    if (ev.message === 'test') {
        const deagle = new Deagle();
        const sg200 = new SG200();
        const awp = new AWP();
        const p90 = new P90();
        ev.sender.getComponent('inventory')?.container.addItem(deagle.item);
        ev.sender.getComponent('inventory')?.container.addItem(sg200.item);
        ev.sender.getComponent('inventory')?.container.addItem(awp.item);
        ev.sender.getComponent('inventory')?.container.addItem(p90.item);
        set_entity_native_property(ev.sender, 'player:can_use_item', true);
    }
})