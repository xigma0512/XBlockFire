import { MemberManager } from "../../base/gameroom/member/MemberManager";
import { gameEvents } from "../../event/EventEmitter";

import { set_entity_dynamic_property } from "../../utils/Property";
import { GameMode, Player, system, world } from "@minecraft/server";

world.afterEvents.entityDie.subscribe(ev => {
    if (!(ev.deadEntity instanceof Player) || !MemberManager.isInRoom(ev.deadEntity)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('playerDied', { deadPlayer, attacker }), 3);
})

gameEvents.subscribe('playerDied', (ev) => {
    if (!MemberManager.isInRoom(ev.deadPlayer)) return;

    const deadPlayer = ev.deadPlayer;
    set_entity_dynamic_property(deadPlayer, 'player:is_alive', false);
    deadPlayer.getComponent('inventory')?.container.clearAll();
    deadPlayer.setGameMode(GameMode.Spectator);
});