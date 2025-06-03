import { Player, VanillaEntityIdentifier } from "@minecraft/server";
import { EquipmentSlot, DimensionLocation } from "@minecraft/server";

function randomUUID() {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getPlayerHandItem(player: Player) {
    return player.getComponent('equippable')!.getEquipmentSlot(EquipmentSlot.Mainhand).getItem();
}

function spawnDummyEntity(dimLocation: DimensionLocation) {
    return dimLocation.dimension.spawnEntity('xblockfire:dummy' as VanillaEntityIdentifier, dimLocation);
}

export { randomUUID, getPlayerHandItem, spawnDummyEntity };