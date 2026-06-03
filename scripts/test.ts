import { system, world } from '@minecraft/server';
import { set_entity_native_property } from './utils/Property';
import { AWP } from './modules/combat/weapon/actors/item/AWP';
import { P90 } from './modules/combat/weapon/actors/item/P90';
import { AK47 } from './modules/combat/weapon/actors/item/AK47';
import { M4A4 } from './modules/combat/weapon/actors/item/M4A4';
import { Glock17 } from './modules/combat/weapon/actors/item/Glock17';

world.afterEvents.chatSend.subscribe((ev) => {
    if (ev.message === 'test') {
        const awp = new AWP();
        const p90 = new P90();
        const ak47 = new AK47();
        const m4a4 = new M4A4();
        const glock17 = new Glock17();
        ev.sender.getComponent('inventory')?.container.addItem(awp.item);
        ev.sender.getComponent('inventory')?.container.addItem(p90.item);
        ev.sender.getComponent('inventory')?.container.addItem(ak47.item);
        ev.sender.getComponent('inventory')?.container.addItem(m4a4.item);
        ev.sender.getComponent('inventory')?.container.addItem(glock17.item);

        set_entity_native_property(ev.sender, 'player:can_use_item', true);
    }
    if (ev.message === 'cd') {
        if (ev.sender.getItemCooldown('Cooldown')) return ev.sender.sendMessage('still cd');
        ev.sender.startItemCooldown('Cooldown', 200);
        ev.sender.sendMessage('success');
    }
});

// system.runInterval(() => {
//     for(const player of world.getAllPlayers()) {
//         player.onScreenDisplay.setActionBar(player.getItemCooldown('Cooldown').toString());
//     }
// }, 1)
