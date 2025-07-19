import { Player } from "@minecraft/server";
import { EquipmentSlot } from "@minecraft/server";

function getPlayerHandItem(player: Player) {
    return player.getComponent('equippable')!.getEquipmentSlot(EquipmentSlot.Mainhand).getItem();
}

export { getPlayerHandItem };