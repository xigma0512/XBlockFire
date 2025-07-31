import { Player, system, world } from "@minecraft/server";

import { gameEvents } from "./EventEmitter";

world.afterEvents.entityDie.subscribe(ev => {
    if (!(ev.deadEntity instanceof Player)) return;
    const deadPlayer = ev.deadEntity;
    const source = ev.damageSource;
    const attacker = source.damagingEntity;
    system.runTimeout(() => gameEvents.emit('onPlayerKilled', { deadPlayer, attacker }), 5);
});