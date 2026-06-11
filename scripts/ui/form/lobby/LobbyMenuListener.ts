import { system, world } from '@minecraft/server';
import { LOBBY_MENU_ITEM_ID } from '../../../modules/player/LobbyInventory';
import { LobbyMenu } from './LobbyMenu';

world.beforeEvents.itemUse.subscribe((ev) => {
    if (ev.itemStack.typeId !== LOBBY_MENU_ITEM_ID) return;
    const player = ev.source;
    system.run(() => LobbyMenu.open(player));
});
