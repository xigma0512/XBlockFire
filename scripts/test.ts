import { system, world } from "@minecraft/server";
import { Glock17 } from "./modules/weapon/actors/item/Glock17";
import { set_entity_dynamic_property } from "./utils/Property";
import { TeamEnum } from "./types/TeamEnum";
import { HotbarManager } from "./modules/hotbar/Hotbar";
import { Shop } from "./modules/shop/Shop";

world.beforeEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId !== 'minecraft:feather') return;
    system.run(() => {
        Shop.instance.openShop(ev.source);
    })
})

world.afterEvents.chatSend.subscribe(ev => {
    const sender = ev.sender;
    
    // sender.getComponent('inventory')?.container.addItem(glock17.item);

    if (ev.message === '1') {
        for(const player of world.getAllPlayers()) {
            set_entity_dynamic_property(player, 'player:team', TeamEnum.Attacker);
        }
        sender.sendMessage('1 ok');
    }
    if (ev.message === '2') {
        set_entity_dynamic_property(sender, 'player:team', TeamEnum.Defender);
        sender.sendMessage('2 ok')
    }
})