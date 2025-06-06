import { system, world } from "@minecraft/server";
import { Glock17 } from "./modules/weapon/actors/item/Glock17";
import { set_entity_dynamic_property } from "./utils/Property";
import { TeamTagEnum } from "./modules/weapon/types/Enums";

world.afterEvents.chatSend.subscribe(ev => {
    const player = ev.sender;
    if (ev.message === 'test') {
        const glock17 = new Glock17();
        player.getComponent('inventory')?.container.addItem(glock17.item);
        player.sendMessage('test');
    }
    if (ev.message === 'team') {
        set_entity_dynamic_property(ev.sender, 'player:team', TeamTagEnum.Attacker);
        for (const p of world.getPlayers({excludeNames: [ev.sender.name]})) {
            set_entity_dynamic_property(p, 'player:team', TeamTagEnum.Defenders);
        }
        player.sendMessage('team');
    }
})

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (player.selectedSlotIndex === 8) {
            player.setProperty('player:crawl', !player.getProperty('player:crawl'));
            player.selectedSlotIndex = 0;
        }
    }
})