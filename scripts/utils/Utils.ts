import { ColorTable, ColorType } from "./Color";

import { Player } from "@minecraft/server";
import { EquipmentSlot, DimensionLocation, VanillaEntityIdentifier } from "@minecraft/server";

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

function progressBar(duration: number, currentTime: number, barLength: number = 20, filledTag: string = '|', emptyTag: string = '|') {
    if (duration <= 0 || currentTime < 0 || currentTime > duration) return "Invalid progress bar parameters.";

    const progress = currentTime / duration;
    const filled = Math.round(progress * barLength);
    const empty = barLength - filled;

    const progressBar = `${ColorTable[ColorType.Green]}${filledTag.repeat(filled)}${ColorTable[ColorType.Gray]}${emptyTag.repeat(empty)}`;

    return progressBar;
}

export { randomUUID, getPlayerHandItem, spawnDummyEntity, progressBar };