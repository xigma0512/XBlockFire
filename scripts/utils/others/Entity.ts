import { Player } from "@minecraft/server";
import { EquipmentSlot, DimensionLocation, VanillaEntityIdentifier } from "@minecraft/server";

function getPlayerHandItem(player: Player) {
    return player.getComponent('equippable')!.getEquipmentSlot(EquipmentSlot.Mainhand).getItem();
}

function spawnDummyEntity(dimLocation: DimensionLocation) {
    return dimLocation.dimension.spawnEntity('xblockfire:dummy' as VanillaEntityIdentifier, dimLocation);
}

export { getPlayerHandItem, spawnDummyEntity };