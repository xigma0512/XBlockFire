import { world } from "@minecraft/server";
import { set_entity_dynamic_property, set_entity_native_property } from "./utils/Property";
import { AK47 } from "./base/weapon/actors/item/AK47";
import { M4A4 } from "./base/weapon/actors/item/M4A4";
import { TeamEnum } from "./types/TeamEnum";

world.afterEvents.chatSend.subscribe(ev => {
    set_entity_native_property(ev.sender, 'player:can_use_item', true);
    const ak = new AK47();
    const m4 = new M4A4();
    ev.sender.getComponent('inventory')?.container.addItem(ak.item);
    ev.sender.getComponent('inventory')?.container.addItem(m4.item);
    for (const player of world.getAllPlayers()) {
        set_entity_dynamic_property(player, 'player:team', TeamEnum.Attacker);
    }
})