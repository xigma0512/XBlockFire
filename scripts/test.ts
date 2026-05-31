import { DisplaySlotId, system, world } from '@minecraft/server';
import { set_entity_native_property } from './utils/Property';
import { Deagle } from './modules/combat/weapon/actors/item/Deagle';
import { SG200 } from './modules/combat/weapon/actors/item/SG200';
import { AWP } from './modules/combat/weapon/actors/item/AWP';
import { P90 } from './modules/combat/weapon/actors/item/P90';

world.afterEvents.chatSend.subscribe((ev) => {
    if (ev.message === 'test') {
        const awp = new AWP();
        const p90 = new P90();
        ev.sender.getComponent('inventory')?.container.addItem(awp.item);
        ev.sender.getComponent('inventory')?.container.addItem(p90.item);
        set_entity_native_property(ev.sender, 'player:can_use_item', true);
    }
});
