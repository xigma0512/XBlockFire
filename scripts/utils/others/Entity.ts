import { Player, Vector3, world } from "@minecraft/server";
import { EquipmentSlot, VanillaEntityIdentifier } from "@minecraft/server";

function getPlayerHandItem(player: Player) {
    return player.getComponent('equippable')!.getEquipmentSlot(EquipmentSlot.Mainhand).getItem();
}

function spawnDummyEntity(location: Vector3) {
    return world.getDimension('overworld').spawnEntity('xblockfire:dummy' as VanillaEntityIdentifier, location);
}

export { getPlayerHandItem, spawnDummyEntity };