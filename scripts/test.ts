import { world } from "@minecraft/server";
import { set_entity_dynamic_property, set_entity_native_property } from "./utils/Property";
import { AK47 } from "./base/weapon/actors/item/AK47";
import { M4A4 } from "./base/weapon/actors/item/M4A4";
import { TeamEnum } from "./types/TeamEnum";
import { Glock17 } from "./base/weapon/actors/item/Glock17";
import { Deagle } from "./base/weapon/actors/item/Deagle";

world.afterEvents.chatSend.subscribe(ev => {
    if (ev.message === 'test') {
        const deagle = new Deagle();
        ev.sender.getComponent('inventory')?.container.addItem(deagle.item);
        set_entity_native_property(ev.sender, 'player:can_use_item', true);
    }
})