import { entity_native_property } from "../../../../shared/utils/Property";
import { ItemActor } from "../../actors/Actor";

import { Player } from "@minecraft/server";

function getPlayerGunOffset(player: Player, gunActor: ItemActor) {
    const offsetComp = gunActor.getComponent('gun_offset')!;
    const isMoving = entity_native_property(player, 'player:is_moving');
    if (player.isSneaking) return offsetComp.scope;
    if (isMoving) return offsetComp.hipfire + offsetComp.movement;
    return offsetComp.hipfire;
}

export { getPlayerGunOffset };