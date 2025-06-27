import { world } from "@minecraft/server";
import { Glock17 } from "./modules/weapon/actors/item/Glock17";
import { set_entity_dynamic_property } from "./utils/Property";
import { TeamEnum } from "./modules/gameroom/types/TeamEnum";
import { HotbarManager } from "./modules/hotbar/Hotbar";

let hotbar: any;
world.afterEvents.chatSend.subscribe(ev => {
    const sender = ev.sender;
    
    // sender.getComponent('inventory')?.container.addItem(glock17.item);
    
    if (ev.message === 'test') {
        hotbar = HotbarManager.instance.getHotbar(sender);
        const glock17 = new Glock17();
        hotbar.setItem(0, glock17.item);
        hotbar.setItem(4, glock17.item);
        hotbar.setItem(7, glock17.item);
    }
    if (ev.message === 'send') {
        hotbar.send();
    }

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