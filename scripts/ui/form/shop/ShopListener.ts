import { world } from '@minecraft/server';
import { gameroom } from '../../../modules/core/GameRoom';
import { MemberManager } from '../../../modules/player/MemberManager';

world.beforeEvents.itemUse.subscribe((ev) => {
    if (ev.itemStack.typeId !== 'minecraft:feather') return;

    const player = ev.source;
    if (!MemberManager.includePlayer(player)) return;

    gameroom().activeMode.openShop?.(player);
});
