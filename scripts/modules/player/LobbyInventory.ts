import { ItemStack, Player } from '@minecraft/server';

export const LOBBY_MENU_ITEM_ID = 'minecraft:compass';
export const LOBBY_MENU_SLOT = 8;

export function setupLobbyPlayer(player: Player) {
    const container = player.getComponent('inventory')?.container;
    if (!container) return;

    container.clearAll();

    const menuItem = new ItemStack(LOBBY_MENU_ITEM_ID);
    menuItem.nameTag = 'Game Menu';
    container.setItem(LOBBY_MENU_SLOT, menuItem);
}
