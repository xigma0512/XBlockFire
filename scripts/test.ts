import { world } from "@minecraft/server";
import { Glock17 } from "./modules/weapon/actors/item/Glock17";
import { set_entity_dynamic_property } from "./utils/Property";
import { BP_TeamEnum } from "./modules/gameroom/systems/phase/TeamEnum";

world.afterEvents.chatSend.subscribe(ev => {
    const sender = ev.sender;
    
    const glock17 = new Glock17();
    sender.getComponent('inventory')?.container.addItem(glock17.item);

    if (ev.message === '1') {
        for(const player of world.getAllPlayers()) {
            set_entity_dynamic_property(player, 'player:team', BP_TeamEnum.Attacker);
        }
        sender.sendMessage('1 ok');
    }
    if (ev.message === '2') {
        set_entity_dynamic_property(sender, 'player:team', BP_TeamEnum.Defender);
        sender.sendMessage('2 ok')
    }
})